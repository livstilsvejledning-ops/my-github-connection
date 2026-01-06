import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (meal: MealData) => void;
  initialData?: MealData | null;
  dayName: string;
  mealType: string;
}

export interface MealData {
  recipe_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  instructions: string;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Morgenmad',
  lunch: 'Frokost',
  dinner: 'Middag',
  snack: 'Snack',
};

export function AddMealModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  dayName,
  mealType,
}: AddMealModalProps) {
  const [formData, setFormData] = useState<MealData>({
    recipe_name: initialData?.recipe_name || '',
    calories: initialData?.calories || 0,
    protein_g: initialData?.protein_g || 0,
    carbs_g: initialData?.carbs_g || 0,
    fat_g: initialData?.fat_g || 0,
    instructions: initialData?.instructions || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = <K extends keyof MealData>(field: K, value: MealData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsLoading(true);
    onSave(formData);
    setIsLoading(false);
    onOpenChange(false);
  };

  // Calculate macro percentages for the pie chart
  const totalMacroGrams = formData.protein_g + formData.carbs_g + formData.fat_g;
  const proteinPercent = totalMacroGrams > 0 ? (formData.protein_g / totalMacroGrams) * 100 : 33;
  const carbsPercent = totalMacroGrams > 0 ? (formData.carbs_g / totalMacroGrams) * 100 : 33;
  const fatPercent = totalMacroGrams > 0 ? (formData.fat_g / totalMacroGrams) * 100 : 34;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 rounded-2xl overflow-hidden border-0">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 gradient-primary">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                {initialData ? 'Rediger Måltid' : 'Tilføj Måltid'}
              </DialogTitle>
              <p className="text-sm text-white/80 mt-1">
                {dayName} - {mealTypeLabels[mealType]}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-5 bg-card space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Recipe Name */}
          <div className="space-y-2">
            <Label htmlFor="recipe_name" className="text-sm font-medium">
              Opskrift navn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="recipe_name"
              value={formData.recipe_name}
              onChange={(e) => updateField('recipe_name', e.target.value)}
              placeholder="F.eks. Havregrød med bær"
              className="rounded-xl bg-input border-border focus:border-primary"
            />
          </div>

          {/* Calories */}
          <div className="space-y-2">
            <Label htmlFor="calories" className="text-sm font-medium">Kalorier</Label>
            <Input
              id="calories"
              type="number"
              min={0}
              value={formData.calories || ''}
              onChange={(e) => updateField('calories', parseInt(e.target.value) || 0)}
              placeholder="350"
              className="rounded-xl bg-input border-border focus:border-primary"
            />
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-sm font-medium">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                min={0}
                step={0.1}
                value={formData.protein_g || ''}
                onChange={(e) => updateField('protein_g', parseFloat(e.target.value) || 0)}
                placeholder="25"
                className="rounded-xl bg-input border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-sm font-medium">Kulhydrat (g)</Label>
              <Input
                id="carbs"
                type="number"
                min={0}
                step={0.1}
                value={formData.carbs_g || ''}
                onChange={(e) => updateField('carbs_g', parseFloat(e.target.value) || 0)}
                placeholder="45"
                className="rounded-xl bg-input border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-sm font-medium">Fedt (g)</Label>
              <Input
                id="fat"
                type="number"
                min={0}
                step={0.1}
                value={formData.fat_g || ''}
                onChange={(e) => updateField('fat_g', parseFloat(e.target.value) || 0)}
                placeholder="12"
                className="rounded-xl bg-input border-border focus:border-primary"
              />
            </div>
          </div>

          {/* Macro Display */}
          <div className="flex items-center justify-center gap-6 py-4">
            {/* Simple macro bars */}
            <div className="flex-1 space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Protein</span>
                  <span className="font-medium text-primary">{formData.protein_g}g</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(proteinPercent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Kulhydrat</span>
                  <span className="font-medium text-secondary">{formData.carbs_g}g</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary rounded-full transition-all"
                    style={{ width: `${Math.min(carbsPercent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Fedt</span>
                  <span className="font-medium text-accent">{formData.fat_g}g</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${Math.min(fatPercent, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Pie chart representation */}
            <div className="relative h-20 w-20">
              <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                <circle
                  cx="18" cy="18" r="15.91549430918954"
                  fill="transparent"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeDasharray={`${proteinPercent} ${100 - proteinPercent}`}
                  strokeDashoffset="0"
                />
                <circle
                  cx="18" cy="18" r="15.91549430918954"
                  fill="transparent"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="3"
                  strokeDasharray={`${carbsPercent} ${100 - carbsPercent}`}
                  strokeDashoffset={`${-proteinPercent}`}
                />
                <circle
                  cx="18" cy="18" r="15.91549430918954"
                  fill="transparent"
                  stroke="hsl(var(--accent))"
                  strokeWidth="3"
                  strokeDasharray={`${fatPercent} ${100 - fatPercent}`}
                  strokeDashoffset={`${-(proteinPercent + carbsPercent)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-foreground">{formData.calories}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-sm font-medium">Instruktioner</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => updateField('instructions', e.target.value)}
              placeholder="Tilføj tilberedningsinstruktioner..."
              className="rounded-xl bg-input border-border focus:border-primary min-h-[80px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-4 border-t border-border bg-card flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Annuller
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !formData.recipe_name}
            className="rounded-xl gradient-primary text-white"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Gem Måltid
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
