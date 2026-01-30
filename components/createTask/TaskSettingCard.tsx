import { useMemo } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Lock,
  Users,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskSetting, WeekDay } from "@/generated/prisma/client";

interface TaskSettingCardProps {
  task: TaskSetting;
  onEdit: (task: TaskSetting) => void;
  onDelete: (id: string) => void;
}

const DAYS_MAP: { full: WeekDay; short: string }[] = [
  { full: "Monday", short: "M" },
  { full: "Tuesday", short: "T" },
  { full: "Wednesday", short: "W" },
  { full: "Thursday", short: "T" },
  { full: "Friday", short: "F" },
  { full: "Saturday", short: "S" },
  { full: "Sunday", short: "S" },
];

const formatDuration = (minutes: number | null) => {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export default function TaskSettingCard({ task, onEdit, onDelete }: TaskSettingCardProps) {
  const timeObj = useMemo(() => {
    const d = new Date();
    const [hours, minutes] = task.scheduledAt.split(':').map(Number);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }, [task.scheduledAt]);

  const startDateObj = useMemo(() => new Date(task.startDate), [task.startDate]);
  const endDateObj = useMemo(() => new Date(task.endDate), [task.endDate]);

  const theme = useMemo(() => {
    const now = startOfDay(new Date());
    const start = startOfDay(startDateObj);
    const end = startOfDay(endDateObj);

    if (isBefore(end, now)) {
      return {
        state: "ended",
        border: "border-zinc-200 dark:border-zinc-800",
        sideBg: "bg-zinc-100 dark:bg-zinc-900",
        timeText: "text-zinc-500",
        pill: "bg-zinc-200 text-zinc-500",
        dayActive: "bg-zinc-400 text-white",
        dateText: "text-zinc-400",
      };
    }

    if (isBefore(now, start)) {
      return {
        state: "scheduled",
        border: "border-indigo-100 dark:border-indigo-900/50",
        sideBg: "bg-indigo-50/50 dark:bg-indigo-950/20",
        timeText: "text-indigo-600 dark:text-indigo-400",
        pill: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
        dayActive: "bg-indigo-500 text-white shadow-sm",
        dateText: "text-indigo-600/70 dark:text-indigo-400/70",
      };
    }

    return {
      state: "active",
      border: "border-emerald-100 dark:border-emerald-900/50",
      sideBg: "bg-emerald-50/50 dark:bg-emerald-950/20",
      timeText: "text-emerald-600 dark:text-emerald-400",
      pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
      dayActive: "bg-emerald-500 text-white shadow-sm",
      dateText: "text-emerald-600/70 dark:text-emerald-400/70",
    };
  }, [startDateObj, endDateObj]);

  return (
    <div
      className={cn(
        "group flex w-full min-h-36 overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        theme.border
      )}
    >
      <div
        className={cn(
          "flex w-24 shrink-0 flex-col items-center justify-between border-r border-border/40 py-3 px-2 text-center",
          theme.sideBg
        )}
      >
        {/* Top: Time */}
        <div className="flex flex-col items-center gap-2">
          <div className={cn("flex flex-col", theme.timeText)}>
            <span className="text-2xl font-black tracking-tighter leading-none">
              {format(timeObj, "h:mm")}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest opacity-70">
              {format(timeObj, "a")}
            </span>
          </div>

          {/* Duration Pill */}
          {task.duration && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                theme.pill
              )}
            >
              <Timer className="size-3" />
              <span>{formatDuration(task.duration)}</span>
            </div>
          )}
        </div>

        {/* Bottom: Date Range */}
        <div
          className={cn(
            "mt-3 flex flex-col items-center w-full pt-2 border-t border-black/5 dark:border-white/5",
            theme.dateText
          )}
        >
          <span className="text-[10px] font-bold leading-tight">
            {format(startDateObj, "MMM d")}
          </span>
          <span className="text-[9px] opacity-60 font-medium scale-y-75 transform block">
            to
          </span>
          <span className="text-[10px] font-bold leading-tight">
            {format(endDateObj, "MMM d")}
          </span>
        </div>
      </div>

      {/* -----------------------------------------------------------
          RIGHT COLUMN: MAIN CONTENT
          ----------------------------------------------------------- */}
      <div className="flex flex-1 flex-col p-4 relative space-y-2">
        {/* TOP ROW: Title & Menu */}
        <div className="flex items-start justify-between gap-3">
          <h3
            className="line-clamp-2 text-base font-bold leading-tight text-foreground/90"
            title={task.title}
          >
            {task.title}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mr-2 text-muted-foreground/40 hover:text-foreground shrink-0"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 size-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-red-500"
              >
                <Trash2 className="mr-2 size-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* MIDDLE: Description */}
        <ScrollArea className="h-14 pr-4">
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {task.description || "No description provided."}
          </p>
        </ScrollArea>

        {/* BOTTOM ROW: Privacy & Days */}
        <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between pt-2">
          {/* 1. Privacy Tag */}
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 self-start rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors cursor-help",
                    task.isPrivate
                      ? "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/30 dark:border-orange-900/50"
                      : "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50"
                  )}
                >
                  {task.isPrivate ? (
                    <Lock className="size-3" />
                  ) : (
                    <Users className="size-3" />
                  )}
                  <span>{task.isPrivate ? "Private" : "Friends"}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {task.isPrivate ? "Only you" : "Visible to friends"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 2. Days of Week Visualizer */}
          <div className="flex items-center gap-1">
            {DAYS_MAP.map((day) => {
              const isActive = task.repeatOn.includes(day.full);
              return (
                <div
                  key={day.full}
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold transition-all select-none cursor-default",
                    isActive
                      ? theme.dayActive
                      : "bg-secondary/40 text-muted-foreground/30"
                  )}
                  title={day.full}
                >
                  {day.short}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}