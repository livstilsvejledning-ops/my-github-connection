import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, Scale, Smile, Zap, Moon, Brain, Utensils, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';

interface CheckInWithCustomer {
  id: string;
  check_in_date: string;
  weight_kg: number | null;
  mood_score: number | null;
  energy_score: number | null;
  sleep_hours: number | null;
  stress_level: number | null;
  hunger_level: number | null;
  notes: string | null;
  created_at: string;
  customer: {
    profile: {
      full_name: string;
    } | null;
  } | null;
}

const ScoreIndicator = ({ score, maxScore = 5 }: { score: number | null; maxScore?: number }) => {
  if (score === null) return <span className="text-muted-foreground">-</span>;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxScore }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-4 rounded-full ${
            i < score ? 'bg-primary' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );
};

export default function CheckIns() {
  const [checkIns, setCheckIns] = useState<CheckInWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckIns();
  }, []);

  const fetchCheckIns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('check_ins')
      .select(`
        *,
        customer:customers(
          profile:profiles!customers_user_id_fkey(full_name)
        )
      `)
      .order('check_in_date', { ascending: false })
      .limit(50);

    if (!error) {
      setCheckIns(data || []);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Check-ins</h1>
            <p className="text-muted-foreground">Følg dine klienters daglige fremskridt</p>
          </div>
          <Button className="rounded-xl gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Ny Check-in
          </Button>
        </div>

        {/* Check-ins List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : checkIns.length === 0 ? (
          <Card className="rounded-2xl border-border shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">Ingen check-ins</p>
              <p className="text-muted-foreground">Dine klienter har ikke registreret check-ins endnu</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {checkIns.map((checkIn) => (
              <Card
                key={checkIn.id}
                className="rounded-2xl border-border shadow-card transition-all duration-300 hover:shadow-hover"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Client & Date */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <ClipboardCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {checkIn.customer?.profile?.full_name || 'Ukendt klient'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(checkIn.check_in_date), 'EEEE d. MMMM yyyy', { locale: da })}
                        </p>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {/* Weight */}
                      <div className="flex flex-col items-center gap-1">
                        <Scale className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {checkIn.weight_kg ? `${checkIn.weight_kg} kg` : '-'}
                        </span>
                      </div>

                      {/* Mood */}
                      <div className="flex flex-col items-center gap-1">
                        <Smile className="h-4 w-4 text-muted-foreground" />
                        <ScoreIndicator score={checkIn.mood_score} />
                      </div>

                      {/* Energy */}
                      <div className="flex flex-col items-center gap-1">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <ScoreIndicator score={checkIn.energy_score} />
                      </div>

                      {/* Sleep */}
                      <div className="flex flex-col items-center gap-1">
                        <Moon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {checkIn.sleep_hours ? `${checkIn.sleep_hours}t` : '-'}
                        </span>
                      </div>

                      {/* Stress */}
                      <div className="flex flex-col items-center gap-1">
                        <Brain className="h-4 w-4 text-muted-foreground" />
                        <ScoreIndicator score={checkIn.stress_level} />
                      </div>

                      {/* Hunger */}
                      <div className="flex flex-col items-center gap-1">
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                        <ScoreIndicator score={checkIn.hunger_level} />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {checkIn.notes && (
                    <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-4">
                      {checkIn.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
