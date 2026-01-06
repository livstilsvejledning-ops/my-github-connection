import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, UtensilsCrossed, Calendar, Flame, Beef, Apple, Droplet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

interface MealPlanWithCustomer {
  id: string;
  name: string;
  week_number: number;
  start_date: string;
  end_date: string;
  daily_calories: number | null;
  notes: string | null;
  created_at: string;
  customer: {
    profile: {
      full_name: string;
    } | null;
  } | null;
}

export default function MealPlans() {
  const [mealPlans, setMealPlans] = useState<MealPlanWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    setLoading(true);
    const { data: plansData } = await supabase
      .from('meal_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (plansData && plansData.length > 0) {
      const customerIds = [...new Set(plansData.map(p => p.customer_id))];
      const { data: customers } = await supabase
        .from('customers')
        .select('id, user_id')
        .in('id', customerIds);

      const userIds = customers?.map(c => c.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const plansWithCustomers = plansData.map(plan => {
        const customer = customers?.find(c => c.id === plan.customer_id);
        const profile = profiles?.find(p => p.id === customer?.user_id);
        return {
          ...plan,
          customer: customer ? { profile: profile || null } : null
        };
      });
      setMealPlans(plansWithCustomers as MealPlanWithCustomer[]);
    } else {
      setMealPlans([]);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Kostplaner</h1>
            <p className="text-muted-foreground">Opret og administrer kostplaner for dine klienter</p>
          </div>
          <Button className="rounded-xl gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Ny Kostplan
          </Button>
        </div>

        {/* Meal Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : mealPlans.length === 0 ? (
          <Card className="rounded-2xl border-border shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">Ingen kostplaner</p>
              <p className="text-muted-foreground">Opret din første kostplan for at komme i gang</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mealPlans.map((plan) => (
              <Card
                key={plan.id}
                className="group rounded-2xl border-border shadow-card transition-all duration-300 hover:shadow-hover hover:scale-[1.02] cursor-pointer"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {plan.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.customer?.profile?.full_name || 'Ukendt klient'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                      Uge {plan.week_number}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(plan.start_date), 'd. MMM', { locale: da })} -{' '}
                      {format(new Date(plan.end_date), 'd. MMM yyyy', { locale: da })}
                    </span>
                  </div>

                  {/* Calories */}
                  {plan.daily_calories && (
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Daglige kalorier</span>
                      </div>
                      <span className="font-bold text-primary">{plan.daily_calories} kcal</span>
                    </div>
                  )}

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center rounded-xl bg-muted/30 p-2">
                      <Beef className="h-4 w-4 text-secondary mb-1" />
                      <span className="text-xs text-muted-foreground">Protein</span>
                    </div>
                    <div className="flex flex-col items-center rounded-xl bg-muted/30 p-2">
                      <Apple className="h-4 w-4 text-success mb-1" />
                      <span className="text-xs text-muted-foreground">Kulhydrat</span>
                    </div>
                    <div className="flex flex-col items-center rounded-xl bg-muted/30 p-2">
                      <Droplet className="h-4 w-4 text-accent mb-1" />
                      <span className="text-xs text-muted-foreground">Fedt</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {plan.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{plan.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
