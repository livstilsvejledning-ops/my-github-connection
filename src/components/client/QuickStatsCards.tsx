import { Flame, Droplets, Scale, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStatsCardsProps {
  caloriesEaten: number;
  caloriesGoal: number;
  waterDrunk: number;
  waterGoal: number;
  currentWeight: number;
  startWeight: number;
  nextMeal?: {
    name: string;
    calories: number;
    time: string;
  };
}

export function QuickStatsCards({
  caloriesEaten,
  caloriesGoal,
  waterDrunk,
  waterGoal,
  currentWeight,
  startWeight,
  nextMeal
}: QuickStatsCardsProps) {
  const caloriesPercentage = Math.min((caloriesEaten / caloriesGoal) * 100, 100);
  const waterPercentage = Math.min((waterDrunk / waterGoal) * 100, 100);
  const weightDiff = currentWeight - startWeight;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Calories Card */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Flame className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Kalorier</span>
        </div>
        
        <div className="relative flex items-center justify-center mb-2">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="url(#calorieGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${caloriesPercentage * 2.2} 220`}
            />
            <defs>
              <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(16 100% 60%)" />
                <stop offset="100%" stopColor="hsl(24 52% 51%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center">
            <span className="text-lg font-bold text-foreground">{caloriesEaten}</span>
          </div>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          {caloriesEaten} / {caloriesGoal} kcal
        </p>
      </div>

      {/* Water Card */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <Droplets className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Vand</span>
        </div>
        
        <div className="relative h-20 w-16 mx-auto mb-2 rounded-lg bg-muted overflow-hidden">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
            style={{ height: `${waterPercentage}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-blue-300/50 animate-pulse" />
          </div>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          {waterDrunk} / {waterGoal} ml
        </p>
      </div>

      {/* Weight Card */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Scale className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Vægt</span>
        </div>
        
        <div className="text-center">
          <span className="text-2xl font-bold text-foreground">{currentWeight}</span>
          <span className="text-sm text-muted-foreground ml-1">kg</span>
          
          <div className={cn(
            "flex items-center justify-center gap-1 mt-1 text-sm font-medium",
            weightDiff < 0 ? "text-success" : weightDiff > 0 ? "text-destructive" : "text-muted-foreground"
          )}>
            {weightDiff !== 0 && (
              <>
                <svg 
                  className={cn("h-3 w-3", weightDiff > 0 && "rotate-180")} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>{Math.abs(weightDiff).toFixed(1)} kg</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Next Meal Card */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Næste måltid</span>
        </div>
        
        {nextMeal ? (
          <div className="text-center">
            <p className="font-semibold text-foreground truncate">{nextMeal.name}</p>
            <p className="text-sm text-primary">{nextMeal.calories} kcal</p>
            <p className="text-xs text-muted-foreground">{nextMeal.time}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center">Ingen planlagt</p>
        )}
      </div>
    </div>
  );
}
