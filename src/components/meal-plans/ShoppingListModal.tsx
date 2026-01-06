import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, ShoppingCart, Printer, Download, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MealItem {
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

interface ShoppingListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meals: DayMeals[];
  dayNames: string[];
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Morgenmad',
  lunch: 'Frokost',
  dinner: 'Middag',
  snack: 'Snack',
};

// Mock shopping items - in real app, would be parsed from recipes
const mockShoppingItems: Record<string, { name: string; amount: string; checked: boolean }[]> = {
  'Grøntsager': [
    { name: 'Spinat', amount: '200g', checked: false },
    { name: 'Tomater', amount: '4 stk', checked: false },
    { name: 'Agurk', amount: '1 stk', checked: false },
    { name: 'Broccoli', amount: '300g', checked: false },
  ],
  'Frugt': [
    { name: 'Bananer', amount: '6 stk', checked: false },
    { name: 'Æbler', amount: '4 stk', checked: false },
    { name: 'Blåbær', amount: '200g', checked: false },
  ],
  'Kød & Fisk': [
    { name: 'Kyllingebryst', amount: '500g', checked: false },
    { name: 'Laks', amount: '400g', checked: false },
    { name: 'Hakket oksekød', amount: '400g', checked: false },
  ],
  'Mejeriprodukter': [
    { name: 'Skyr', amount: '500g', checked: false },
    { name: 'Mælk', amount: '1L', checked: false },
    { name: 'Æg', amount: '12 stk', checked: false },
  ],
  'Tørvarer': [
    { name: 'Havregryn', amount: '500g', checked: false },
    { name: 'Fuldkornsris', amount: '500g', checked: false },
    { name: 'Fuldkornspasta', amount: '500g', checked: false },
  ],
};

export function ShoppingListModal({
  open,
  onOpenChange,
  meals,
  dayNames,
}: ShoppingListModalProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>(['breakfast', 'lunch', 'dinner', 'snack']);
  const [isGenerated, setIsGenerated] = useState(false);
  const [shoppingList, setShoppingList] = useState<typeof mockShoppingItems>(mockShoppingItems);
  const [isLoading, setIsLoading] = useState(false);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleMealType = (type: string) => {
    setSelectedMealTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = () => {
    setIsLoading(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerated(true);
      setIsLoading(false);
    }, 500);
  };

  const toggleItem = (category: string, index: number) => {
    setShoppingList(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => 
        i === index ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text content
    let content = 'INDKØBSLISTE\n\n';
    Object.entries(shoppingList).forEach(([category, items]) => {
      content += `${category}:\n`;
      items.forEach(item => {
        content += `  ${item.checked ? '✓' : '○'} ${item.name} - ${item.amount}\n`;
      });
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'indkobsliste.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 rounded-2xl overflow-hidden border-0">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 gradient-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-white" />
              <DialogTitle className="text-lg font-bold text-white">
                Generer Indkøbsliste
              </DialogTitle>
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
        <div className="p-5 bg-card max-h-[60vh] overflow-y-auto">
          {!isGenerated ? (
            <div className="space-y-5">
              {/* Day Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Vælg dage</Label>
                <div className="grid grid-cols-4 gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => toggleDay(index)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        selectedDays.includes(index)
                          ? "gradient-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Vælg måltidstyper</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(mealTypeLabels).map(([type, label]) => (
                    <button
                      key={type}
                      onClick={() => toggleMealType(type)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        selectedMealTypes.includes(type)
                          ? "gradient-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || selectedDays.length === 0 || selectedMealTypes.length === 0}
                className="w-full rounded-xl gradient-primary text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Genererer...
                  </>
                ) : (
                  'Generer Liste'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrint}
                  className="flex-1 rounded-lg"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownload}
                  className="flex-1 rounded-lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 rounded-lg"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </div>

              {/* Shopping List */}
              <div className="space-y-4">
                {Object.entries(shoppingList).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {category}
                    </h3>
                    <div className="space-y-1 pl-4">
                      {items.map((item, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 py-1"
                        >
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleItem(category, index)}
                            className="border-primary data-[state=checked]:bg-primary"
                          />
                          <span className={cn(
                            "flex-1 text-sm",
                            item.checked && "line-through text-muted-foreground"
                          )}>
                            {item.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {item.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setIsGenerated(false)}
                className="w-full rounded-xl"
              >
                Tilbage til valg
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
