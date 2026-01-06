import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatCard } from '@/components/ui/stat-card';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  UtensilsCrossed,
  Scale,
  Target,
  Clock,
  TrendingUp,
  CheckCircle,
  Activity,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CustomerDetail {
  id: string;
  user_id: string;
  status: string;
  subscription_type: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
    birth_date: string | null;
    gender: string | null;
    height_cm: number | null;
    weight_goal_kg: number | null;
    activity_level: string | null;
    profile_image_url: string | null;
  } | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Aktiv', className: 'bg-success/20 text-success border-success/30' },
  inactive: { label: 'Inaktiv', className: 'bg-muted text-muted-foreground border-border' },
  on_hold: { label: 'På pause', className: 'bg-accent/30 text-accent-foreground border-accent/50' },
  completed: { label: 'Afsluttet', className: 'bg-secondary/20 text-secondary-foreground border-secondary/30' },
};

// Mock activity data
const mockActivities = [
  { id: 1, type: 'check_in', description: 'Registrerede check-in', date: new Date(Date.now() - 86400000) },
  { id: 2, type: 'message', description: 'Sendte en besked', date: new Date(Date.now() - 172800000) },
  { id: 3, type: 'meal_plan', description: 'Ny kostplan tildelt', date: new Date(Date.now() - 259200000) },
  { id: 4, type: 'booking', description: 'Konsultation gennemført', date: new Date(Date.now() - 432000000) },
];

export default function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [latestWeight, setLatestWeight] = useState<number | null>(null);

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
      fetchLatestCheckIn();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();

    if (error || !data) {
      toast({
        variant: 'destructive',
        title: 'Fejl',
        description: 'Kunne ikke finde kunden',
      });
      navigate('/customers');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user_id)
      .maybeSingle();

    setCustomer({ ...data, profile } as CustomerDetail);
    setLoading(false);
  };

  const fetchLatestCheckIn = async () => {
    const { data } = await supabase
      .from('check_ins')
      .select('weight_kg')
      .eq('customer_id', customerId)
      .order('check_in_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.weight_kg) {
      setLatestWeight(Number(data.weight_kg));
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const calculateDaysRemaining = () => {
    if (!customer?.subscription_end_date) return null;
    const end = new Date(customer.subscription_end_date);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'check_in': return CheckCircle;
      case 'message': return MessageSquare;
      case 'meal_plan': return UtensilsCrossed;
      case 'booking': return Calendar;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) return null;

  const status = statusConfig[customer.status] || statusConfig.inactive;
  const daysRemaining = calculateDaysRemaining();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/customers')}
          className="rounded-xl -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbage til klienter
        </Button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Picture */}
          <Avatar className="h-28 w-28 ring-4 ring-primary/20 shadow-lg">
            <AvatarImage src={customer.profile?.profile_image_url || ''} />
            <AvatarFallback className="gradient-primary text-primary-foreground text-3xl font-bold">
              {getInitials(customer.profile?.full_name || 'U')}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {customer.profile?.full_name || 'Ukendt'}
              </h1>
              <Badge className={cn("text-sm border px-3 py-1", status.className)}>
                {status.label}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-4 text-muted-foreground">
              {customer.profile?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{customer.profile.email}</span>
                </div>
              )}
              {customer.profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{customer.profile.phone}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {customer.tags && customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <Button className="rounded-xl border-primary text-primary hover:bg-primary/10" variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Rediger Profil
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Oversigt
            </TabsTrigger>
            <TabsTrigger value="meal-plans" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Måltidsplaner
            </TabsTrigger>
            <TabsTrigger value="messages" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Beskeder
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Bookings
            </TabsTrigger>
            <TabsTrigger value="check-ins" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Check-ins
            </TabsTrigger>
            <TabsTrigger value="progress" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
              Fremskridt
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Aktuel Vægt"
                value={latestWeight ? `${latestWeight} kg` : '-'}
                icon={Scale}
                change={latestWeight && customer.profile?.weight_goal_kg 
                  ? `${(latestWeight - Number(customer.profile.weight_goal_kg)).toFixed(1)} kg til mål`
                  : undefined}
                changeType={latestWeight && customer.profile?.weight_goal_kg && latestWeight <= Number(customer.profile.weight_goal_kg) ? 'positive' : 'neutral'}
              />
              <StatCard
                title="Målvægt"
                value={customer.profile?.weight_goal_kg ? `${customer.profile.weight_goal_kg} kg` : '-'}
                icon={Target}
              />
              <StatCard
                title="Dage Tilbage"
                value={daysRemaining !== null ? daysRemaining : '-'}
                icon={Clock}
                change={customer.subscription_end_date 
                  ? `Slutter ${format(new Date(customer.subscription_end_date), 'd. MMM yyyy', { locale: da })}`
                  : undefined}
              />
              <StatCard
                title="Compliance Rate"
                value="87%"
                icon={TrendingUp}
                change="+5% denne uge"
                changeType="positive"
              />
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Activity Timeline */}
              <Card className="lg:col-span-2 rounded-2xl border-border shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-primary" />
                    Seneste Aktivitet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative space-y-4">
                    {mockActivities.map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex gap-4">
                          <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            {index < mockActivities.length - 1 && (
                              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border" />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="font-medium text-foreground">{activity.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(activity.date, "d. MMMM 'kl.' HH:mm", { locale: da })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="rounded-2xl border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Hurtige Handlinger</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full rounded-xl gradient-primary text-white justify-start"
                    onClick={() => navigate(`/messages?to=${customer.user_id}`)}
                  >
                    <MessageSquare className="mr-3 h-4 w-4" />
                    Send Besked
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full rounded-xl border-primary/50 text-primary hover:bg-primary/10 justify-start"
                    onClick={() => navigate(`/bookings?customer=${customer.id}`)}
                  >
                    <Calendar className="mr-3 h-4 w-4" />
                    Book Møde
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full rounded-xl border-primary/50 text-primary hover:bg-primary/10 justify-start"
                    onClick={() => navigate(`/meal-plans?customer=${customer.id}`)}
                  >
                    <UtensilsCrossed className="mr-3 h-4 w-4" />
                    Opret Måltidsplan
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {customer.notes && (
              <Card className="rounded-2xl border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Noter</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Other Tabs - Placeholders */}
          <TabsContent value="meal-plans">
            <Card className="rounded-2xl border-border shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">Måltidsplaner</p>
                <p className="text-muted-foreground">Kommer snart...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="rounded-2xl border-border shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">Beskeder</p>
                <p className="text-muted-foreground">Kommer snart...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="rounded-2xl border-border shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">Bookings</p>
                <p className="text-muted-foreground">Kommer snart...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="check-ins">
            <Card className="rounded-2xl border-border shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">Check-ins</p>
                <p className="text-muted-foreground">Kommer snart...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="rounded-2xl border-border shadow-card">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">Fremskridt</p>
                <p className="text-muted-foreground">Kommer snart...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
