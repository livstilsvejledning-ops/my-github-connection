import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, UtensilsCrossed, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    todayBookings: 0,
    activeMealPlans: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchUpcomingBookings();
    fetchRecentCheckIns();
  }, []);

  const fetchStats = async () => {
    const [customersRes, activeRes, bookingsRes, mealPlansRes] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('customers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('bookings').select('id', { count: 'exact', head: true })
        .gte('scheduled_at', new Date().toISOString().split('T')[0])
        .lt('scheduled_at', new Date(Date.now() + 86400000).toISOString().split('T')[0]),
      supabase.from('meal_plans').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      totalCustomers: customersRes.count || 0,
      activeCustomers: activeRes.count || 0,
      todayBookings: bookingsRes.count || 0,
      activeMealPlans: mealPlansRes.count || 0,
    });
  };

  const fetchUpcomingBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(
          user_id,
          profile:profiles(full_name)
        )
      `)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(5);
    
    setUpcomingBookings(data || []);
  };

  const fetchRecentCheckIns = async () => {
    const { data } = await supabase
      .from('check_ins')
      .select(`
        *,
        customer:customers(
          user_id,
          profile:profiles(full_name)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    setRecentCheckIns(data || []);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Velkommen tilbage! Her er din daglige oversigt.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Totale Klienter"
            value={stats.totalCustomers}
            icon={Users}
            change="+12% denne måned"
            changeType="positive"
          />
          <StatCard
            title="Aktive Klienter"
            value={stats.activeCustomers}
            icon={TrendingUp}
            change={`${stats.totalCustomers > 0 ? Math.round((stats.activeCustomers / stats.totalCustomers) * 100) : 0}% af total`}
            changeType="neutral"
          />
          <StatCard
            title="Dagens Bookinger"
            value={stats.todayBookings}
            icon={Calendar}
          />
          <StatCard
            title="Aktive Kostplaner"
            value={stats.activeMealPlans}
            icon={UtensilsCrossed}
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Bookings */}
          <Card className="rounded-2xl border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-primary" />
                Kommende Bookinger
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Ingen kommende bookinger
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {booking.customer?.profile?.full_name || 'Ukendt'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.booking_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(booking.scheduled_at), 'HH:mm', { locale: da })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(booking.scheduled_at), 'd. MMM', { locale: da })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Check-ins */}
          <Card className="rounded-2xl border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <CheckCircle className="h-5 w-5 text-success" />
                Seneste Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentCheckIns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Ingen check-ins endnu
                </p>
              ) : (
                <div className="space-y-3">
                  {recentCheckIns.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="flex items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {checkIn.customer?.profile?.full_name || 'Ukendt'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {checkIn.weight_kg && (
                            <Badge variant="secondary" className="text-xs">
                              {checkIn.weight_kg} kg
                            </Badge>
                          )}
                          {checkIn.mood_score && (
                            <Badge variant="secondary" className="text-xs">
                              Humør: {checkIn.mood_score}/5
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(checkIn.check_in_date), 'd. MMM', { locale: da })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
