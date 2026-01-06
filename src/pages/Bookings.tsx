import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateBookingModal, BookingFormData } from '@/components/bookings/CreateBookingModal';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock,
  Video,
  Edit,
  Check,
  X,
  AlertCircle,
  Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays,
  getDay
} from 'date-fns';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface BookingWithCustomer {
  id: string;
  customer_id: string;
  booking_type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  meeting_link: string | null;
  customer: {
    id: string;
    user_id: string;
    profile: {
      full_name: string;
      profile_image_url: string | null;
    } | null;
  } | null;
}

interface Customer {
  id: string;
  user_id: string;
  profile: {
    full_name: string;
    email: string;
    profile_image_url: string | null;
  } | null;
}

type ViewType = 'month' | 'week' | 'day';

const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  scheduled: { 
    label: 'Planlagt', 
    className: 'bg-primary/20 text-primary border-primary/30',
    dotColor: 'bg-primary'
  },
  completed: { 
    label: 'Gennemført', 
    className: 'bg-success/20 text-success border-success/30',
    dotColor: 'bg-success'
  },
  cancelled: { 
    label: 'Aflyst', 
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground'
  },
  no_show: { 
    label: 'Ikke mødt', 
    className: 'bg-destructive/20 text-destructive border-destructive/30',
    dotColor: 'bg-destructive'
  },
};

const bookingTypeLabels: Record<string, string> = {
  first_consultation: 'Første konsultation',
  follow_up: 'Opfølgning',
  measurement: 'Målingsmøde',
  meal_plan_review: 'Måltidsplan gennemgang',
  motivation: 'Motivation session',
  video_call: 'Video call',
  phone_call: 'Telefon',
  in_person: 'Personligt møde',
};

