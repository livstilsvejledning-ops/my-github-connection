import { Check, Flame, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface HabitCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetDays: number;
  weekProgress: boolean[];
  streak: number;
  onToggleDay: (habitId: string, dayIndex: number) => void;
  onEdit: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

const dayLabels = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

export function HabitCard({
  id,
  name,
  icon,
  targetDays,
  weekProgress,
  streak,
  onToggleDay,
  onEdit,
  onDelete
}: HabitCardProps) {
  const completedDays = weekProgress.filter(Boolean).length;
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{name}</h4>
            <p className="text-xs text-muted-foreground">{targetDays}/7 dage om ugen</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(id)}>
              <Pencil className="h-4 w-4 mr-2" />
              Rediger
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Slet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Week Progress */}
      <div className="flex justify-between gap-1 mb-4">
        {dayLabels.map((day, index) => {
          const isCompleted = weekProgress[index];
          const isToday = index === todayIndex;
          
          return (
            <button
              key={index}
              onClick={() => onToggleDay(id, index)}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 py-2 rounded-lg transition-all",
                isToday && "ring-2 ring-primary ring-offset-1"
              )}
            >
              <span className="text-xs text-muted-foreground">{day}</span>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                isCompleted 
                  ? "bg-primary" 
                  : "bg-muted border-2 border-muted-foreground/20"
              )}>
                {isCompleted && <Check className="h-3 w-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Streak */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Flame className={cn(
            "h-4 w-4",
            streak > 0 ? "text-primary" : "text-muted-foreground"
          )} />
          <span className={cn(
            "text-sm font-medium",
            streak > 0 ? "text-primary" : "text-muted-foreground"
          )}>
            {streak} dages streak
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {completedDays}/{targetDays} denne uge
        </span>
      </div>
    </div>
  );
}
