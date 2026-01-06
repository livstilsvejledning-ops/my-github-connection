import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FoodLogEntryProps {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FoodLogEntry({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
  time,
  onEdit,
  onDelete
}: FoodLogEntryProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors group">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{name}</span>
          <span className="text-sm font-semibold text-primary">{calories} kcal</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {protein !== undefined && (
            <Badge variant="outline" className="text-xs py-0 px-1.5 border-primary/30 text-primary">
              P: {protein}g
            </Badge>
          )}
          {carbs !== undefined && (
            <Badge variant="outline" className="text-xs py-0 px-1.5 border-secondary/30 text-secondary">
              K: {carbs}g
            </Badge>
          )}
          {fat !== undefined && (
            <Badge variant="outline" className="text-xs py-0 px-1.5 border-accent/30 text-accent-foreground">
              F: {fat}g
            </Badge>
          )}
          {time && (
            <span className="text-xs text-muted-foreground ml-2">{time}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(id)}
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
