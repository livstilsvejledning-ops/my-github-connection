import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  label: string;
  completed: boolean;
}

interface DailyTasksCardProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
}

export function DailyTasksCard({ tasks, onToggleTask }: DailyTasksCardProps) {
  const completedCount = tasks.filter(t => t.completed).length;
  const percentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Dagens Opgaver</h3>
        <span className="text-sm font-medium text-primary">{completedCount}/{tasks.length}</span>
      </div>

      <div className="space-y-3 mb-4">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => onToggleTask(task.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
              task.completed ? "bg-primary/5" : "bg-muted/50 hover:bg-muted"
            )}
          >
            <div className={cn(
              "flex items-center justify-center h-6 w-6 rounded-full border-2 transition-all",
              task.completed 
                ? "bg-primary border-primary" 
                : "border-muted-foreground/30"
            )}>
              {task.completed && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className={cn(
              "text-sm font-medium transition-all",
              task.completed ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {task.label}
            </span>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full rounded-full gradient-primary transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {percentage}% færdig i dag
        </p>
      </div>
    </div>
  );
}
