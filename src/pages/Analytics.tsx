import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AtRiskAlert } from '@/components/analytics/AtRiskAlert';
import { CustomerSegmentation } from '@/components/analytics/CustomerSegmentation';
import { EngagementMetrics } from '@/components/analytics/EngagementMetrics';
import { MessageStats } from '@/components/analytics/MessageStats';
import { BookingStats } from '@/components/analytics/BookingStats';
import { Users, TrendingUp, Target, Calendar, Plus, MessageCircle, UtensilsCrossed } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subWeeks } from 'date-fns';
import { da } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    complianceRate: 0,
    upcomingBookings: 0,
    newThisWeek: 0
  });
  const [atRiskCustomers, setAtRiskCustomers] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);
  const [featureUsage, setFeatureUsage] = useState<any[]>([]);
  const [complianceTrend, setComplianceTrend] = useState<any[]>([]);
  const [dailyActiveUsers, setDailyActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchStats(),
      fetchAtRiskCustomers(),
      fetchSegmentation(),
      fetchEngagementData()
    ]);
  };

  const fetchStats = async () => {
    const today = new Date();
    const weekAgo = subDays(today, 7);

    const [customersRes, activeRes, newRes, bookingsRes, checkInsRes] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('customers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('customers').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('scheduled_at', today.toISOString()),
      supabase.from('check_ins').select('id', { count: 'exact', head: true }).gte('check_in_date', format(weekAgo, 'yyyy-MM-dd'))
    ]);

    const totalCustomers = customersRes.count || 0;
    const activeCustomers = activeRes.count || 0;
    const checkInsCount = checkInsRes.count || 0;
    
    // Calculate compliance as check-ins per active customer per week
    const complianceRate = activeCustomers > 0 
      ? Math.min(Math.round((checkInsCount / (activeCustomers * 7)) * 100), 100)
      : 0;

    setStats({
      totalCustomers,
      activeCustomers,
      complianceRate,
      upcomingBookings: bookingsRes.count || 0,
      newThisWeek: newRes.count || 0
    });
  };

  const fetchAtRiskCustomers = async () => {
    const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    
    // Get customers with their latest check-in
    const { data: customers } = await supabase
      .from('customers')
      .select(`
        id,
        status,
        profiles!inner(full_name, email)
      `)
      .eq('status', 'active');

    if (!customers) return;

    // Get latest check-ins for each customer
    const { data: recentCheckIns } = await supabase
      .from('check_ins')
      .select('customer_id, check_in_date')
      .gte('check_in_date', sevenDaysAgo);

    const recentCheckInIds = new Set(recentCheckIns?.map(c => c.customer_id) || []);

    // Filter at-risk customers (no recent check-in)
    const atRisk = customers
      .filter(c => !recentCheckInIds.has(c.id))
      .map(c => ({
        id: c.id,
        name: (c.profiles as any)?.full_name || 'Ukendt',
        email: (c.profiles as any)?.email || '',
        reasons: ['Ingen check-in i 7+ dage'],
        lastActivity: 'Mere end 7 dage siden'
      }));

    setAtRiskCustomers(atRisk);
  };

  const fetchSegmentation = async () => {
    const { data: customers } = await supabase
      .from('customers')
      .select('status, subscription_type');

    if (!customers) return;

    // Status distribution
    const statusCounts = customers.reduce((acc: any, c) => {
      const status = c.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    setStatusData([
      { name: 'Aktive', value: statusCounts['active'] || 0, color: 'hsl(88 50% 53%)' },
      { name: 'Inaktive', value: statusCounts['inactive'] || 0, color: 'hsl(20 15% 45%)' },
      { name: 'On Hold', value: statusCounts['on_hold'] || 0, color: 'hsl(45 100% 54%)' },
      { name: 'Afsluttet', value: statusCounts['completed'] || 0, color: 'hsl(16 100% 60%)' }
    ].filter(d => d.value > 0));

    // Subscription distribution
    const subCounts = customers.reduce((acc: any, c) => {
      const sub = c.subscription_type || 'Ingen';
      acc[sub] = (acc[sub] || 0) + 1;
      return acc;
    }, {});

    setSubscriptionData([
      { name: 'Basic', value: subCounts['basic'] || 0, color: 'hsl(16 100% 70%)' },
      { name: 'Premium', value: subCounts['premium'] || 0, color: 'hsl(16 100% 60%)' },
      { name: 'VIP', value: subCounts['vip'] || 0, color: 'hsl(24 52% 51%)' },
      { name: 'Ingen', value: subCounts['Ingen'] || 0, color: 'hsl(30 33% 93%)' }
    ].filter(d => d.value > 0));
  };

  const fetchEngagementData = async () => {
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

    const [checkIns, foodLogs, habitLogs, waterLogs] = await Promise.all([
      supabase.from('check_ins').select('id', { count: 'exact', head: true }).gte('check_in_date', thirtyDaysAgo),
      supabase.from('food_logs').select('id', { count: 'exact', head: true }).gte('logged_date', thirtyDaysAgo),
      supabase.from('habit_logs').select('id', { count: 'exact', head: true }).gte('logged_date', thirtyDaysAgo),
      supabase.from('water_logs').select('id', { count: 'exact', head: true }).gte('logged_date', thirtyDaysAgo)
    ]);

    setFeatureUsage([
      { name: 'Check-ins', value: checkIns.count || 0 },
      { name: 'Mad logs', value: foodLogs.count || 0 },
      { name: 'Vane logs', value: habitLogs.count || 0 },
      { name: 'Vand logs', value: waterLogs.count || 0 }
    ]);

    // Generate compliance trend (mock data for now)
    const trend = Array.from({ length: 12 }, (_, i) => ({
      date: format(subWeeks(new Date(), 11 - i), 'dd/MM'),
      checkIns: Math.floor(Math.random() * 50) + 20,
      foodLogs: Math.floor(Math.random() * 100) + 50,
      habitLogs: Math.floor(Math.random() * 80) + 30
    }));
    setComplianceTrend(trend);

    // Generate daily active users (mock data for now)
    const dau = Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'dd/MM'),
      users: Math.floor(Math.random() * 15) + 5
    }));
    setDailyActiveUsers(dau);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header with Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Komplet overblik over din praksis</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="gradient-primary text-white">
              <Link to="/customers">
                <Plus className="h-4 w-4 mr-2" />
                Opret Kunde
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/bookings">
                <Calendar className="h-4 w-4 mr-2" />
                Book Møde
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/meal-plans">
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Ny Måltidsplan
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/messages">
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Besked
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Kunder"
            value={stats.totalCustomers}
            change={`+${stats.newThisWeek} denne uge`}
            changeType="positive"
            icon={Users}
          />
          <StatCard
            title="Aktive Kunder"
            value={stats.activeCustomers}
            change={`${stats.totalCustomers > 0 ? Math.round((stats.activeCustomers / stats.totalCustomers) * 100) : 0}% af total`}
            changeType="neutral"
            icon={TrendingUp}
          />
          <StatCard
            title="Gns. Compliance"
            value={`${stats.complianceRate}%`}
            change={stats.complianceRate >= 70 ? "God rate!" : "Kan forbedres"}
            changeType={stats.complianceRate >= 70 ? "positive" : stats.complianceRate >= 50 ? "neutral" : "negative"}
            icon={Target}
          />
          <StatCard
            title="Kommende Bookings"
            value={stats.upcomingBookings}
            icon={Calendar}
          />
        </div>

        {/* At-Risk Alert */}
        {atRiskCustomers.length > 0 && (
          <AtRiskAlert
            customers={atRiskCustomers}
            onSendMessage={(id) => console.log('Send message to', id)}
            onBookMeeting={(id) => console.log('Book meeting with', id)}
          />
        )}

        {/* Customer Segmentation */}
        <CustomerSegmentation
          statusData={statusData}
          subscriptionData={subscriptionData}
        />

        {/* Engagement Metrics */}
        <EngagementMetrics
          featureUsage={featureUsage}
          complianceTrend={complianceTrend}
          dailyActiveUsers={dailyActiveUsers}
        />

        {/* Message & Booking Stats */}
        <div className="grid gap-6 lg:grid-cols-2">
          <MessageStats
            totalSent={156}
            avgResponseTime="2.5 timer"
            automatedRatio={35}
            unreadCount={3}
            openRates={[
              { type: 'Velkomst besked', rate: 92 },
              { type: 'Ugentlig check-in', rate: 78 },
              { type: 'Måltidsplan klar', rate: 85 },
              { type: 'Motivation', rate: 65 }
            ]}
          />
          <BookingStats
            totalThisMonth={48}
            completionRate={94}
            noShowRate={4}
            avgDuration={45}
            typeBreakdown={[
              { name: 'Opfølgning', value: 20, color: 'hsl(16 100% 60%)' },
              { name: 'Første konsultation', value: 8, color: 'hsl(24 52% 51%)' },
              { name: 'Målingsmøde', value: 12, color: 'hsl(45 100% 54%)' },
              { name: 'Video call', value: 8, color: 'hsl(88 50% 53%)' }
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
