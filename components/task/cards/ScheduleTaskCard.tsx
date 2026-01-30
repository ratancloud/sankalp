import { format } from "date-fns";
import { 
  Calendar, 
  Lock, 
  Globe,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/task";

interface ScheduleTaskCardProps {
  task: Task;
  variant?: "past" | "upcoming";
}

export function ScheduleTaskCard({ task, variant = "upcoming" }: ScheduleTaskCardProps) {
  const isPastView = variant === "past";
  const isCompleted = task.status === "COMPLETED";
  const dateObj = new Date(task.date);

  // Helper for Status Badge in Past View
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge variant="outline" className="gap-1 border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          <CheckCircle2 className="w-3 h-3" />
          Done
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
        <AlertCircle className="w-3 h-3" />
        Missed
      </Badge>
    );
  };

  return (
    <div className="group flex gap-4 w-full">
      
      {/* 1. Time Anchor (Left) */}
      <div className="flex flex-col items-end min-w-8 text-right pt-1.5">
        <span className="text-sm font-bold font-mono tracking-tight text-foreground">
          {task.scheduledAt}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
          {task.duration}m
        </span>
      </div>

      {/* 2. Timeline Connector (Middle) */}
      <div className="relative flex flex-col items-center">
        {/* The Node (Dot) */}
        <div className={cn(
          "w-3.5 h-3.5 rounded-full border-[3px] mt-2.5 z-10 bg-background transition-colors",
          isPastView 
            ? (isCompleted ? "border-green-500" : "border-red-400")
            : "border-primary"
        )} />
        {/* The Line */}
        <div className="w-0.5 flex-1 bg-border/50 -my-2 group-last:bg-transparent" />
      </div>

      {/* 3. The Card Content (Right) */}
      <div className={cn(
        "flex-1 p-4 rounded-xl border transition-all duration-200",
        isPastView 
          ? "bg-muted/10 opacity-75 hover:opacity-100 border-border/60" 
          : "bg-card shadow-sm hover:shadow-md hover:border-primary/20"
      )}>
        
        {/* Header: Title & Privacy */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="flex items-start gap-2 overflow-hidden">
             {/* Title */}
            <h4 className={cn(
              "text-base font-semibold leading-tight truncate",
              isPastView && isCompleted && "text-muted-foreground line-through decoration-border"
            )}>
              {task.title}
            </h4>

            {/* Private/Public Visual Pill */}
            {task.isPrivate ? (
              <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 shrink-0 mt-0.5">
                <Lock className="w-2.5 h-2.5" />
                <span>Private</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 shrink-0 mt-0.5">
                <Globe className="w-2.5 h-2.5" />
                <span>Team</span>
              </span>
            )}
          </div>

          {/* Status Badge (Only for Past items) */}
          {isPastView && getStatusBadge()}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Footer: Context Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* Show Date if it's not today, or always show in upcoming list context */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <span>{format(dateObj, "EEE, MMM do")}</span>
          </div>

          {/* Optional: Show created/updated or extra context */}
           {!isPastView && (
             <div className="flex items-center gap-1.5">
               <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
               <span className="text-muted-foreground/80">Scheduled</span>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}