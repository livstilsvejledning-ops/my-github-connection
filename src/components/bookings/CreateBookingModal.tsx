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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { X, CalendarIcon, Clock, Loader2, Video, Phone as PhoneIcon, Users } from 'lucide-react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  user_id: string;
  profile: {
    full_name: string;
    email: string;
    profile_image_url: string | null;
  } | null;
}

interface CreateBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: BookingFormData) => Promise<void>;
  customers: Customer[];
  initialData?: Partial<BookingFormData>;
  isEditing?: boolean;
}

export interface BookingFormData {
  customer_id: string;
  booking_type: string;
  scheduled_at: Date;
  time: string;
  duration_minutes: number;
  meeting_link: string;
  notes: string;
  status: string;
}

const bookingTypes = [
  { value: 'first_consultation', label: 'Første konsultation', icon: Users },
  { value: 'follow_up', label: 'Opfølgning', icon: Users },
  { value: 'measurement', label: 'Målingsmøde', icon: Users },
  { value: 'meal_plan_review', label: 'Måltidsplan gennemgang', icon: Users },
  { value: 'motivation', label: 'Motivation session', icon: Users },
  { value: 'video_call', label: 'Video call', icon: Video },
  { value: 'phone_call', label: 'Telefon', icon: PhoneIcon },
  { value: 'in_person', label: 'Personligt møde', icon: Users },
];

const durationOptions = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '120 min' },
];

const timeSlots = Array.from({ length: 53 }, (_, i) => {
  const hour = Math.floor(i / 4) + 7;
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}).filter(t => {
  const hour = parseInt(t.split(':')[0]);
  return hour >= 7 && hour < 20;
});

export function CreateBookingModal({
  open,
  onOpenChange,
  onSave,
  customers,
  initialData,
  isEditing = false,
}: CreateBookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    customer_id: initialData?.customer_id || '',
    booking_type: initialData?.booking_type || '',
    scheduled_at: initialData?.scheduled_at || new Date(),
    time: initialData?.time || '09:00',
    duration_minutes: initialData?.duration_minutes || 60,
    meeting_link: initialData?.meeting_link || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'scheduled',
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateField = <K extends keyof BookingFormData>(field: K, value: BookingFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === formData.customer_id);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 rounded-2xl overflow-hidden border-0">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 gradient-primary">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-white">
              {isEditing ? 'Rediger Booking' : 'Opret Booking'}
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
        <div className="p-5 bg-card space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Customer */}
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

          {/* Booking Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Booking type <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={formData.booking_type}
              onValueChange={(value) => updateField('booking_type', value)}
            >
              <SelectTrigger className="rounded-xl bg-input border-border focus:border-primary">
                <SelectValue placeholder="Vælg type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {bookingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4 text-primary" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Dato</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal rounded-xl bg-input border-border"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {format(formData.scheduled_at, 'd. MMM yyyy', { locale: da })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.scheduled_at}
                    onSelect={(date) => date && updateField('scheduled_at', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tidspunkt</Label>
              <Select value={formData.time} onValueChange={(value) => updateField('time', value)}>
                <SelectTrigger className="rounded-xl bg-input border-border focus:border-primary">
                  <Clock className="mr-2 h-4 w-4 text-primary" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-60">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Varighed</Label>
            <Select 
              value={formData.duration_minutes.toString()}
              onValueChange={(value) => updateField('duration_minutes', parseInt(value))}
            >
              <SelectTrigger className="rounded-xl bg-input border-border focus:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Meeting link</Label>
            <Input
              value={formData.meeting_link}
              onChange={(e) => updateField('meeting_link', e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="rounded-xl bg-input border-border focus:border-primary"
            />
          </div>

          {/* Status (only for editing) */}
          {isEditing && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger className="rounded-xl bg-input border-border focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="scheduled">Planlagt</SelectItem>
                  <SelectItem value="completed">Gennemført</SelectItem>
                  <SelectItem value="cancelled">Aflyst</SelectItem>
                  <SelectItem value="no_show">Ikke mødt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Private noter</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Tilføj noter..."
              className="rounded-xl bg-input border-border focus:border-primary min-h-[80px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-4 border-t border-border bg-card flex justify-between">
          <Button variant="ghost" className="rounded-xl">
            Send påmindelse nu
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Annuller
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !formData.customer_id || !formData.booking_type}
              className="rounded-xl gradient-primary text-white"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Gem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
