import { format, parse } from "date-fns";
import { Calendar, Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";

export function UpcomingTaskCard({ task }: { task: Task }) {
  const dateObj = new Date(task.date);
  const parsedTime = parse(task.scheduledAt, "HH:mm", new Date());
  const formattedTime = format(parsedTime, "hh:mm a");

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
    if (hours > 0) return `${hours} hr`;
    return `${minutes} min`;
  };

  return (
    <div className="group flex gap-4 w-full">
      {/* 1. Time Anchor (Left) */}
      <div className="flex flex-col items-end min-w-16 text-right pt-1.5 gap-1">
        <span className="text-sm font-bold font-mono tracking-tight text-foreground whitespace-nowrap">
          {formattedTime}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded whitespace-nowrap">
          {formatDuration(task.duration)}
        </span>
      </div>

      {/* 2. Timeline Connector (Middle) */}
      <div className="relative flex flex-col items-center">
        {/* The Node (Dot) */}
        <div className="w-3.5 h-3.5 rounded-full border-[3px] mt-2.5 z-10 bg-background transition-colors border-primary" />
        {/* The Line */}
        <div className="w-0.5 flex-1 bg-border/50 -my-2 group-last:bg-transparent" />
      </div>

      {/* 3. The Card Content (Right) */}
      <div
        className={cn(
          "flex-1 p-4 rounded-xl border transition-all duration-200",
          "bg-card shadow-sm hover:shadow-md hover:border-primary/20",
        )}
      >
        {/* Header: Title & Privacy */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="flex items-start gap-2 overflow-hidden">
            {/* Title */}
            <h4
              className={cn("text-base font-semibold leading-tight truncate")}
            >
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
                <span>Public</span>
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Footer: Context Info */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {/* Show Date */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <span>{format(dateObj, "EEE, do MMM yyyy")}</span>
          </div>

          {/* Scheduled Status */}
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="text-muted-foreground/80">Scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
