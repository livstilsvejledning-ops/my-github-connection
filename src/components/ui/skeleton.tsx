import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

// Skeleton for stat cards
function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card shadow-card overflow-hidden">
      <div className="h-1 gradient-primary" />
      <div className="p-6 pt-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for customer cards
function CustomerCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card shadow-card p-5 border-t-4 border-primary/30">
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton for table rows
function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}

// Skeleton for meal plan grid
function MealPlanGridSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 7 }).map((_, dayIndex) => (
        <div key={dayIndex} className="space-y-2">
          <Skeleton className="h-12 rounded-xl" />
          {Array.from({ length: 4 }).map((_, mealIndex) => (
            <Skeleton key={mealIndex} className="h-24 rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton for message thread
function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("space-y-2", isOwn ? "items-end" : "items-start")}>
        <Skeleton className={cn(
          "h-16 rounded-2xl",
          isOwn ? "w-48 rounded-br-md" : "w-56 rounded-bl-md"
        )} />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

// Full page loading skeleton
function PageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-card shadow-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        </div>
        <div className="rounded-2xl bg-card shadow-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  StatCardSkeleton, 
  CustomerCardSkeleton, 
  TableRowSkeleton,
  MealPlanGridSkeleton,
  MessageSkeleton,
  PageSkeleton 
};
