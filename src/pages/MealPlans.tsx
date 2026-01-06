import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateMealPlanModal, MealPlanFormData } from '@/components/meal-plans/CreateMealPlanModal';
import { MealPlanBuilder } from '@/components/meal-plans/MealPlanBuilder';
import { Plus, Search, UtensilsCrossed, Calendar, Flame, Edit, Copy, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, isBefore, isWithinInterval, addDays } from 'date-fns';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MealPlanWithCustomer {
  id: string;
  name: string;
  week_number: number;
  start_date: string;
  end_date: string;
  daily_calories: number | null;
  notes: string | null;
  customer_id: string;
  created_at: string;
  customer: {
    id: string;
    user_id: string;
    profile: {
      full_name: string;
      profile_image_url: string | null;
    } | null;
  } | null;
}

interface Customer {
  id: string;
  user_id: string;
  profile: {
    full_name: string;
    email: string;
    profile_image_url: string | null;
  } | null;
}

const filterOptions = [
  { value: 'all', label: 'Alle' },
  { value: 'active', label: 'Aktive' },
  { value: 'upcoming', label: 'Kommende' },
  { value: 'expired', label: 'Udløbet' },
];

export default function MealPlans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const [mealPlans, setMealPlans] = useState<MealPlanWithCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderData, setBuilderData] = useState<{
    planId?: string;
    customerId: string;
    customerName: string;
    customerImage?: string;
    planName: string;
    weekNumber: number;
    dailyCalories: number;
  } | null>(null);

  useEffect(() => {
    fetchMealPlans();
    fetchCustomers();
  }, []);

  const fetchMealPlans = async () => {
    setLoading(true);
    const { data: plansData } = await supabase
      .from('meal_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (plansData && plansData.length > 0) {
      const customerIds = [...new Set(plansData.map(p => p.customer_id))];
      const { data: customersData } = await supabase
        .from('customers')
        .select('id, user_id')
        .in('id', customerIds);

      const userIds = customersData?.map(c => c.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image_url')
        .in('id', userIds);

      const plansWithCustomers = plansData.map(plan => {
        const customerRecord = customersData?.find(c => c.id === plan.customer_id);
        const profile = profiles?.find(p => p.id === customerRecord?.user_id);
        return {
          ...plan,
          customer: customerRecord ? {
            ...customerRecord,
            profile: profile || null
          } : null
        };
      });
      setMealPlans(plansWithCustomers as MealPlanWithCustomer[]);
    } else {
      setMealPlans([]);
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('id, user_id')
      .eq('status', 'active');

    if (data && data.length > 0) {
      const userIds = data.map(c => c.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, profile_image_url')
        .in('id', userIds);

      const customersWithProfiles = data.map(customer => ({
        ...customer,
        profile: profiles?.find(p => p.id === customer.user_id) || null
      }));
      setCustomers(customersWithProfiles as Customer[]);
    }
  };

  const getStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isBefore(now, start)) return 'upcoming';
    if (isAfter(now, end)) return 'expired';
    return 'active';
  };

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: 'Aktiv', className: 'bg-success/20 text-success border-success/30' },
    upcoming: { label: 'Kommende', className: 'bg-primary/20 text-primary border-primary/30' },
    expired: { label: 'Udløbet', className: 'bg-muted text-muted-foreground border-border' },
  };

  const filteredPlans = mealPlans
    .filter(plan => {
      // Search filter
      const customerName = plan.customer?.profile?.full_name?.toLowerCase() || '';
      const planName = plan.name.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = customerName.includes(query) || planName.includes(query);

      // Status filter
      const status = getStatus(plan.start_date, plan.end_date);
      const matchesFilter = activeFilter === 'all' || status === activeFilter;

      return matchesSearch && matchesFilter;
    });

  const handleContinueToBuilder = async (formData: MealPlanFormData) => {
    const customer = customers.find(c => c.id === formData.customer_id);
    
    // Create the meal plan in the database first
    const { data: newPlan, error } = await supabase
      .from('meal_plans')
      .insert({
        customer_id: formData.customer_id,
        name: formData.name,
        week_number: formData.week_number,
        start_date: format(formData.start_date, 'yyyy-MM-dd'),
        end_date: format(formData.end_date, 'yyyy-MM-dd'),
        daily_calories: formData.daily_calories,
        notes: formData.notes,
        created_by: user?.id,
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fejl',
        description: 'Kunne ikke oprette kostplan',
      });
      return;
    }

    setBuilderData({
      planId: newPlan.id,
      customerId: formData.customer_id,
      customerName: customer?.profile?.full_name || 'Ukendt',
      customerImage: customer?.profile?.profile_image_url || undefined,
      planName: formData.name,
      weekNumber: formData.week_number,
      dailyCalories: formData.daily_calories,
    });
    
    setIsCreateModalOpen(false);
    setIsBuilderOpen(true);
  };

  const handleSaveMeals = async (meals: any[]) => {
    if (!builderData?.planId) return;

    // Delete existing items
    await supabase
      .from('meal_plan_items')
      .delete()
      .eq('meal_plan_id', builderData.planId);

    // Insert new items
    const mealItems = meals.flatMap((dayMeals, dayIndex) => 
      Object.entries(dayMeals)
        .filter(([_, meal]) => meal !== null)
        .map(([mealType, meal]: [string, any]) => ({
          meal_plan_id: builderData.planId,
          day_of_week: dayIndex + 1,
          meal_type: mealType,
          recipe_name: meal.recipe_name,
          calories: meal.calories,
          protein_g: meal.protein_g,
          carbs_g: meal.carbs_g,
          fat_g: meal.fat_g,
          instructions: meal.instructions,
        }))
    );

    if (mealItems.length > 0) {
      await supabase
        .from('meal_plan_items')
        .insert(mealItems);
    }

    fetchMealPlans();
  };

  const handleCloseBuilder = () => {
    setIsBuilderOpen(false);
    setBuilderData(null);
    fetchMealPlans();
  };

  const handleEditPlan = async (plan: MealPlanWithCustomer) => {
    // Fetch existing meal items
    const { data: items } = await supabase
      .from('meal_plan_items')
      .select('*')
      .eq('meal_plan_id', plan.id);

    // Convert to the meals array format
    const meals = Array(7).fill(null).map(() => ({
      breakfast: null as any,
      lunch: null as any,
      dinner: null as any,
      snack: null as any,
    }));

    items?.forEach(item => {
      const dayIndex = item.day_of_week - 1;
      if (dayIndex >= 0 && dayIndex < 7) {
        meals[dayIndex][item.meal_type as keyof typeof meals[0]] = {
          id: item.id,
          recipe_name: item.recipe_name,
          calories: item.calories || 0,
          protein_g: item.protein_g || 0,
          carbs_g: item.carbs_g || 0,
          fat_g: item.fat_g || 0,
          instructions: item.instructions || '',
        };
      }
    });

    setBuilderData({
      planId: plan.id,
      customerId: plan.customer_id,
      customerName: plan.customer?.profile?.full_name || 'Ukendt',
      customerImage: plan.customer?.profile?.profile_image_url || undefined,
      planName: plan.name,
      weekNumber: plan.week_number,
      dailyCalories: plan.daily_calories || 2000,
    });
    setIsBuilderOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Show builder if open
  if (isBuilderOpen && builderData) {
    return (
      <MealPlanBuilder
        planId={builderData.planId}
        customerId={builderData.customerId}
        customerName={builderData.customerName}
        customerImage={builderData.customerImage}
        planName={builderData.planName}
        weekNumber={builderData.weekNumber}
        dailyCalories={builderData.dailyCalories}
        onClose={handleCloseBuilder}
        onSave={handleSaveMeals}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Måltidsplaner</h1>
            <p className="text-muted-foreground">Opret og administrer kostplaner for dine klienter</p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-xl gradient-primary text-white shadow-lg hover:shadow-hover transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Opret Måltidsplan
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Søg efter kunde eller plan navn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl bg-input border-border pl-10 focus:border-primary"
            />
          </div>

          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-40 rounded-xl bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Meal Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
              <UtensilsCrossed className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery || activeFilter !== 'all' ? 'Ingen kostplaner fundet' : 'Ingen kostplaner endnu'}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchQuery || activeFilter !== 'all'
                ? 'Prøv at justere din søgning eller filtre'
                : 'Opret din første kostplan for at komme i gang'}
            </p>
            {!searchQuery && activeFilter === 'all' && (
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-xl gradient-primary text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Opret din første kostplan
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map((plan) => {
              const status = getStatus(plan.start_date, plan.end_date);
              const statusInfo = statusConfig[status];

              return (
                <Card 
                  key={plan.id}
                  className="group relative overflow-hidden rounded-2xl border-border bg-card shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1"
                >
                  {/* Orange left border */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 gradient-primary" />
                  
                  <CardContent className="p-5 pl-6">
                    {/* Customer Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={plan.customer?.profile?.profile_image_url || ''} />
                        <AvatarFallback className="gradient-primary text-white text-sm">
                          {getInitials(plan.customer?.profile?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {plan.customer?.profile?.full_name || 'Ukendt'}
                        </p>
                      </div>
                      <Badge className={cn("border", statusInfo.className)}>
                        {statusInfo.label}
                      </Badge>
                    </div>

                    {/* Plan Info */}
                    <h3 className="font-semibold text-foreground mb-2">{plan.name}</h3>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        Uge {plan.week_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>
                        {format(new Date(plan.start_date), 'd. MMM', { locale: da })} - {format(new Date(plan.end_date), 'd. MMM', { locale: da })}
                      </span>
                    </div>

                    {plan.daily_calories && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Flame className="h-4 w-4 text-primary" />
                        <span>{plan.daily_calories} kcal/dag</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPlan(plan)}
                        className="flex-1 rounded-lg border-primary/50 text-primary hover:bg-primary/10"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Rediger
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateMealPlanModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onContinue={handleContinueToBuilder}
        customers={customers}
      />
    </DashboardLayout>
  );
}
