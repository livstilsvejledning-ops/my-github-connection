import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle, Utensils, Droplets, Target } from 'lucide-react';

interface EngagementData {
  name: string;
  value: number;
  icon: string;
}

interface TrendData {
  date: string;
  checkIns: number;
  foodLogs: number;
  habitLogs: number;
}

interface EngagementMetricsProps {
  featureUsage: EngagementData[];
  complianceTrend: TrendData[];
  dailyActiveUsers: { date: string; users: number }[];
}

export function EngagementMetrics({ featureUsage, complianceTrend, dailyActiveUsers }: EngagementMetricsProps) {
  return (
    <div className="space-y-6">
      {/* Feature Usage */}
      <Card className="rounded-2xl border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            Feature Brug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureUsage} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(20 15% 45%)' }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [value, 'Antal']}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#barGradient)" 
                  radius={[0, 8, 8, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(16 100% 60%)" />
                    <stop offset="100%" stopColor="hsl(24 52% 51%)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Trends */}
      <Card className="rounded-2xl border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Target className="h-5 w-5 text-primary" />
            Compliance Trends (12 uger)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complianceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 30% 88%)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(20 15% 45%)' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(20 15% 45%)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="checkIns" 
                  stroke="hsl(16 100% 60%)" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Check-ins"
                />
                <Line 
                  type="monotone" 
                  dataKey="foodLogs" 
                  stroke="hsl(24 52% 51%)" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Mad logs"
                />
                <Line 
                  type="monotone" 
                  dataKey="habitLogs" 
                  stroke="hsl(45 100% 54%)" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Vane logs"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Check-ins</span>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-secondary" />
              <span className="text-sm text-muted-foreground">Mad logs</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Vane logs</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Active Users */}
      <Card className="rounded-2xl border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            Daglige Aktive Brugere (30 dage)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActiveUsers}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(20 15% 45%)' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(20 15% 45%)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [value, 'Brugere']}
                />
                <Bar 
                  dataKey="users" 
                  fill="hsl(16 100% 60%)" 
                  radius={[4, 4, 0, 0]}
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
