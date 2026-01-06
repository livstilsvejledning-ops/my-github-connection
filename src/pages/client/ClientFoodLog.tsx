import { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { FoodLogEntry } from '@/components/client/FoodLogEntry';
import { AddFoodModal } from '@/components/client/AddFoodModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { toast } from 'sonner';

interface FoodLog {
  id: string;
  food_name: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  meal_type: string | null;
  created_at: string | null;
}

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealTypeLabels: Record<string, string> = {
  breakfast: 'Morgenmad',
  lunch: 'Frokost',
  dinner: 'Middag',
  snack: 'Snacks'
};

export default function ClientFoodLog() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [calorieGoal] = useState(2000);

  useEffect(() => {
    if (user) fetchFoodLogs();
  }, [user, selectedDate]);

  const fetchFoodLogs = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('food_logs')
      .select('*')
      .eq('logged_date', selectedDate)
      .order('created_at', { ascending: true });

    setFoodLogs(data || []);
  };

  const handleAddFood = async (food: any) => {
    if (!user) return;

    await supabase.from('food_logs').insert({
      customer_id: user.id,
      logged_date: selectedDate,
      meal_type: selectedMealType,
      food_name: food.name,
      calories: food.calories,
      protein_g: food.protein,
      carbs_g: food.carbs,
      fat_g: food.fat
    });

    fetchFoodLogs();
  };

  const handleDeleteFood = async (id: string) => {
    await supabase.from('food_logs').delete().eq('id', id);
    fetchFoodLogs();
    toast.success('Måltid slettet');
  };

  const totalCalories = foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  const totalProtein = foodLogs.reduce((sum, log) => sum + (log.protein_g || 0), 0);
  const totalCarbs = foodLogs.reduce((sum, log) => sum + (log.carbs_g || 0), 0);
  const totalFat = foodLogs.reduce((sum, log) => sum + (log.fat_g || 0), 0);
  const caloriePercentage = Math.min((totalCalories / calorieGoal) * 100, 100);

  const getLogsForMealType = (type: string) => 
    foodLogs.filter(log => log.meal_type === type);

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Måltidslog</h1>
            <p className="text-muted-foreground">
              {format(new Date(selectedDate), "EEEE d. MMMM", { locale: da })}
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gradient-primary text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tilføj Måltid
          </Button>
        </div>

        {/* Daily Summary */}
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Dagsoversigt</h3>
            <span className="text-lg font-bold text-primary">
              {totalCalories} / {calorieGoal} kcal
            </span>
          </div>
          
          <Progress value={caloriePercentage} className="h-3 mb-4" />
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-primary/10">
              <p className="text-xs text-muted-foreground mb-1">Protein</p>
              <p className="font-bold text-primary">{totalProtein}g</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/10">
              <p className="text-xs text-muted-foreground mb-1">Kulhydrater</p>
              <p className="font-bold text-secondary">{totalCarbs}g</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-accent/10">
              <p className="text-xs text-muted-foreground mb-1">Fedt</p>
              <p className="font-bold text-accent-foreground">{totalFat}g</p>
            </div>
          </div>
        </div>

        {/* Meal Type Tabs */}
        <Tabs defaultValue="breakfast" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-muted/50 p-1 rounded-xl">
            {mealTypes.map(type => (
              <TabsTrigger
                key={type}
                value={type}
                onClick={() => setSelectedMealType(type)}
                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {mealTypeLabels[type]}
              </TabsTrigger>
            ))}
          </TabsList>

          {mealTypes.map(type => (
            <TabsContent key={type} value={type} className="mt-4 space-y-3">
              {getLogsForMealType(type).length === 0 ? (
                <div className="text-center py-8 bg-card rounded-2xl">
                  <p className="text-muted-foreground mb-3">
                    Ingen {mealTypeLabels[type].toLowerCase()} logget endnu
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMealType(type);
                      setIsAddModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tilføj {mealTypeLabels[type].toLowerCase()}
                  </Button>
                </div>
              ) : (
                getLogsForMealType(type).map(log => (
                  <FoodLogEntry
                    key={log.id}
                    id={log.id}
                    name={log.food_name}
                    calories={log.calories || 0}
                    protein={log.protein_g || undefined}
                    carbs={log.carbs_g || undefined}
                    fat={log.fat_g || undefined}
                    time={log.created_at ? format(new Date(log.created_at), 'HH:mm') : undefined}
                    onEdit={() => {}}
                    onDelete={handleDeleteFood}
                  />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        <AddFoodModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          mealType={selectedMealType}
          onAddFood={handleAddFood}
        />
      </div>
    </ClientLayout>
  );
}
