import { useState, useEffect } from 'react';
import { Bell, Flame } from 'lucide-react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { QuickStatsCards } from '@/components/client/QuickStatsCards';
import { DailyTasksCard } from '@/components/client/DailyTasksCard';
import { DailyCheckInCard } from '@/components/client/DailyCheckInCard';
import { WaterTracker } from '@/components/client/WaterTracker';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [stats, setStats] = useState({
    caloriesEaten: 0,
    caloriesGoal: 2000,
    waterDrunk: 0,
    waterGoal: 2000,
    currentWeight: 0,
    startWeight: 0,
    streak: 0
  });
  const [tasks, setTasks] = useState([
    { id: '1', label: 'Morgenmad logget', completed: false },
    { id: '2', label: 'Vægt registreret', completed: false },
    { id: '3', label: 'Daglig check-in', completed: false },
    { id: '4', label: '2L vand drukket', completed: false },
  ]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    if (profileData) setProfile(profileData);

    // Fetch today's water
    const { data: waterData } = await supabase
      .from('water_logs')
      .select('amount_ml')
      .eq('logged_date', today);
    const totalWater = waterData?.reduce((sum, log) => sum + log.amount_ml, 0) || 0;

    // Fetch today's food
    const { data: foodData } = await supabase
      .from('food_logs')
      .select('calories')
      .eq('logged_date', today);
    const totalCalories = foodData?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;

    // Fetch latest check-in for weight
    const { data: checkInData } = await supabase
      .from('check_ins')
      .select('weight_kg')
      .order('check_in_date', { ascending: false })
      .limit(1);

    setStats(prev => ({
      ...prev,
      waterDrunk: totalWater,
      caloriesEaten: totalCalories,
      currentWeight: checkInData?.[0]?.weight_kg || 0
    }));

    // Update tasks based on data
    setTasks(prev => prev.map(task => {
      if (task.id === '4') return { ...task, completed: totalWater >= 2000 };
      if (task.id === '1') return { ...task, completed: (foodData?.length || 0) > 0 };
      return task;
    }));
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleCheckIn = async (data: any) => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    await supabase.from('check_ins').insert({
      customer_id: user.id,
      check_in_date: today,
      weight_kg: data.weight,
      mood_score: data.mood,
      energy_score: data.energy,
      sleep_hours: data.sleep,
      stress_level: data.stress,
      hunger_level: data.hunger,
      notes: data.notes
    });
    
    setTasks(prev => prev.map(t => t.id === '3' ? { ...t, completed: true } : t));
    fetchData();
  };

  const handleAddWater = async (amount: number) => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    await supabase.from('water_logs').insert({
      customer_id: user.id,
      logged_date: today,
      amount_ml: amount
    });
    
    fetchData();
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'der';

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Hej {firstName}! 👋
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(), "EEEE d. MMMM", { locale: da })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {stats.streak > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{stats.streak} dage</span>
              </div>
            )}
            <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStatsCards
          caloriesEaten={stats.caloriesEaten}
          caloriesGoal={stats.caloriesGoal}
          waterDrunk={stats.waterDrunk}
          waterGoal={stats.waterGoal}
          currentWeight={stats.currentWeight}
          startWeight={stats.startWeight}
        />

        {/* Daily Tasks */}
        <DailyTasksCard tasks={tasks} onToggleTask={handleToggleTask} />

        {/* Daily Check-in */}
        <DailyCheckInCard onSubmit={handleCheckIn} lastWeight={stats.currentWeight} />

        {/* Water Tracker */}
        <WaterTracker
          currentAmount={stats.waterDrunk}
          goalAmount={stats.waterGoal}
          onAddWater={handleAddWater}
        />
      </div>
    </ClientLayout>
  );
}
