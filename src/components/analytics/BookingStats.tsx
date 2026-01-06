import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingStatsProps {
  totalThisMonth: number;
  completionRate: number;
  noShowRate: number;
  avgDuration: number;
  typeBreakdown: { name: string; value: number; color: string }[];
}

export function BookingStats({ 
  totalThisMonth, 
  completionRate, 
  noShowRate, 
  avgDuration,
  typeBreakdown 
}: BookingStatsProps) {
  return (
    <Card className="rounded-2xl border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Calendar className="h-5 w-5 text-primary" />
          Booking Statistik
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-muted/30 text-center">
            <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalThisMonth}</p>
            <p className="text-xs text-muted-foreground">Denne måned</p>
          </div>
          
          <div className="p-4 rounded-xl bg-muted/30 text-center">
            <CheckCircle className={cn(
              "h-5 w-5 mx-auto mb-2",
              completionRate >= 80 ? "text-success" : "text-primary"
            )} />
            <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Gennemført</p>
          </div>
          
          <div className="p-4 rounded-xl bg-muted/30 text-center">
            <XCircle className={cn(
              "h-5 w-5 mx-auto mb-2",
              noShowRate > 10 ? "text-destructive" : "text-muted-foreground"
            )} />
            <p className={cn(
              "text-2xl font-bold",
              noShowRate > 10 ? "text-destructive" : "text-foreground"
            )}>
              {noShowRate}%
            </p>
            <p className="text-xs text-muted-foreground">No-show</p>
          </div>
          
          <div className="p-4 rounded-xl bg-muted/30 text-center">
            <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{avgDuration}</p>
            <p className="text-xs text-muted-foreground">Gns. min</p>
          </div>
        </div>

        {/* Type Breakdown Chart */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">
            Booking Typer Fordeling
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {typeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(0 0% 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  formatter={(value: string) => (
                    <span className="text-xs text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
