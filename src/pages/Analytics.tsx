import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { BarChart3, TrendingUp, Users, Target, Calendar, Activity } from 'lucide-react';

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Statistik</h1>
          <p className="text-muted-foreground">Få overblik over din praksis performance</p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Nye Klienter (30d)"
            value="12"
            change="+20% fra sidste måned"
            changeType="positive"
            icon={Users}
          />
          <StatCard
            title="Gennemførte Sessioner"
            value="48"
            change="96% gennemførelsesrate"
            changeType="positive"
            icon={Calendar}
          />
          <StatCard
            title="Vaner Opfyldt"
            value="78%"
            change="+5% fra sidste uge"
            changeType="positive"
            icon={Target}
          />
          <StatCard
            title="Gns. Check-in Score"
            value="4.2"
            change="Ud af 5"
            changeType="neutral"
            icon={Activity}
          />
        </div>

        {/* Charts Placeholder */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <BarChart3 className="h-5 w-5 text-primary" />
                Klient Vækst
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-xl bg-muted/30">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Klient vækst over tid</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Data vil vises når du har mere aktivitet
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="h-5 w-5 text-success" />
                Gennemsnitlig Vægtudvikling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-xl bg-muted/30">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Vægtudvikling på tværs af klienter</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Kræver check-in data fra klienter
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary */}
        <Card className="rounded-2xl border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5 text-accent" />
              Aktivitetsoversigt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Beskeder sendt</p>
                <p className="text-2xl font-bold text-foreground mt-1">156</p>
                <p className="text-xs text-muted-foreground mt-1">Denne måned</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Kostplaner oprettet</p>
                <p className="text-2xl font-bold text-foreground mt-1">24</p>
                <p className="text-xs text-muted-foreground mt-1">Denne måned</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Check-ins modtaget</p>
                <p className="text-2xl font-bold text-foreground mt-1">312</p>
                <p className="text-xs text-muted-foreground mt-1">Denne måned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
