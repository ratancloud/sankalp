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
  Calendar,
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
import { TaskStatus } from "@/generated/prisma/enums";
import { Task } from "@/types/task";

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
    Math.floor(task.actualDuration / 60).toString(),
  );

  // -- Status Mapping --
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isSkipped = task.status === TaskStatus.SKIPPED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;

  // -- Time Logic --
  const plannedSeconds = task.duration || 0;
  const actualSeconds = task.actualDuration || 0;
  const progressPercent =
    plannedSeconds > 0
      ? Math.min(100, (actualSeconds / plannedSeconds) * 100)
      : 0;
  const isOvertime = actualSeconds > plannedSeconds;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div
        onClick={() => !isLoading && router.push(`/focus/${task.id}`)}
        className={cn(
          "group relative flex w-full flex-col overflow-hidden rounded-[22px] border bg-card/40 backdrop-blur-md transition-all duration-300",
          "hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-[0.99]",
          isCompleted && "bg-muted/10 opacity-70",
          isInProgress &&
            "border-amber-500/30 bg-amber-500/5 shadow-lg shadow-amber-500/5",
        )}
      >
        {/* Progress Strip (Top) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted/10">
          <div
            className={cn(
              "h-full transition-all duration-1000 ease-out shadow-[0_0_10px]",
              isOvertime
                ? "bg-destructive shadow-destructive/40"
                : "bg-primary shadow-primary/40",
              isCompleted && "bg-green-500 shadow-green-500/40",
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center p-4 gap-4 mt-1">
          {/* Section 1: Identity & Status */}
          <div className="flex flex-1 items-start gap-3 min-w-0">
            <div className="mt-1">
              {isCompleted ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-600 border border-green-500/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : isInProgress ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
                  <CircleDashed className="h-6 w-6" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={cn(
                    "text-base font-heavy tracking-tight leading-tight truncate max-w-50",
                    isCompleted && "line-through text-muted-foreground",
                  )}
                >
                  {task.title}
                </h3>
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-5 text-[9px] font-black uppercase tracking-widest px-1.5",
                    isCompleted && "bg-green-500/10 text-green-600",
                    isSkipped && "bg-muted text-muted-foreground",
                    isInProgress &&
                      "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                  )}
                >
                  {task.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Today
                </span>
                {task.scheduledAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {task.scheduledAt}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Data Grid (Duration & Progress) */}
          <div className="flex items-center gap-6 md:border-l md:pl-6 border-muted/50">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                Spent / Goal
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Timer
                  className={cn(
                    "h-3.5 w-3.5",
                    isOvertime ? "text-destructive" : "text-primary",
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-black tabular-nums tracking-tight",
                    isOvertime && "text-destructive",
                  )}
                >
                  {formatTime(actualSeconds)}
                </span>
                <span className="text-[10px] font-bold opacity-30">/</span>
                <span className="text-sm font-bold opacity-60 tabular-nums">
                  {Math.floor(plannedSeconds / 60)}m
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                Success
              </span>
              <span
                className={cn(
                  "text-sm font-black mt-0.5",
                  isCompleted
                    ? "text-green-500"
                    : isOvertime
                      ? "text-destructive"
                      : "text-primary",
                )}
              >
                {Math.floor(progressPercent)}%
              </span>
            </div>

            {/* Dropdown Menu */}
            <div onClick={(e) => e.stopPropagation()} className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-secondary"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <MoreVertical className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 p-2 rounded-xl"
                >
                  <DropdownMenuItem
                    onClick={() => setIsCompleteDialogOpen(true)}
                    className="rounded-lg py-2"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />{" "}
                    Complete Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusChange(task.id, TaskStatus.SKIPPED)}
                    className="rounded-lg py-2 text-muted-foreground"
                  >
                    <SkipForward className="mr-2 h-4 w-4" /> Skip Task
                  </DropdownMenuItem>

                  {!task.taskSettingId && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(task.id)}
                        className="rounded-lg py-2 text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Task
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
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent className="max-w-90 rounded-4xl p-8 border-none shadow-2xl">
          <DialogHeader className="items-center">
            <DialogTitle className="text-2xl font-black">
              Final Duration
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Log your actual time spent for today&apos;s report.
            </p>
          </DialogHeader>
          <div className="flex items-center justify-center gap-4 py-6">
            <Input
              type="number"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(e.target.value)}
              className="w-24 text-center text-4xl font-black h-20 rounded-2xl border-2 focus-visible:ring-primary shadow-inner"
            />
            <span className="text-lg font-black text-muted-foreground uppercase opacity-40">
              Mins
            </span>
          </div>
          <DialogFooter>
            <Button
              className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
              onClick={async () => {
                setIsLoading(true);
                await onUpdateData(task.id, {
                  actualDuration: parseInt(manualMinutes) * 60,
                });
                await onStatusChange(task.id, TaskStatus.COMPLETED);
                setIsCompleteDialogOpen(false);
                setIsLoading(false);
              }}
            >
              Confirm & Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
