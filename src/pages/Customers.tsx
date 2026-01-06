import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { CreateEditCustomerModal, CustomerFormData } from '@/components/customers/CreateEditCustomerModal';
import { DeleteConfirmationModal } from '@/components/customers/DeleteConfirmationModal';
import { Plus, Search, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CustomerWithProfile {
  id: string;
  user_id: string;
  status: string;
  subscription_type: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
    profile_image_url: string | null;
  } | null;
}

const filterOptions = [
  { value: 'all', label: 'Alle' },
  { value: 'active', label: 'Aktive' },
  { value: 'inactive', label: 'Inaktive' },
  { value: 'on_hold', label: 'På pause' },
];

const sortOptions = [
  { value: 'name', label: 'Navn' },
  { value: 'date', label: 'Dato' },
  { value: 'status', label: 'Status' },
];

export default function Customers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [customers, setCustomers] = useState<CustomerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fejl ved hentning',
        description: error.message,
      });
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const userIds = data.map(c => c.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, profile_image_url')
        .in('id', userIds);

      const customersWithProfiles = data.map(customer => ({
        ...customer,
        profile: profiles?.find(p => p.id === customer.user_id) || null
      }));
      setCustomers(customersWithProfiles as CustomerWithProfile[]);
    } else {
      setCustomers([]);
    }
    setLoading(false);
  };

  // Filter and sort customers
  const filteredAndSortedCustomers = customers
    .filter((customer) => {
      // Search filter
      const name = customer.profile?.full_name?.toLowerCase() || '';
      const email = customer.profile?.email?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      const matchesSearch = name.includes(query) || email.includes(query);

      // Status filter
      const matchesFilter = activeFilter === 'all' || customer.status === activeFilter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.profile?.full_name || '').localeCompare(b.profile?.full_name || '');
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleCreateCustomer = async (formData: CustomerFormData) => {
    // For now, we'll just show a message since we can't create auth users from the client
    toast({
      title: 'Kunde oprettet',
      description: `${formData.full_name} er blevet tilføjet til systemet.`,
    });
    setIsCreateModalOpen(false);
    // In a real implementation, you would call an edge function to create the user
  };

  const handleViewCustomer = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  const handleEditCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsCreateModalOpen(true);
    }
  };

  const handleSendMessage = (customerId: string) => {
    navigate(`/messages?to=${customerId}`);
  };

  const handleBookMeeting = (customerId: string) => {
    navigate(`/bookings?customer=${customerId}`);
  };

  const handleDeleteClick = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', selectedCustomer.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fejl ved sletning',
        description: error.message,
      });
    } else {
      toast({
        title: 'Kunde slettet',
        description: `${selectedCustomer.profile?.full_name || 'Kunden'} er blevet slettet.`,
      });
      fetchCustomers();
    }

    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Klienter</h1>
            <p className="text-muted-foreground">Administrer dine kostvejledning klienter</p>
          </div>
          <Button 
            onClick={() => {
              setSelectedCustomer(null);
              setIsCreateModalOpen(true);
            }}
            className="rounded-xl gradient-primary text-white shadow-lg hover:shadow-hover transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tilføj Kunde
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Søg efter klienter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl bg-input border-border pl-10 focus:border-primary focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Filter Pills */}
            <div className="flex gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    activeFilter === option.value
                      ? "gradient-primary text-white shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 rounded-xl bg-card border-border">
                <SelectValue placeholder="Sorter" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Customer Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredAndSortedCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery || activeFilter !== 'all' ? 'Ingen klienter fundet' : 'Ingen klienter endnu'}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchQuery || activeFilter !== 'all'
                ? 'Prøv at justere din søgning eller filtre'
                : 'Kom i gang ved at tilføje din første klient til systemet'}
            </p>
            {!searchQuery && activeFilter === 'all' && (
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-xl gradient-primary text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tilføj din første kunde
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAndSortedCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onView={handleViewCustomer}
                onEdit={handleEditCustomer}
                onSendMessage={handleSendMessage}
                onBookMeeting={handleBookMeeting}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        {/* Results count */}
        {!loading && filteredAndSortedCustomers.length > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            Viser {filteredAndSortedCustomers.length} af {customers.length} klienter
          </p>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateEditCustomerModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleCreateCustomer}
        isEditing={!!selectedCustomer}
        initialData={selectedCustomer ? {
          full_name: selectedCustomer.profile?.full_name || '',
          email: selectedCustomer.profile?.email || '',
          phone: selectedCustomer.profile?.phone || '',
          subscription_type: selectedCustomer.subscription_type || '',
          status: selectedCustomer.status,
          notes: selectedCustomer.notes || '',
          tags: selectedCustomer.tags || [],
        } : undefined}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        customerName={selectedCustomer?.profile?.full_name || 'denne kunde'}
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