export default function Bookings() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<BookingWithCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingWithCustomer | null>(null);

  useEffect(() => {
    fetchBookings();
    fetchCustomers();
  }, [currentDate]);

  const fetchBookings = async () => {
    setLoading(true);
    const start = startOfMonth(subMonths(currentDate, 1));
    const end = endOfMonth(addMonths(currentDate, 1));

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*')
      .gte('scheduled_at', start.toISOString())
      .lte('scheduled_at', end.toISOString())
      .order('scheduled_at', { ascending: true });

    if (bookingsData && bookingsData.length > 0) {
      const customerIds = [...new Set(bookingsData.map(b => b.customer_id).filter(Boolean))];
      const { data: customersData } = await supabase
        .from('customers')
        .select('id, user_id')
        .in('id', customerIds);

      const userIds = customersData?.map(c => c.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image_url')
        .in('id', userIds);

      const bookingsWithCustomers = bookingsData.map(booking => {
        const customer = customersData?.find(c => c.id === booking.customer_id);
        const profile = profiles?.find(p => p.id === customer?.user_id);
        return {
          ...booking,
          customer: customer ? { ...customer, profile: profile || null } : null
        };
      });
      setBookings(bookingsWithCustomers as BookingWithCustomer[]);
    } else {
      setBookings([]);
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('id, user_id')
      .eq('status', 'active');

    if (data && data.length > 0) {
      const userIds = data.map(c => c.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, profile_image_url')
        .in('id', userIds);

      const customersWithProfiles = data.map(customer => ({
        ...customer,
        profile: profiles?.find(p => p.id === customer.user_id) || null
      }));
      setCustomers(customersWithProfiles as Customer[]);
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleCreateBooking = async (formData: BookingFormData) => {
    const [hours, minutes] = formData.time.split(':').map(Number);
    const scheduledAt = new Date(formData.scheduled_at);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const { error } = await supabase
      .from('bookings')
      .insert({
        customer_id: formData.customer_id,
        admin_id: user?.id,
        booking_type: formData.booking_type,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: formData.duration_minutes,
        status: 'scheduled',
        notes: formData.notes,
        meeting_link: formData.meeting_link,
      });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fejl',
        description: 'Kunne ikke oprette booking',
      });
    } else {
      toast({
        title: 'Booking oprettet',
        description: 'Din booking er blevet gemt',
      });
      fetchBookings();
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
    
    fetchBookings();
    toast({ title: 'Status opdateret' });
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.scheduled_at), date)
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const dayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth} className="rounded-xl">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-foreground min-w-[180px] text-center capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: da })}
              </h1>
              <Button variant="outline" size="icon" onClick={handleNextMonth} className="rounded-xl">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* View Switcher */}
            <div className="flex gap-1 bg-muted p-1 rounded-xl">
              {(['month', 'week', 'day'] as ViewType[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setViewType(view)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-lg transition-all capitalize",
                    viewType === view
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {view === 'month' ? 'Måned' : view === 'week' ? 'Uge' : 'Dag'}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-xl gradient-primary text-white shadow-lg hover:shadow-hover transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ny Booking
          </Button>
        </div>

        {/* Calendar */}
        <Card className="rounded-2xl border-border shadow-card overflow-hidden">
          <CardContent className="p-0">
            {viewType === 'month' && (
              <div className="grid grid-cols-7">
                {/* Day Headers */}
                {dayNames.map((day) => (
                  <div 
                    key={day}
                    className="p-3 text-center text-sm font-medium text-muted-foreground border-b border-border bg-muted/30"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map((day, index) => {
                  const dayBookings = getBookingsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "min-h-[100px] p-2 text-left border-b border-r border-border transition-all",
                        !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                        isToday(day) && "bg-primary/5 border-2 border-primary",
                        isSelected && "bg-muted",
                        "hover:bg-muted/50"
                      )}
                    >
                      <span className={cn(
                        "inline-flex items-center justify-center w-7 h-7 text-sm rounded-full",
                        isToday(day) && "gradient-primary text-white font-bold"
                      )}>
                        {format(day, 'd')}
                      </span>

                      {/* Booking Dots */}
                      <div className="mt-1 space-y-1">
                        {dayBookings.slice(0, 3).map((booking) => {
                          const status = statusConfig[booking.status];
                          return (
                            <div 
                              key={booking.id}
                              className="flex items-center gap-1 text-xs truncate"
                            >
                              <div className={cn("w-2 h-2 rounded-full shrink-0", status.dotColor)} />
                              <span className="truncate">
                                {format(new Date(booking.scheduled_at), 'HH:mm')} {booking.customer?.profile?.full_name?.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                        {dayBookings.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{dayBookings.length - 3} mere
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Day Bookings */}
        {selectedDate && (
          <Card className="rounded-2xl border-border shadow-card">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-4">
                Bookinger for {format(selectedDate, 'd. MMMM yyyy', { locale: da })}
              </h3>
              
              {getBookingsForDate(selectedDate).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Ingen bookinger denne dag
                </p>
              ) : (
                <div className="space-y-3">
                  {getBookingsForDate(selectedDate).map((booking) => {
                    const status = statusConfig[booking.status];

                    return (
                      <div
                        key={booking.id}
                        className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-all"
                      >
                        {/* Left Border */}
                        <div className={cn("w-1 self-stretch rounded-full", status.dotColor)} />

                        {/* Customer Avatar */}
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.customer?.profile?.profile_image_url || ''} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(booking.customer?.profile?.full_name || 'U')}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">
                              {booking.customer?.profile?.full_name || 'Ukendt'}
                            </span>
                            <Badge className={cn("border text-xs", status.className)}>
                              {status.label}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {bookingTypeLabels[booking.booking_type] || booking.booking_type}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-primary" />
                              {format(new Date(booking.scheduled_at), 'HH:mm')} ({booking.duration_minutes} min)
                            </span>
                            {booking.meeting_link && (
                              <span className="flex items-center gap-1 text-primary">
                                <Video className="h-4 w-4" />
                                Video møde
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                            onClick={() => setEditingBooking(booking)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {booking.status === 'scheduled' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg text-success hover:text-success"
                                onClick={() => handleUpdateStatus(booking.id, 'completed')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg"
                                onClick={() => handleUpdateStatus(booking.id, 'no_show')}
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg"
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateBookingModal
        open={isCreateModalOpen || !!editingBooking}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setEditingBooking(null);
          }
        }}
        onSave={handleCreateBooking}
        customers={customers}
        isEditing={!!editingBooking}
        initialData={editingBooking ? {
          customer_id: editingBooking.customer_id,
          booking_type: editingBooking.booking_type,
          scheduled_at: new Date(editingBooking.scheduled_at),
          time: format(new Date(editingBooking.scheduled_at), 'HH:mm'),
          duration_minutes: editingBooking.duration_minutes,
          meeting_link: editingBooking.meeting_link || '',
          notes: editingBooking.notes || '',
          status: editingBooking.status,
        } : undefined}
      />
    </DashboardLayout>
  );
}
