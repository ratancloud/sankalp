"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  CheckCircle2,
  Play,
  SkipForward,
  Trash2,
  Loader2,
  Timer,
  Clock,
  CircleDashed,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Task } from "@/types/task";
import { format, parse } from "date-fns";
import { Label } from "@/components/ui/label";
import { TaskStatus } from "@/generated/prisma/enums";

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, newStatus: TaskStatus) => Promise<void>;
  onUpdateData: (id: string, data: { actualDuration: number }) => Promise<void>;
  onDelete: (id: string) => void;
}

export function TodayTaskCard({
  task,
  onStatusChange,
  onUpdateData,
  onDelete,
}: TaskCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [manualMinutes, setManualMinutes] = useState(
    Math.floor((task.actualDuration || 0) / 60).toString(),
  );

  const taskDate = new Date(task.date);
  const parsedTime = parse(task.scheduledAt, "HH:mm", taskDate);
  const formattedTime = format(parsedTime, "hh:mm a");

  // -- Status Mapping --
  const isCompleted = task.status === "COMPLETED";
  const isSkipped = task.status === "SKIPPED";
  const isInProgress = task.status === "IN_PROGRESS";

  // -- Time Logic --
  const plannedSeconds = task.duration || 0;
  const actualSeconds = task.actualDuration || 0;

  const progressPercent =
    plannedSeconds > 0
      ? Math.min(100, (actualSeconds / plannedSeconds) * 100)
      : 0;

  const isOvertime = actualSeconds > plannedSeconds;

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      await onUpdateData(task.id, {
        actualDuration: parseInt(manualMinutes) * 60,
      });

      await onStatusChange(task.id, "COMPLETED");

      setIsCompleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to complete task", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={() => !isLoading && router.push(`/focus/${task.id}`)}
        className={cn(
          "group relative flex w-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 cursor-pointer",
          "hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5",
          // Conditional Styles based on Status
          isCompleted && "bg-muted/30 opacity-75",
          isInProgress &&
            "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/8 shadow-md shadow-amber-500/5",
        )}
      >
        {/* Progress Strip (Top) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20">
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-out",
              isCompleted
                ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                : isOvertime
                  ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                  : "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.4)]",
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center p-4 gap-4 mt-1">
          {/* Section 1: Identity & Status */}
          <div className="flex flex-1 items-start gap-3 min-w-0">
            {/* Status Icon Box */}
            <div className="mt-0.5 shrink-0">
              {isCompleted ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-600 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ) : isInProgress ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30 animate-pulse">
                  <CircleDashed className="h-5 w-5" />
                </div>
              ) : isSkipped ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground border border-border/50">
                  <SkipForward className="h-5 w-5" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Play className="h-4 w-4 ml-0.5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex flex-col">
                <h3
                  className={cn(
                    "text-base font-semibold tracking-tight leading-tight truncate",
                    isCompleted &&
                      "line-through text-muted-foreground decoration-border",
                  )}
                >
                  {task.title}
                </h3>

                {/* Badges Row */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 text-[9px] font-bold uppercase tracking-wider px-1.5 rounded-md",
                      isCompleted &&
                        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20",
                      isSkipped && "bg-muted text-muted-foreground",
                      isInProgress &&
                        "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
                    )}
                  >
                    {task.status.replace("_", " ")}
                  </Badge>

                  <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/12 px-1.5 py-0.5 rounded-md">
                    <Clock className="h-3 w-3" />
                    {formattedTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Data Grid (Duration & Progress) */}
          <div className="flex items-center gap-6 md:border-l md:pl-6 border-border/50 pt-2 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0 justify-between md:justify-start">
            {/* Stat: Spent / Goal */}
            <div className="flex flex-col min-w-20">
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                Spent / Goal
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Timer
                  className={cn(
                    "h-3.5 w-3.5",
                    isOvertime ? "text-amber-600" : "text-primary",
                  )}
                />
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      isOvertime && "text-amber-600",
                    )}
                  >
                    {formatDuration(actualSeconds)}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground/50">
                    /
                  </span>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {formatDuration(plannedSeconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stat: Success % */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                Progress
              </span>
              <span
                className={cn(
                  "text-sm font-black mt-0.5",
                  isCompleted
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isOvertime
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-primary",
                )}
              >
                {Math.floor(progressPercent)}%
              </span>
            </div>

            {/* Dropdown Menu */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="ml-auto md:ml-0"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <MoreVertical className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem
                    onClick={() => setIsCompleteDialogOpen(true)}
                    className="rounded-lg py-2 cursor-pointer"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    Complete Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(task.id, "SKIPPED")}
                    className="rounded-lg py-2 text-muted-foreground cursor-pointer"
                  >
                    <SkipForward className="mr-2 h-4 w-4" />
                    Skip Task
                  </DropdownMenuItem>

                  {!task.taskSettingId && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(task.id)}
                        className="rounded-lg py-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Input Dialog */}
      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={(open) => {
          if (!isLoading) setIsCompleteDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-xs sm:max-w-sm rounded-3xl p-6 border-none shadow-2xl bg-card">
          <DialogHeader className="items-center text-center space-y-1.5">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-500" />
            </div>
            <DialogTitle className="text-xl font-black tracking-tight">
              Task Complete!
            </DialogTitle>
            <p className="text-sm text-muted-foreground font-medium px-4">
              Confirm the exact time you spent on this task.
            </p>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Label>Completion Time</Label>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              value={manualMinutes}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  setManualMinutes(value);
                }
              }}
              className="text-center text-xl w-20 h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0"
            />

            {/* Overtime Visualizer */}
            {parseInt(manualMinutes || "0") * 60 > plannedSeconds ? (
              <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full text-xs font-bold mt-2 animate-in fade-in slide-in-from-top-1">
                <AlertTriangle className="w-3 h-3" />
                Overtime by{" "}
                {formatDuration(
                  parseInt(manualMinutes || "0") * 60 - plannedSeconds,
                )}
              </div>
            ) : (
              <div className="h-6 mt-2" />
            )}
          </div>

          <DialogFooter>
            <Button
              className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 text-white transition-all active:scale-[0.98]"
              onClick={handleComplete}
              disabled={isLoading || !manualMinutes}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Confirm & Finish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
