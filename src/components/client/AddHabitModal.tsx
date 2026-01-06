import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habit: HabitData) => Promise<void>;
  initialData?: HabitData;
}

interface HabitData {
  name: string;
  icon: string;
  color: string;
  targetDays: number;
}

const habitIcons = [
  '💪', '🏃', '🧘', '💤', '📖', '🥗', '💊', '🧠',
  '🎯', '✍️', '🚰', '🍎', '☀️', '🌙', '🏋️', '🚶'
];

const habitColors = [
  '#FF6B35', '#C9753D', '#8BC34A', '#2196F3', '#9C27B0',
  '#FF9800', '#E91E63', '#00BCD4'
];

export function AddHabitModal({ isOpen, onClose, onSubmit, initialData }: AddHabitModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<HabitData>(initialData || {
    name: '',
    icon: '💪',
    color: '#FF6B35',
    targetDays: 7
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Indtast et navn for vanen');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success(initialData ? 'Vane opdateret!' : 'Vane tilføjet! 🎉');
      onClose();
      if (!initialData) {
        setFormData({
          name: '',
          icon: '💪',
          color: '#FF6B35',
          targetDays: 7
        });
      }
    } catch {
      toast.error('Kunne ikke gemme vane');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {initialData ? 'Rediger Vane' : 'Tilføj Vane'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Habit Name */}
          <div className="space-y-2">
            <Label>Vane navn *</Label>
            <Input
              placeholder="f.eks. Drik 2L vand"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-muted/50 border-transparent focus:border-primary"
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <Label>Vælg ikon</Label>
            <div className="grid grid-cols-8 gap-2">
              {habitIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={cn(
                    "text-2xl p-2 rounded-lg transition-all",
                    formData.icon === icon
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Vælg farve</Label>
            <div className="flex gap-2 flex-wrap">
              {habitColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={cn(
                    "w-10 h-10 rounded-full transition-all",
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Target Days */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Mål: dage per uge</Label>
              <span className="text-lg font-bold text-primary">{formData.targetDays}</span>
            </div>
            <Slider
              value={[formData.targetDays]}
              onValueChange={([value]) => setFormData({ ...formData, targetDays: value })}
              min={1}
              max={7}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 dag</span>
              <span>7 dage</span>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Forhåndsvisning:</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                {formData.icon}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {formData.name || 'Din nye vane'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formData.targetDays}/7 dage om ugen
                </p>
              </div>
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
            {isSubmitting ? 'Gemmer...' : initialData ? 'Gem Ændringer' : 'Tilføj Vane'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
