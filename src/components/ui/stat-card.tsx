import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  iconColor = 'text-primary'
}: StatCardProps) {
  return (
    <div className="group relative rounded-2xl bg-card shadow-card overflow-hidden transition-all duration-300 hover:shadow-hover hover:-translate-y-1">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
      
      <div className="p-6 pt-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-card-foreground tracking-tight">{value}</p>
            {change && (
              <p className={cn(
                "text-sm font-medium flex items-center gap-1",
                changeType === 'positive' && "text-success",
                changeType === 'negative' && "text-destructive",
                changeType === 'neutral' && "text-muted-foreground"
              )}>
                {changeType === 'positive' && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {changeType === 'negative' && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {change}
              </p>
            )}
          </div>
          <div className={cn(
            "rounded-xl p-3 transition-all duration-300",
            "bg-primary/10 group-hover:bg-primary/15 group-hover:scale-110"
          )}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </div>
    </div>
  );
}
