import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const dayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealTypeLabels: Record<string, string> = {
  breakfast: 'Morgenmad',
  lunch: 'Frokost',
  dinner: 'Middag',
  snack: 'Snack'
};

interface MealPlanItem {
  id: string;
  day_of_week: number;
  meal_type: string;
  recipe_name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  instructions: string | null;
}

export default function ClientMealPlan() {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [mealItems, setMealItems] = useState<MealPlanItem[]>([]);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  useEffect(() => {
    if (user) fetchMealPlan();
  }, [user, currentWeek]);

  const fetchMealPlan = async () => {
    if (!user) return;

    const { data: plans } = await supabase
      .from('meal_plans')
      .select(`
        *,
        items:meal_plan_items(*)
      `)
      .lte('start_date', format(weekEnd, 'yyyy-MM-dd'))
      .gte('end_date', format(weekStart, 'yyyy-MM-dd'))
      .limit(1)
      .maybeSingle();

    if (plans) {
      setMealPlan(plans);
      setMealItems(plans.items || []);
    } else {
      setMealPlan(null);
      setMealItems([]);
    }
  };

  const getMealForDayAndType = (dayIndex: number, mealType: string) => {
    return mealItems.find(
      item => item.day_of_week === dayIndex && item.meal_type === mealType
    );
  };

  const getDayTotal = (dayIndex: number) => {
    const dayMeals = mealItems.filter(item => item.day_of_week === dayIndex);
    return dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  };

  return (
    <ClientLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Min Måltidsplan</h1>
            {mealPlan && (
              <p className="text-muted-foreground">{mealPlan.name}</p>
            )}
          </div>
          <Button variant="outline" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Indkøbsliste
          </Button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between bg-card rounded-2xl p-4 shadow-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="font-semibold text-foreground">
              {format(weekStart, "d. MMM", { locale: da })} - {format(weekEnd, "d. MMM yyyy", { locale: da })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {!mealPlan ? (
          <div className="text-center py-12 bg-card rounded-2xl">
            <p className="text-muted-foreground mb-2">Ingen måltidsplan for denne uge</p>
            <p className="text-sm text-muted-foreground">
              Din coach har ikke oprettet en plan endnu
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Grid View */}
            <div className="hidden lg:block overflow-x-auto">
              <div className="grid grid-cols-7 gap-2 min-w-[900px]">
                {dayNames.map((day, dayIndex) => (
                  <div key={day} className="space-y-2">
                    {/* Day Header */}
                    <div className="bg-card rounded-xl p-3 text-center shadow-card">
                      <p className="font-semibold text-foreground">{day}</p>
                      <p className="text-xs text-muted-foreground">
                        {getDayTotal(dayIndex)} kcal
                      </p>
                    </div>

                    {/* Meals */}
                    {mealTypes.map(mealType => {
                      const meal = getMealForDayAndType(dayIndex, mealType);
                      return (
                        <div
                          key={`${dayIndex}-${mealType}`}
                          className={cn(
                            "rounded-xl p-3 min-h-24 transition-all",
                            meal
                              ? "bg-card border-l-4 border-primary shadow-card hover:shadow-hover cursor-pointer"
                              : "bg-muted/30 border border-dashed border-muted-foreground/20"
                          )}
                          onClick={() => meal && setExpandedMeal(
                            expandedMeal === meal.id ? null : meal.id
                          )}
                        >
                          {meal ? (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {mealTypeLabels[mealType]}
                              </p>
                              <p className="font-medium text-foreground text-sm line-clamp-2">
                                {meal.recipe_name}
                              </p>
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {meal.calories} kcal
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground text-center">
                              {mealTypeLabels[mealType]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile List View */}
            <div className="lg:hidden space-y-4">
              {dayNames.map((day, dayIndex) => (
                <div key={day} className="bg-card rounded-2xl overflow-hidden shadow-card">
                  <div className="gradient-primary p-4">
                    <p className="font-semibold text-white">{day}</p>
                    <p className="text-sm text-white/80">{getDayTotal(dayIndex)} kcal total</p>
                  </div>
                  <div className="p-4 space-y-3">
                    {mealTypes.map(mealType => {
                      const meal = getMealForDayAndType(dayIndex, mealType);
                      if (!meal) return null;
                      return (
                        <div
                          key={meal.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                        >
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {mealTypeLabels[mealType]}
                            </p>
                            <p className="font-medium text-foreground">
                              {meal.recipe_name}
                            </p>
                          </div>
                          <Badge variant="secondary">{meal.calories} kcal</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
