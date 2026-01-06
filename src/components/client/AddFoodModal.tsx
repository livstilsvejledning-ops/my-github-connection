import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  onAddFood: (food: FoodData) => Promise<void>;
  recentFoods?: { name: string; calories: number; protein?: number; carbs?: number; fat?: number }[];
}

interface FoodData {
  name: string;
  portion: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const units = ['g', 'ml', 'stk', 'portion', 'skive', 'kop'];

export function AddFoodModal({ isOpen, onClose, mealType, onAddFood, recentFoods = [] }: AddFoodModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FoodData>({
    name: '',
    portion: 100,
    unit: 'g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  const mealTypeLabels: Record<string, string> = {
    breakfast: 'Morgenmad',
    lunch: 'Frokost',
    dinner: 'Middag',
    snack: 'Snack'
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Indtast et navn');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddFood(formData);
      toast.success('Måltid tilføjet!');
      onClose();
      setFormData({
        name: '',
        portion: 100,
        unit: 'g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
    } catch {
      toast.error('Kunne ikke tilføje måltid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = (food: typeof recentFoods[0]) => {
    setFormData({
      name: food.name,
      portion: 1,
      unit: 'portion',
      calories: food.calories,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Tilføj til {mealTypeLabels[mealType] || mealType}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recent Foods */}
          {recentFoods.length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Seneste måltider</Label>
              <div className="flex flex-wrap gap-2">
                {recentFoods.slice(0, 6).map((food, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors py-1.5 px-3"
                    onClick={() => handleQuickAdd(food)}
                  >
                    {food.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Food Name */}
          <div className="space-y-2">
            <Label>Navn *</Label>
            <Input
              placeholder="f.eks. Havregrød med bær"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-muted/50 border-transparent focus:border-primary"
            />
          </div>

          {/* Portion & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mængde</Label>
              <Input
                type="number"
                value={formData.portion}
                onChange={(e) => setFormData({ ...formData, portion: parseFloat(e.target.value) || 0 })}
                className="bg-muted/50 border-transparent focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label>Enhed</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger className="bg-muted/50 border-transparent focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calories */}
          <div className="space-y-2">
            <Label>Kalorier</Label>
            <Input
              type="number"
              placeholder="0"
              value={formData.calories || ''}
              onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
              className="bg-muted/50 border-transparent focus:border-primary"
            />
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Protein (g)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.protein || ''}
                onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
                className="bg-muted/50 border-transparent focus:border-primary text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Kulhydrater (g)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.carbs || ''}
                onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })}
                className="bg-muted/50 border-transparent focus:border-primary text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Fedt (g)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.fat || ''}
                onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) || 0 })}
                className="bg-muted/50 border-transparent focus:border-primary text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuller
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gradient-primary text-white"
          >
            {isSubmitting ? 'Tilføjer...' : 'Tilføj Måltid'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
