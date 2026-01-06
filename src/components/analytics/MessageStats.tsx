import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Mail, Clock, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatsProps {
  totalSent: number;
  avgResponseTime: string;
  automatedRatio: number;
  unreadCount: number;
  openRates: {
    type: string;
    rate: number;
  }[];
}

export function MessageStats({ totalSent, avgResponseTime, automatedRatio, unreadCount, openRates }: MessageStatsProps) {
  return (
    <Card className="rounded-2xl border-border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="h-5 w-5 text-primary" />
          Besked Statistik
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total sendt</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalSent}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Gns. svartid</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{avgResponseTime}</p>
          </div>
          
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Automatiske</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{automatedRatio}%</p>
          </div>
          
          <div className="p-4 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Ulæste</span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              unreadCount > 0 ? "text-destructive" : "text-foreground"
            )}>
              {unreadCount}
            </p>
          </div>
        </div>

        {/* Open Rates */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">
            Automatiske Besked Åbningsrater
          </h4>
          <div className="space-y-3">
            {openRates.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.type}</span>
                  <span className={cn(
                    "font-medium",
                    item.rate >= 70 ? "text-success" : 
                    item.rate >= 50 ? "text-primary" : "text-destructive"
                  )}>
                    {item.rate}%
                  </span>
                </div>
                <Progress 
                  value={item.rate} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
