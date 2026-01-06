import { useState, useEffect } from 'react';
import { Plus, Flame } from 'lucide-react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { HabitCard } from '@/components/client/HabitCard';
import { AddHabitModal } from '@/components/client/AddHabitModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, addDays } from 'date-fns';
import { toast } from 'sonner';

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetDays: number;
  weekProgress: boolean[];
  streak: number;
}

export default function ClientHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    if (user) fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;

    const { data: habitsData } = await supabase
      .from('habits')
      .select('*, habit_logs(*)')
      .order('created_at');

    if (habitsData) {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekDates = Array.from({ length: 7 }, (_, i) => 
        format(addDays(weekStart, i), 'yyyy-MM-dd')
      );

      const formattedHabits: Habit[] = habitsData.map(h => ({
        id: h.id,
        name: h.habit_name,
        icon: h.icon || '💪',
        color: h.color || '#FF6B35',
        targetDays: h.target_frequency || 7,
        weekProgress: weekDates.map(date => 
          h.habit_logs?.some((log: any) => log.logged_date === date && log.completed) || false
        ),
        streak: 0
      }));

      setHabits(formattedHabits);
    }
  };

  const handleToggleDay = async (habitId: string, dayIndex: number) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const logDate = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
    
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.weekProgress[dayIndex];

    if (isCompleted) {
      await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId)
        .eq('logged_date', logDate);
    } else {
      await supabase.from('habit_logs').insert({
        habit_id: habitId,
        logged_date: logDate,
        completed: true
      });
      toast.success('Vane fuldført! 🎉');
    }

    fetchHabits();
  };

  const handleAddHabit = async (data: any) => {
    if (!user) return;

    await supabase.from('habits').insert({
      customer_id: user.id,
      habit_name: data.name,
      icon: data.icon,
      color: data.color,
      target_frequency: data.targetDays
    });

    fetchHabits();
  };

  const handleDeleteHabit = async (habitId: string) => {
    await supabase.from('habits').delete().eq('id', habitId);
    fetchHabits();
    toast.success('Vane slettet');
  };

  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mine Vaner</h1>
            {totalStreak > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">{totalStreak} dages streak</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={() => setIsAddModalOpen(true)}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tilføj Vane
          </Button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl">
            <p className="text-muted-foreground mb-4">Ingen vaner endnu</p>
            <Button onClick={() => setIsAddModalOpen(true)} className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Tilføj din første vane
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map(habit => (
              <HabitCard
                key={habit.id}
                {...habit}
                onToggleDay={handleToggleDay}
                onEdit={() => setEditingHabit(habit)}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        )}

        <AddHabitModal
          isOpen={isAddModalOpen || !!editingHabit}
          onClose={() => { setIsAddModalOpen(false); setEditingHabit(null); }}
          onSubmit={handleAddHabit}
          initialData={editingHabit ? {
            name: editingHabit.name,
            icon: editingHabit.icon,
            color: editingHabit.color,
            targetDays: editingHabit.targetDays
          } : undefined}
        />
      </div>
    </ClientLayout>
  );
}
