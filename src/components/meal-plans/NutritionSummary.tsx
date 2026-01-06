import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight, Flame } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MealItem {
  id?: string;
  recipe_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface DayMeals {
  [mealType: string]: MealItem | null;
}

interface NutritionSummaryProps {
  meals: DayMeals[];
  dailyCalorieGoal: number;
  dayNames: string[];
}

export function NutritionSummary({ meals, dailyCalorieGoal, dayNames }: NutritionSummaryProps) {
  const [expandedDays, setExpandedDays] = useState<number[]>([0]);

  const toggleDay = (index: number) => {
    setExpandedDays(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const calculateDayTotals = (dayMeals: DayMeals) => {
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    return mealTypes.reduce(
      (acc, type) => {
        const meal = dayMeals[type];
        if (meal) {
          acc.calories += meal.calories || 0;
          acc.protein += meal.protein_g || 0;
          acc.carbs += meal.carbs_g || 0;
          acc.fat += meal.fat_g || 0;
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const weeklyTotals = meals.reduce(
    (acc, dayMeals) => {
      const dayTotals = calculateDayTotals(dayMeals);
      acc.calories += dayTotals.calories;
      acc.protein += dayTotals.protein;
      acc.carbs += dayTotals.carbs;
      acc.fat += dayTotals.fat;
      acc.daysWithMeals += dayTotals.calories > 0 ? 1 : 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, daysWithMeals: 0 }
  );

  const weeklyAverage = weeklyTotals.daysWithMeals > 0 ? {
    calories: Math.round(weeklyTotals.calories / weeklyTotals.daysWithMeals),
    protein: Math.round(weeklyTotals.protein / weeklyTotals.daysWithMeals),
    carbs: Math.round(weeklyTotals.carbs / weeklyTotals.daysWithMeals),
    fat: Math.round(weeklyTotals.fat / weeklyTotals.daysWithMeals),
  } : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const complianceRate = dailyCalorieGoal > 0 
    ? Math.round((weeklyAverage.calories / dailyCalorieGoal) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Weekly Average Card */}
      <Card className="rounded-2xl border-0 gradient-primary text-white overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white/80">Ugentligt Gennemsnit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{weeklyAverage.calories} kcal</span>
            <div className="text-right">
              <span className="text-sm text-white/80">Mål: {dailyCalorieGoal}</span>
              <div className="text-lg font-semibold">{complianceRate}%</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/20 rounded-lg py-2">
              <div className="text-lg font-bold">{weeklyAverage.protein}g</div>
              <div className="text-xs text-white/70">Protein</div>
            </div>
            <div className="bg-white/20 rounded-lg py-2">
              <div className="text-lg font-bold">{weeklyAverage.carbs}g</div>
              <div className="text-xs text-white/70">Kulhydrat</div>
            </div>
            <div className="bg-white/20 rounded-lg py-2">
              <div className="text-lg font-bold">{weeklyAverage.fat}g</div>
              <div className="text-xs text-white/70">Fedt</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summaries */}
      <div className="space-y-2">
        {meals.map((dayMeals, index) => {
          const totals = calculateDayTotals(dayMeals);
          const isExpanded = expandedDays.includes(index);
          const calorieProgress = dailyCalorieGoal > 0 
            ? Math.min((totals.calories / dailyCalorieGoal) * 100, 100) 
            : 0;

          return (
            <Card 
              key={index} 
              className="rounded-xl border-border shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleDay(index)}
                className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">{dayNames[index]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  <span className={cn(
                    "font-bold",
                    totals.calories > 0 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {totals.calories} kcal
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3">
                  {/* Calorie Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Kalorier</span>
                      <span>{totals.calories} / {dailyCalorieGoal}</span>
                    </div>
                    <Progress value={calorieProgress} className="h-2" />
                  </div>

                  {/* Macro Bars */}
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Protein</span>
                        <span className="font-medium">{totals.protein}g</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min((totals.protein / 150) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Kulhydrat</span>
                        <span className="font-medium">{totals.carbs}g</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary rounded-full transition-all"
                          style={{ width: `${Math.min((totals.carbs / 250) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Fedt</span>
                        <span className="font-medium">{totals.fat}g</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${Math.min((totals.fat / 80) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
