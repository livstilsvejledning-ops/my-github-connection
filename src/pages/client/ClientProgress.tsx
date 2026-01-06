import { useState, useEffect } from 'react';
import { Scale, TrendingDown, Target, Trophy } from 'lucide-react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { WeightChart } from '@/components/client/WeightChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, subWeeks } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WeightEntry {
  date: string;
  weight: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export default function ClientProgress() {
  const { user } = useAuth();
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [startWeight, setStartWeight] = useState<number>(0);
  const [goalWeight, setGoalWeight] = useState<number>(0);
  const [newWeight, setNewWeight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consistencyScore, setConsistencyScore] = useState(0);

  const achievements: Achievement[] = [
    { id: '1', title: '7-dages streak', description: 'Log ind 7 dage i træk', icon: '🔥', unlocked: true },
    { id: '2', title: 'Første måned', description: 'En måned som medlem', icon: '🏆', unlocked: true },
    { id: '3', title: '5 kg tabt', description: 'Tab dine første 5 kg', icon: '⭐', unlocked: currentWeight > 0 && startWeight - currentWeight >= 5 },
    { id: '4', title: '100% uge', description: 'Komplet alle opgaver i en uge', icon: '💎', unlocked: false },
    { id: '5', title: 'Halvvejs', description: 'Nå halvvejs til dit mål', icon: '🎯', unlocked: goalWeight > 0 && (startWeight - currentWeight) >= (startWeight - goalWeight) / 2 },
  ];

  useEffect(() => {
    if (user) fetchProgressData();
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;

    // Fetch weight history from check-ins
    const { data: checkIns } = await supabase
      .from('check_ins')
      .select('check_in_date, weight_kg')
      .not('weight_kg', 'is', null)
      .order('check_in_date', { ascending: true });

    if (checkIns && checkIns.length > 0) {
      const history = checkIns.map(c => ({
        date: c.check_in_date,
        weight: c.weight_kg as number
      }));
      setWeightHistory(history);
      setCurrentWeight(history[history.length - 1].weight);
      setStartWeight(history[0].weight);
    }

    // Fetch profile for goal weight
    const { data: profile } = await supabase
      .from('profiles')
      .select('weight_goal_kg')
      .eq('id', user.id)
      .single();

    if (profile?.weight_goal_kg) {
      setGoalWeight(profile.weight_goal_kg);
    }

    // Calculate consistency score
    const thirtyDaysAgo = format(subWeeks(new Date(), 4), 'yyyy-MM-dd');
    const [checkInCount, foodLogCount, habitLogCount] = await Promise.all([
      supabase.from('check_ins').select('id', { count: 'exact', head: true }).gte('check_in_date', thirtyDaysAgo),
      supabase.from('food_logs').select('id', { count: 'exact', head: true }).gte('logged_date', thirtyDaysAgo),
      supabase.from('habit_logs').select('id', { count: 'exact', head: true }).gte('logged_date', thirtyDaysAgo)
    ]);

    // Simple consistency calculation (can be improved)
    const totalActions = (checkInCount.count || 0) + (foodLogCount.count || 0) + (habitLogCount.count || 0);
    const expectedActions = 30 * 3; // 30 days, 3 actions per day expected
    setConsistencyScore(Math.min(Math.round((totalActions / expectedActions) * 100), 100));
  };

  const handleLogWeight = async () => {
    if (!user || !newWeight) return;
    
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error('Indtast en gyldig vægt');
      return;
    }

    setIsSubmitting(true);
    try {
      await supabase.from('check_ins').insert({
        customer_id: user.id,
        check_in_date: format(new Date(), 'yyyy-MM-dd'),
        weight_kg: weight
      });
      
      toast.success('Vægt gemt! 📊');
      setNewWeight('');
      fetchProgressData();
    } catch {
      toast.error('Kunne ikke gemme vægt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalLost = startWeight - currentWeight;
  const goalProgress = goalWeight > 0 ? Math.min(((startWeight - currentWeight) / (startWeight - goalWeight)) * 100, 100) : 0;

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Min Fremgang</h1>

        {/* Current Weight Card */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Scale className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Start</p>
              <p className="text-xl font-bold text-foreground">{startWeight || '-'} kg</p>
            </div>
            <div>
              <div className="relative">
                <p className="text-4xl font-bold text-primary">{currentWeight || '-'}</p>
                <p className="text-sm text-muted-foreground">kg nu</p>
                {totalLost > 0 && (
                  <Badge className="mt-2 bg-success text-white">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    -{totalLost.toFixed(1)} kg
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <Target className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Mål</p>
              <p className="text-xl font-bold text-foreground">{goalWeight || '-'} kg</p>
            </div>
          </div>

          {/* Goal Progress */}
          {goalWeight > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fremgang mod mål</span>
                <span className="font-medium text-primary">{goalProgress.toFixed(0)}%</span>
              </div>
              <Progress value={goalProgress} className="h-3" />
            </div>
          )}
        </div>

        {/* Log Weight */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Log Vægt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                type="number"
                step="0.1"
                placeholder="f.eks. 75.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="bg-muted/50 border-transparent focus:border-primary"
              />
              <Button
                onClick={handleLogWeight}
                disabled={isSubmitting || !newWeight}
                className="gradient-primary text-white px-6"
              >
                Gem
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Log regelmæssigt for bedst tracking
            </p>
          </CardContent>
        </Card>

        {/* Weight Chart */}
        {weightHistory.length > 1 && (
          <WeightChart
            data={weightHistory}
            goalWeight={goalWeight || undefined}
            startWeight={startWeight || undefined}
          />
        )}

        {/* Consistency Score */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Konsistens Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#consistencyGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${consistencyScore * 2.51} 251`}
                  />
                  <defs>
                    <linearGradient id="consistencyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(16 100% 60%)" />
                      <stop offset="100%" stopColor="hsl(24 52% 51%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">{consistencyScore}%</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {consistencyScore >= 80 ? 'Fantastisk!' : 
                   consistencyScore >= 50 ? 'Godt arbejde!' : 'Bliv ved!'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Baseret på check-ins, mad logs og vaner
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={cn(
                    "p-4 rounded-xl text-center transition-all",
                    achievement.unlocked
                      ? "bg-primary/10"
                      : "bg-muted/30 opacity-50"
                  )}
                >
                  <span className="text-3xl mb-2 block">{achievement.icon}</span>
                  <p className={cn(
                    "font-medium text-sm",
                    achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {achievement.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
