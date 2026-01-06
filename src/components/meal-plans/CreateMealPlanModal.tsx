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
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, CalendarIcon, Flame, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  profile: {
    full_name: string;
    email: string;
    profile_image_url: string | null;
  } | null;
}

interface CreateMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (data: MealPlanFormData) => void;
  customers: Customer[];
  initialData?: Partial<MealPlanFormData>;
  isEditing?: boolean;
}

export interface MealPlanFormData {
  customer_id: string;
  name: string;
  week_number: number;
  start_date: Date;
  end_date: Date;
  daily_calories: number;
  notes: string;
}

export function CreateMealPlanModal({
  open,
  onOpenChange,
  onContinue,
  customers,
  initialData,
  isEditing = false,
}: CreateMealPlanModalProps) {
  const [formData, setFormData] = useState<MealPlanFormData>({
    customer_id: initialData?.customer_id || '',
    name: initialData?.name || '',
    week_number: initialData?.week_number || 1,
    start_date: initialData?.start_date || new Date(),
    end_date: initialData?.end_date || addDays(new Date(), 6),
    daily_calories: initialData?.daily_calories || 2000,
    notes: initialData?.notes || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = <K extends keyof MealPlanFormData>(field: K, value: MealPlanFormData[K]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate end date when start date changes
      if (field === 'start_date' && value instanceof Date) {
        updated.end_date = addDays(value, 6);
      }
      return updated;
    });
  };

  const handleContinue = () => {
    setIsLoading(true);
    onContinue(formData);
    setIsLoading(false);
  };

  const selectedCustomer = customers.find(c => c.id === formData.customer_id);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 rounded-2xl overflow-hidden border-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 gradient-primary">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white">
              {isEditing ? 'Rediger Måltidsplan' : 'Opret Måltidsplan'}
            </DialogTitle>
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
        <div className="p-6 bg-card space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Customer Select */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Vælg kunde <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.customer_id}
              onValueChange={(value) => updateField('customer_id', value)}
            >
              <SelectTrigger className="rounded-xl bg-input border-border focus:border-primary">
                <SelectValue placeholder="Vælg en kunde">
                  {selectedCustomer && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedCustomer.profile?.profile_image_url || ''} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(selectedCustomer.profile?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedCustomer.profile?.full_name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-60">
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={customer.profile?.profile_image_url || ''} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(customer.profile?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{customer.profile?.full_name || 'Ukendt'}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plan Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Plan navn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="F.eks. Vægttabs plan - Januar"
              className="rounded-xl bg-input border-border focus:border-primary"
            />
          </div>

          {/* Week Number */}
          <div className="space-y-2">
            <Label htmlFor="week_number" className="text-sm font-medium">Uge nummer</Label>
            <Input
              id="week_number"
              type="number"
              min={1}
              max={52}
              value={formData.week_number}
              onChange={(e) => updateField('week_number', parseInt(e.target.value) || 1)}
              className="rounded-xl bg-input border-border focus:border-primary w-24"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Start dato</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal rounded-xl bg-input border-border"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {format(formData.start_date, 'd. MMM yyyy', { locale: da })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => date && updateField('start_date', date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Slut dato</Label>
              <Button
                variant="outline"
                disabled
                className="w-full justify-start text-left font-normal rounded-xl bg-muted border-border"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {format(formData.end_date, 'd. MMM yyyy', { locale: da })}
              </Button>
            </div>
          </div>

          {/* Daily Calories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                Daglig kalorimål
              </Label>
              <span className="text-lg font-bold text-primary">{formData.daily_calories} kcal</span>
            </div>
            <Slider
              value={[formData.daily_calories]}
              onValueChange={(value) => updateField('daily_calories', value[0])}
              min={1000}
              max={4000}
              step={50}
              className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1000 kcal</span>
              <span>4000 kcal</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Noter</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Tilføj noter om kostplanen..."
              className="rounded-xl bg-input border-border focus:border-primary min-h-[80px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-border bg-card flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Annuller
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isLoading || !formData.customer_id || !formData.name}
            className="rounded-xl gradient-primary text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Indlæser...
              </>
            ) : (
              'Fortsæt til Builder'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
