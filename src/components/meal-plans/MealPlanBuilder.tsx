import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { AddMealModal, MealData } from '@/components/meal-plans/AddMealModal';
import { NutritionSummary } from '@/components/meal-plans/NutritionSummary';
import { ShoppingListModal } from '@/components/meal-plans/ShoppingListModal';
import { 
  X, 
  Save, 
  Plus, 
  Flame, 
  Edit, 
  Trash2, 
  Copy, 
  ClipboardPaste, 
  ShoppingCart,
  Loader2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MealItem {
  id?: string;
  recipe_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  instructions: string;
}

interface DayMeals {
  [mealType: string]: MealItem | null;
}

const dayNames = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealTypeLabels: Record<string, string> = {
  breakfast: 'Morgenmad',
  lunch: 'Frokost',
  dinner: 'Middag',
  snack: 'Snack',
};

interface MealPlanBuilderProps {
  planId?: string;
  customerId: string;
  customerName: string;
  customerImage?: string;
  planName: string;
  weekNumber: number;
  dailyCalories: number;
  onClose: () => void;
  onSave: (meals: DayMeals[]) => Promise<void>;
  initialMeals?: DayMeals[];
}

export function MealPlanBuilder({
  planId,
  customerId,
  customerName,
  customerImage,
  planName,
  weekNumber,
  dailyCalories,
  onClose,
  onSave,
  initialMeals,
}: MealPlanBuilderProps) {
  const { toast } = useToast();
  
  // Initialize with empty meals for each day
  const [meals, setMeals] = useState<DayMeals[]>(
    initialMeals || Array(7).fill(null).map(() => ({
      breakfast: null,
      lunch: null,
      dinner: null,
      snack: null,
    }))
  );
  
  const [selectedCell, setSelectedCell] = useState<{ day: number; mealType: string } | null>(null);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clipboard, setClipboard] = useState<MealItem | null>(null);
  const [activeWeek, setActiveWeek] = useState(1);

  const handleCellClick = (dayIndex: number, mealType: string) => {
    setSelectedCell({ day: dayIndex, mealType });
    setIsAddMealOpen(true);
  };

  const handleSaveMeal = (mealData: MealData) => {
    if (!selectedCell) return;

    setMeals(prev => {
      const updated = [...prev];
      updated[selectedCell.day] = {
        ...updated[selectedCell.day],
        [selectedCell.mealType]: mealData,
      };
      return updated;
    });

    toast({
      title: 'Måltid tilføjet',
      description: `${mealData.recipe_name} er tilføjet til ${dayNames[selectedCell.day]}`,
    });
  };

  const handleDeleteMeal = (dayIndex: number, mealType: string) => {
    setMeals(prev => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        [mealType]: null,
      };
      return updated;
    });
  };

  const handleCopyMeal = (dayIndex: number, mealType: string) => {
    const meal = meals[dayIndex][mealType];
    if (meal) {
      setClipboard(meal);
      toast({ title: 'Måltid kopieret' });
    }
  };

  const handlePasteMeal = (dayIndex: number, mealType: string) => {
    if (!clipboard) return;
    
    setMeals(prev => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        [mealType]: { ...clipboard },
      };
      return updated;
    });
    toast({ title: 'Måltid indsat' });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(meals);
      toast({
        title: 'Kostplan gemt',
        description: 'Alle ændringer er blevet gemt',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fejl',
        description: 'Kunne ikke gemme kostplanen',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate total calories for today
  const getTotalCalories = () => {
    return meals.reduce((total, day) => {
      return total + mealTypes.reduce((dayTotal, type) => {
        return dayTotal + (day[type]?.calories || 0);
      }, 0);
    }, 0);
  };

  const averageCalories = Math.round(getTotalCalories() / 7);
  const calorieProgress = (averageCalories / dailyCalories) * 100;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={customerImage} />
            <AvatarFallback className="gradient-primary text-white text-sm">
              {getInitials(customerName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-foreground">{customerName}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{planName}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                Uge {weekNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Calorie Progress */}
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-primary" />
            <div className="w-40">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Gns. kalorier</span>
                <span className="font-medium text-primary">{averageCalories} / {dailyCalories}</span>
              </div>
              <Progress value={Math.min(calorieProgress, 100)} className="h-2" />
            </div>
          </div>

          {/* Shopping List */}
          <Button
            variant="outline"
            onClick={() => setIsShoppingListOpen(true)}
            className="rounded-xl"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Indkøbsliste
          </Button>

          {/* Save */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl gradient-primary text-white"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Gem Plan
          </Button>

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Meal Type Labels */}
        <div className="w-28 shrink-0 border-r border-border bg-card p-4 flex flex-col">
          <div className="h-12" /> {/* Spacer for day headers */}
          {mealTypes.map((type) => (
            <div 
              key={type}
              className="flex-1 flex items-center justify-center"
            >
              <span className="text-sm font-medium text-muted-foreground -rotate-0">
                {mealTypeLabels[type]}
              </span>
            </div>
          ))}
        </div>

        {/* Center: 7-Day Grid */}
        <div className="flex-1 overflow-auto p-4" style={{ backgroundColor: '#FFF8F0' }}>
          <div className="grid grid-cols-7 gap-3 min-w-[800px]">
            {/* Day Headers */}
            {dayNames.map((day, index) => (
              <div 
                key={day}
                className="h-12 flex items-center justify-center"
              >
                <span className="font-semibold text-foreground">{day}</span>
              </div>
            ))}

            {/* Meal Cells */}
            {mealTypes.map((mealType) => (
              dayNames.map((_, dayIndex) => {
                const meal = meals[dayIndex]?.[mealType];
                
                return (
                  <ContextMenu key={`${dayIndex}-${mealType}`}>
                    <ContextMenuTrigger>
                      <button
                        onClick={() => handleCellClick(dayIndex, mealType)}
                        className={cn(
                          "w-full h-28 rounded-xl p-3 transition-all duration-200",
                          "flex flex-col items-center justify-center text-center",
                          meal
                            ? "bg-card border-2 border-primary/50 shadow-sm hover:shadow-md hover:border-primary"
                            : "bg-input border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-card"
                        )}
                      >
                        {meal ? (
                          <>
                            <span className="text-sm font-medium text-foreground line-clamp-2">
                              {meal.recipe_name}
                            </span>
                            <span className="text-xs text-primary mt-1 font-semibold">
                              {meal.calories} kcal
                            </span>
                          </>
                        ) : (
                          <Plus className="h-6 w-6 text-primary/40" />
                        )}
                      </button>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="rounded-xl">
                      {meal ? (
                        <>
                          <ContextMenuItem onClick={() => handleCellClick(dayIndex, mealType)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Rediger
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleCopyMeal(dayIndex, mealType)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Kopier måltid
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem 
                            onClick={() => handleDeleteMeal(dayIndex, mealType)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Slet måltid
                          </ContextMenuItem>
                        </>
                      ) : (
                        <>
                          <ContextMenuItem onClick={() => handleCellClick(dayIndex, mealType)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tilføj måltid
                          </ContextMenuItem>
                          {clipboard && (
                            <ContextMenuItem onClick={() => handlePasteMeal(dayIndex, mealType)}>
                              <ClipboardPaste className="mr-2 h-4 w-4" />
                              Indsæt måltid
                            </ContextMenuItem>
                          )}
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })
            ))}
          </div>
        </div>

        {/* Right: Nutrition Summary */}
        <div className="w-72 shrink-0 border-l border-border bg-card p-4 overflow-y-auto">
          <h2 className="font-semibold text-foreground mb-4">Ernæringsoversigt</h2>
          <NutritionSummary
            meals={meals}
            dailyCalorieGoal={dailyCalories}
            dayNames={dayNames}
          />
        </div>
      </div>

      {/* Add Meal Modal */}
      <AddMealModal
        open={isAddMealOpen}
        onOpenChange={setIsAddMealOpen}
        onSave={handleSaveMeal}
        initialData={selectedCell ? meals[selectedCell.day]?.[selectedCell.mealType] : null}
        dayName={selectedCell ? dayNames[selectedCell.day] : ''}
        mealType={selectedCell?.mealType || 'breakfast'}
      />

      {/* Shopping List Modal */}
      <ShoppingListModal
        open={isShoppingListOpen}
        onOpenChange={setIsShoppingListOpen}
        meals={meals}
        dayNames={dayNames}
      />
    </div>
  );
}
