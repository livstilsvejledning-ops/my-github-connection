import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Video, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isTomorrow, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { da } from 'date-fns/locale';

interface BookingWithCustomer {
  id: string;
  booking_type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  meeting_link: string | null;
  customer: {
    profile: {
      full_name: string;
    } | null;
  } | null;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-primary/20 text-primary border-primary/30',
  completed: 'bg-success/20 text-success border-success/30',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
  no_show: 'bg-muted text-muted-foreground border-border',
};

const statusLabels: Record<string, string> = {
  scheduled: 'Planlagt',
  completed: 'Gennemført',
  cancelled: 'Aflyst',
  no_show: 'Ikke mødt',
};

export default function Bookings() {
  const [bookings, setBookings] = useState<BookingWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endDate = addDays(endOfWeek(new Date(), { weekStartsOn: 1 }), 7);

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(
          profile:profiles!customers_user_id_fkey(full_name)
        )
      `)
      .gte('scheduled_at', startDate.toISOString())
      .lte('scheduled_at', endDate.toISOString())
      .order('scheduled_at', { ascending: true });

    if (!error) {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const groupedBookings = bookings.reduce((acc, booking) => {
    const date = format(new Date(booking.scheduled_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {} as Record<string, BookingWithCustomer[]>);

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'I dag';
    if (isTomorrow(date)) return 'I morgen';
    return format(date, 'EEEE d. MMMM', { locale: da });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bookinger</h1>
            <p className="text-muted-foreground">Se og administrer dine konsultationer</p>
          </div>
          <Button className="rounded-xl gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Ny Booking
          </Button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : Object.keys(groupedBookings).length === 0 ? (
          <Card className="rounded-2xl border-border shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">Ingen bookinger</p>
              <p className="text-muted-foreground">Du har ingen planlagte bookinger i denne periode</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedBookings).map(([date, dayBookings]) => (
              <div key={date} className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground capitalize">
                  {getDayLabel(date)}
                </h2>
                <div className="space-y-3">
                  {dayBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="rounded-2xl border-border shadow-card transition-all duration-300 hover:shadow-hover hover:scale-[1.01]"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            {/* Time */}
                            <div className="flex flex-col items-center rounded-xl bg-primary/10 px-4 py-2">
                              <span className="text-xl font-bold text-primary">
                                {format(new Date(booking.scheduled_at), 'HH:mm')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {booking.duration_minutes} min
                              </span>
                            </div>

                            {/* Details */}
                            <div className="space-y-1">
                              <h3 className="font-semibold text-foreground">
                                {booking.customer?.profile?.full_name || 'Ukendt klient'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {booking.booking_type}
                              </p>
                              <div className="flex items-center gap-3 pt-1">
                                {booking.meeting_link && (
                                  <div className="flex items-center gap-1 text-xs text-primary">
                                    <Video className="h-3 w-3" />
                                    Online møde
                                  </div>
                                )}
                                {booking.notes && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {booking.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status */}
                          <Badge className={`${statusColors[booking.status]} border`}>
                            {statusLabels[booking.status]}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
