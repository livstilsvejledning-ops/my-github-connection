import { useState } from 'react';
import { Droplets, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WaterTrackerProps {
  currentAmount: number;
  goalAmount: number;
  onAddWater: (amount: number) => Promise<void>;
}

const quickAddAmounts = [
  { label: '250 ml', value: 250, icon: '🥛' },
  { label: '500 ml', value: 500, icon: '🍶' },
  { label: '750 ml', value: 750, icon: '💧' },
];

export function WaterTracker({ currentAmount, goalAmount, onAddWater }: WaterTrackerProps) {
  const [customAmount, setCustomAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);
  const remaining = Math.max(goalAmount - currentAmount, 0);

  const handleAddWater = async (amount: number) => {
    setIsAdding(true);
    try {
      await onAddWater(amount);
      toast.success(`+${amount} ml tilføjet! 💧`);
      setCustomAmount('');
    } catch {
      toast.error('Kunne ikke tilføje vand');
    } finally {
      setIsAdding(false);
    }
  };

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (amount > 0) {
      handleAddWater(amount);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-blue-100">
          <Droplets className="h-5 w-5 text-blue-500" />
        </div>
        <h3 className="font-semibold text-foreground">Vand Tracker</h3>
      </div>

      {/* Water Bottle Visualization */}
      <div className="flex justify-center mb-6">
        <div className="relative w-24 h-40">
          {/* Bottle shape */}
          <div className="absolute inset-x-4 top-0 h-4 bg-blue-200 rounded-t-lg" />
          <div className="absolute inset-0 top-4 rounded-2xl bg-blue-50 border-2 border-blue-200 overflow-hidden">
            {/* Goal line */}
            <div 
              className="absolute left-0 right-0 border-t-2 border-dashed border-blue-400"
              style={{ bottom: '85%' }}
            />
            
            {/* Water fill */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-700 ease-out"
              style={{ height: `${percentage}%` }}
            >
              {/* Wave effect */}
              <div className="absolute -top-2 left-0 right-0">
                <svg viewBox="0 0 100 20" className="w-full h-4 text-blue-400">
                  <path 
                    d="M0 10 Q 25 0, 50 10 T 100 10 V 20 H 0 Z" 
                    fill="currentColor"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Percentage label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600 bg-white/80 px-2 py-1 rounded">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="text-center mb-4">
        <p className="text-2xl font-bold text-foreground">
          {currentAmount} <span className="text-lg font-normal text-muted-foreground">/ {goalAmount} ml</span>
        </p>
        {remaining > 0 ? (
          <p className="text-sm text-muted-foreground">
            Mangler {remaining} ml
          </p>
        ) : (
          <p className="text-sm text-success font-medium">
            🎉 Mål nået!
          </p>
        )}
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {quickAddAmounts.map((item) => (
          <Button
            key={item.value}
            variant="outline"
            size="sm"
            onClick={() => handleAddWater(item.value)}
            disabled={isAdding}
            className={cn(
              "flex flex-col gap-1 h-auto py-3 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Andet ml"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="bg-muted/50 border-transparent focus:border-blue-500"
        />
        <Button
          size="icon"
          onClick={handleCustomAdd}
          disabled={!customAmount || isAdding}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
