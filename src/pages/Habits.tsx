import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Droplets, Footprints, Apple, Moon, Dumbbell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HabitWithLogs {
  id: string;
  habit_name: string;
  target_frequency: number;
  icon: string | null;
  color: string | null;
  customer: {
    profile: {
      full_name: string;
    } | null;
  } | null;
  logs_count: number;
}

const iconMap: Record<string, typeof Droplets> = {
  water: Droplets,
  steps: Footprints,
  nutrition: Apple,
  sleep: Moon,
  exercise: Dumbbell,
  default: Target,
};

export default function Habits() {
  const [habits, setHabits] = useState<HabitWithLogs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('habits')
      .select(`
        *,
        customer:customers(
          profile:profiles!customers_user_id_fkey(full_name)
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // For each habit, get this week's log count
      const habitsWithLogs = await Promise.all(
        data.map(async (habit) => {
          const startOfWeek = new Date();
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
          
          const { count } = await supabase
            .from('habit_logs')
            .select('*', { count: 'exact', head: true })
            .eq('habit_id', habit.id)
            .eq('completed', true)
            .gte('logged_date', startOfWeek.toISOString().split('T')[0]);

          return { ...habit, logs_count: count || 0 };
        })
      );
      setHabits(habitsWithLogs);
    }
    setLoading(false);
  };

  const getIcon = (iconName: string | null) => {
    const Icon = iconName ? iconMap[iconName] || iconMap.default : iconMap.default;
    return Icon;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vaner</h1>
            <p className="text-muted-foreground">Følg med i dine klienters daglige vaner</p>
          </div>
          <Button className="rounded-xl gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Ny Vane
          </Button>
        </div>

        {/* Habits Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : habits.length === 0 ? (
          <Card className="rounded-2xl border-border shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">Ingen vaner</p>
              <p className="text-muted-foreground">Opret vaner for dine klienter at tracke</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {habits.map((habit) => {
              const Icon = getIcon(habit.icon);
              const progress = (habit.logs_count / habit.target_frequency) * 100;

              return (
                <Card
                  key={habit.id}
                  className="group rounded-2xl border-border shadow-card transition-all duration-300 hover:shadow-hover hover:scale-[1.02]"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{ backgroundColor: habit.color ? `${habit.color}20` : 'hsl(var(--primary) / 0.1)' }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: habit.color || 'hsl(var(--primary))' }}
                          />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-foreground">
                            {habit.habit_name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {habit.customer?.profile?.full_name || 'Ukendt'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Denne uge</span>
                        <span className="font-medium text-foreground">
                          {habit.logs_count} / {habit.target_frequency}
                        </span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center">
                      <Badge
                        variant="secondary"
                        className={
                          progress >= 100
                            ? 'bg-success/20 text-success border-0'
                            : progress >= 50
                            ? 'bg-accent/20 text-accent-foreground border-0'
                            : 'bg-muted text-muted-foreground border-0'
                        }
                      >
                        {progress >= 100 ? 'Mål nået!' : progress >= 50 ? 'God fremgang' : 'Kom i gang'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {habit.target_frequency}x/uge
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
