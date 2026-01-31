import { format, parse } from "date-fns";
import {
  Lock,
  Globe,
  CheckCircle2,
  XCircle,
  SkipForward,
  AlertTriangle,
  Timer,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";

const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export function PastTaskCard({ task }: { task: Task }) {
  // --- Time Logic ---
  const taskDate = new Date(task.date);
  const parsedTime = parse(task.scheduledAt, "HH:mm", taskDate);
  const formattedTime = format(parsedTime, "hh:mm a");

  // --- Status Logic ---
  const isCompleted = task.status === "COMPLETED";
  const isSkipped = task.status === "SKIPPED";
  const isMissed = task.status === "PENDING" && task.actualDuration === 0;
  
  const safeDuration = task.duration || 1;
  const percentage = Math.round((task.actualDuration / safeDuration) * 100);
  const isPartial = !isCompleted && !isSkipped && !isMissed && task.actualDuration > 0;

  // --- Overtime Logic ---
  const timeDiff = task.actualDuration - task.duration;
  const isOvertime = timeDiff > 0;

  return (
    <div className={cn(
      "group flex flex-col sm:flex-row sm:items-center gap-3 py-3 px-4 border-b last:border-0 hover:bg-muted/40 transition-colors",
      // Subtle background tint for missed/overtime items to draw attention
      isMissed && "bg-red-50/40 dark:bg-red-900/10",
      isOvertime && "bg-orange-50/40 dark:bg-orange-900/10"
    )}>
      
      {/* 1. Time (Fixed Width on Desktop) */}
      <div className="flex items-center gap-2 sm:w-24 shrink-0">
        <span className="text-sm font-bold font-mono text-muted-foreground group-hover:text-foreground transition-colors">
          {formattedTime}
        </span>
        {/* Mobile Status Dot (Hidden on Desktop) */}
        <div className={cn("sm:hidden h-2 w-2 rounded-full", 
          isCompleted ? "bg-green-500" : 
          isMissed ? "bg-red-500" : 
          isSkipped ? "bg-gray-400" : "bg-amber-500"
        )} />
      </div>

      {/* 2. Main Content (Title & Badges) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
           {/* Status Icon (Desktop only) */}
           <div className="hidden sm:block shrink-0">
              {isCompleted ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" /> :
               isMissed ? <XCircle className="w-4 h-4 text-red-500" /> :
               isSkipped ? <SkipForward className="w-4 h-4 text-gray-400" /> :
               <PieChart className="w-4 h-4 text-amber-500" />}
           </div>

           <h4 className={cn(
             "text-sm font-medium truncate",
             (isCompleted || isSkipped) && "text-muted-foreground line-through decoration-border"
           )}>
             {task.title}
           </h4>
        </div>

        {/* Sub-row: Privacy & Percentage */}
        <div className="flex items-center gap-3 mt-1 sm:pl-6">
           <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {task.isPrivate ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
              <span>{task.isPrivate ? "Private" : "Public"}</span>
           </div>
           
           {/* Show percentage if partial or overtime */}
           {(isPartial || isOvertime) && (
             <span className={cn(
               "text-[10px] font-medium",
               isOvertime ? "text-orange-600" : "text-amber-600"
             )}>
               {percentage}% {isOvertime ? "Time" : "Done"}
             </span>
           )}
        </div>
      </div>

      {/* 3. Right Side: Duration Stats */}
      <div className="flex items-center justify-between sm:justify-end gap-4 min-w-35 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-border/50">
        
        {/* Actual Time */}
        <div className="flex items-center gap-1.5">
           <Timer className="w-3.5 h-3.5 text-muted-foreground" />
           <span className={cn(
             "text-xs font-mono font-medium",
             isOvertime ? "text-orange-600 dark:text-orange-500" : 
             isMissed ? "text-red-500" : "text-foreground"
           )}>
             {task.actualDuration > 0 ? formatDuration(task.actualDuration) : "--"}
           </span>
        </div>

        {/* Planned Time / Overtime Badge */}
        <div className="flex items-center gap-1.5">
           {isOvertime ? (
             <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
               <AlertTriangle className="w-3 h-3" />
               +{formatDuration(timeDiff)}
             </span>
           ) : (
             <span className="text-[10px] text-muted-foreground">
               / {formatDuration(task.duration)}
             </span>
           )}
        </div>
      </div>
    </div>
  );
}