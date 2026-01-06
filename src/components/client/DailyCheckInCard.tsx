import { useState } from 'react';
import { ChevronDown, ChevronUp, Moon, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DailyCheckInCardProps {
  onSubmit: (data: CheckInData) => Promise<void>;
  lastWeight?: number;
}

interface CheckInData {
  weight?: number;
  mood: number;
  energy: number;
  sleep: number;
  stress: number;
  hunger: number;
  notes: string;
}

const moodEmojis = ['😫', '😕', '😐', '🙂', '😄'];
const energyLevels = [1, 2, 3, 4, 5];

export function DailyCheckInCard({ onSubmit, lastWeight }: DailyCheckInCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CheckInData>({
    weight: lastWeight,
    mood: 3,
    energy: 3,
    sleep: 7,
    stress: 2,
    hunger: 3,
    notes: ''
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success('Check-in gemt! 🎉');
      setIsExpanded(false);
    } catch {
      toast.error('Kunne ikke gemme check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/50 transition-colors"
      >
        <div>
          <h3 className="font-semibold text-foreground text-left">Hvordan har du det i dag?</h3>
          <p className="text-sm text-muted-foreground">Daglig check-in</p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-6">
          {/* Weight */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Scale className="h-4 w-4 text-primary" />
              Vægt (valgfrit)
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                step="0.1"
                placeholder="f.eks. 75.5"
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || undefined })}
                className="bg-muted/50 border-transparent focus:border-primary"
              />
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
            {lastWeight && (
              <p className="text-xs text-muted-foreground">Seneste: {lastWeight} kg</p>
            )}
          </div>

          {/* Mood */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Humør</label>
            <div className="flex justify-between">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: index + 1 })}
                  className={cn(
                    "text-3xl p-2 rounded-xl transition-all",
                    formData.mood === index + 1 
                      ? "bg-primary/10 ring-2 ring-primary scale-110" 
                      : "hover:bg-muted"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Energy */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Energi niveau</label>
            <div className="flex justify-between">
              {energyLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, energy: level })}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-xl transition-all",
                    formData.energy === level 
                      ? "bg-primary/10 ring-2 ring-primary" 
                      : "hover:bg-muted"
                  )}
                >
                  <svg 
                    className={cn(
                      "h-8 w-8",
                      formData.energy >= level ? "text-primary" : "text-muted"
                    )}
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <rect x="6" y="4" width="12" height="16" rx="2" />
                    <rect 
                      x="8" 
                      y={20 - (level * 3)} 
                      width="8" 
                      height={level * 3} 
                      className={formData.energy >= level ? "fill-primary" : "fill-muted"} 
                    />
                    <rect x="9" y="2" width="6" height="2" rx="1" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Sleep */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Moon className="h-4 w-4 text-primary" />
              Søvn (timer)
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={[formData.sleep]}
                onValueChange={([value]) => setFormData({ ...formData, sleep: value })}
                min={0}
                max={12}
                step={0.5}
                className="flex-1"
              />
              <span className="w-12 text-sm font-medium text-foreground">{formData.sleep}t</span>
            </div>
          </div>

          {/* Stress */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Stress niveau</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, stress: level })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    formData.stress === level
                      ? level <= 2 
                        ? "bg-success text-white" 
                        : level === 3 
                          ? "bg-accent text-accent-foreground"
                          : "bg-destructive text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">1 = Lav stress, 5 = Høj stress</p>
          </div>

          {/* Hunger */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Sult niveau</label>
            <Slider
              value={[formData.hunger]}
              onValueChange={([value]) => setFormData({ ...formData, hunger: value })}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Ikke sulten</span>
              <span>Meget sulten</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Dagens notater</label>
            <Textarea
              placeholder="Hvordan føles din krop? Nogen udfordringer?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-muted/50 border-transparent focus:border-primary min-h-24 resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full gradient-primary text-white"
          >
            {isSubmitting ? 'Gemmer...' : 'Gem Check-in'}
          </Button>
        </div>
      )}
    </div>
  );
}
