import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Mail, Phone, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

interface CustomerWithProfile {
  id: string;
  user_id: string;
  status: string;
  subscription_type: string | null;
  subscription_start_date: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
    profile_image_url: string | null;
  } | null;
}

const statusColors: Record<string, string> = {
  active: 'bg-success/20 text-success border-success/30',
  inactive: 'bg-muted text-muted-foreground border-border',
  on_hold: 'bg-accent/20 text-accent-foreground border-accent/30',
  completed: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
};

const statusLabels: Record<string, string> = {
  active: 'Aktiv',
  inactive: 'Inaktiv',
  on_hold: 'På pause',
  completed: 'Afsluttet',
};

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    email: '',
    fullName: '',
    phone: '',
    subscriptionType: '',
    notes: '',
  });

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

    // Fetch profiles separately
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

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.profile?.full_name?.toLowerCase() || '';
    const email = customer.profile?.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gradient-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Ny Klient
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tilføj Ny Klient</DialogTitle>
                <DialogDescription>
                  Opret en ny klient i dit CRM system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Fulde navn</Label>
                  <Input
                    id="fullName"
                    value={newCustomer.fullName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
                    className="rounded-xl"
                    placeholder="Klientens navn"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="rounded-xl"
                    placeholder="klient@email.dk"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="rounded-xl"
                    placeholder="+45 12 34 56 78"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscriptionType">Abonnementstype</Label>
                  <Select
                    value={newCustomer.subscriptionType}
                    onValueChange={(value) => setNewCustomer({ ...newCustomer, subscriptionType: value })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Vælg type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basis</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Noter</Label>
                  <Textarea
                    id="notes"
                    value={newCustomer.notes}
                    onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                    className="rounded-xl"
                    placeholder="Eventuelle noter om klienten..."
                  />
                </div>
                <Button className="w-full rounded-xl gradient-primary text-primary-foreground">
                  Opret Klient
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Søg efter klienter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl pl-10"
          />
        </div>

        {/* Customers Table */}
        <Card className="rounded-2xl border-border shadow-card overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Klient</TableHead>
                  <TableHead className="font-semibold">Kontakt</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Abonnement</TableHead>
                  <TableHead className="font-semibold">Oprettet</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Henter klienter...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'Ingen klienter matcher din søgning' : 'Ingen klienter endnu'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={customer.profile?.profile_image_url || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(customer.profile?.full_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {customer.profile?.full_name || 'Ukendt'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {customer.profile?.email || '-'}
                          </div>
                          {customer.profile?.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {customer.profile.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[customer.status]} border`}>
                          {statusLabels[customer.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {customer.subscription_type || '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(customer.created_at), 'd. MMM yyyy', { locale: da })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
