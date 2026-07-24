"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  Pause,
  Play,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskStatus } from "@/generated/prisma/enums";
import FocusSkeleton from "@/components/skelton/FocusSkeleton";

interface TaskData {
  id: string;
  title: string;
  duration: number;
  actualDuration: number;
  status: TaskStatus;
}

export default function FocusPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // -- State --
  const [task, setTask] = useState<TaskData | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // -- Completion Dialog State --
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [manualMinutes, setManualMinutes] = useState("");

  // -- Refs --
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    let isMounted = true;
    const fetchTask = async () => {
      try {
        const resolvedParams = await Promise.resolve(params);
        const res = await fetch(`/api/tasks/${resolvedParams.id}`);

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/dashboard");
            return;
          }
          throw new Error("Failed to fetch");
        }

        const data: TaskData = await res.json();

        if (isMounted) {
          setTask(data);
          setSeconds(data.actualDuration || 0);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading task:", error);
      }
    };
    fetchTask();
    return () => {
      isMounted = false;
    };
  }, [params, router]);

  // -- Derived State --
  const totalPlannedSeconds = task?.duration || 1;
  const progressPercent = Math.min(100, (seconds / totalPlannedSeconds) * 100);
  const isOvertime = seconds > totalPlannedSeconds;

  // -- Database Sync --
  const syncWithDB = useCallback(
    async (currentSeconds: number, newStatus?: TaskStatus) => {
      if (!task) return;
      setIsSyncing(true);
      try {
        const payload = {
          actualDuration: currentSeconds,
          ...(newStatus && { status: newStatus }),
        };
        await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.error("Sync error:", e);
      } finally {
        setIsSyncing(false);
      }
    },
    [task],
  );

  // -- Timer Logic --
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - seconds * 1000;
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
  }, [seconds]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isLoading && isPlaying) startTimer();
    return () => stopTimer();
  }, [isLoading, isPlaying, startTimer, stopTimer]);

  useEffect(() => {
    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        isPlaying &&
        startTimeRef.current
      ) {
        setSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [isPlaying]);

  // -- Handlers --
  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopTimer();
      setIsPlaying(false);
      await syncWithDB(seconds, "IN_PROGRESS");
    } else {
      setIsPlaying(true);
    }
  };

  const handleReset = async () => {
    stopTimer();
    setIsPlaying(false);
    setSeconds(0);
    await syncWithDB(0, "IN_PROGRESS");
  };

  const handleExit = async () => {
    stopTimer();
    await syncWithDB(seconds);
    router.back();
  };

  const handleOpenCompleteDialog = () => {
    stopTimer();
    setIsPlaying(false);
    setManualMinutes(Math.floor(seconds / 60).toString());
    setIsCompleteDialogOpen(true);
  };

  const handleConfirmComplete = async () => {
    const finalSeconds = Math.max(0, parseInt(manualMinutes || "0") * 60);
    setSeconds(finalSeconds);
    await syncWithDB(finalSeconds, "COMPLETED");
    router.push("/dashboard");
  };

  const formatTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0)
      return `${hrs}:${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return <FocusSkeleton />;
  }

  return (
    <div className="relative mx-auto w-full max-w-7xl min-h-[calc(100vh-5rem)] space-y-6 px-4 sm:px-6 lg:px-8 pb-24 pt-8 md:py-8">
      {/* Ambient background for immersive focus mode */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className={cn(
          "absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full blur-[140px] transition-all duration-3000",
          isPlaying ? "bg-primary/10 scale-110" : "bg-primary/5 scale-90",
          isOvertime && "bg-destructive/10",
        )} />
      </div>
      {/* 1. Header Area */}
      <div className="space-y-5">
        <Button
          onClick={handleExit}
          disabled={isSyncing}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex flex-col items-center gap-1">
          <Badge
            variant={isOvertime ? "destructive" : "outline"}
            className={cn(
              "px-3 py-1 text-[10px] tracking-[0.2em] font-bold uppercase backdrop-blur-xl border-white/10 shadow-sm",
              !isOvertime && "bg-background/50 text-foreground",
            )}
          >
            {isOvertime ? "Overtime" : "Focus Mode"}
          </Badge>
          {isSyncing && (
            <span className="text-[9px] font-medium text-muted-foreground animate-pulse">
              Syncing...
            </span>
          )}
        </div>
      </div>

      {/* 2. Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 space-y-5">
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-75 w-75 rounded-full blur-[120px] transition-all duration-3000",
            isPlaying ? "bg-primary/20 scale-110" : "bg-transparent scale-90",
            isOvertime && "bg-destructive/20",
          )}
        />

        <div className="text-center space-y-5 relative z-10 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider opacity-60">
            <Target className="h-3.5 w-3.5" />
            <span>Target: {Math.floor(totalPlannedSeconds / 60)}m</span>
          </div>
          <h1 className="text-xl md:text-3xl font-bold leading-tight line-clamp-2 text-foreground/90">
            {task?.title}
          </h1>
        </div>

        <div className="relative z-10 select-none">
          <span
            className={cn(
              "font-mono text-[5rem] sm:text-9xl font-black tracking-tighter tabular-nums transition-colors duration-500 drop-shadow-2xl",
              isOvertime ? "text-destructive" : "text-foreground",
              !isPlaying && "opacity-40",
            )}
          >
            {formatTime(seconds)}
          </span>
        </div>

        <div className="w-full max-w-xs relative z-10 space-y-2">
          <div className="flex justify-between items-end px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Session Progress
            </span>
            <span
              className={cn(
                "text-xs font-black tabular-nums",
                isOvertime ? "text-destructive" : "text-primary",
              )}
            >
              {Math.floor(progressPercent)}%
            </span>
          </div>
          <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className={cn(
                "h-full transition-all duration-1000 ease-out shadow-[0_0_15px]",
                isOvertime
                  ? "bg-destructive shadow-destructive/50"
                  : "bg-primary shadow-primary/50",
              )}
              style={{ width: `${Math.min(100, progressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Controls Footer */}
      <div className="p-6 flex items-center justify-center gap-8 md:gap-12 z-20">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-14 w-14 rounded-full border-muted/50 bg-background/50 backdrop-blur-sm hover:bg-muted transition-all flex"
            >
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Timer?</AlertDialogTitle>
              <AlertDialogDescription>
                This sets the time back to 00:00.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-2xl h-12">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="rounded-2xl h-12 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          onClick={handleTogglePlay}
          disabled={isSyncing}
          className={cn(
            "h-24 w-24 rounded-[36px] shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-primary/30 flex items-center justify-center",
            isPlaying
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50"
              : "bg-primary text-primary-foreground",
          )}
        >
          {isSyncing ? (
            <Loader2 className="h-10 w-10 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-10 w-10 fill-current" />
          ) : (
            <Play className="h-10 w-10 fill-current ml-1.5" />
          )}
        </Button>

        <Button
          onClick={handleOpenCompleteDialog}
          disabled={isSyncing}
          size="icon"
          className="h-14 w-14 rounded-full bg-accent text-accent-foreground border border-accent-foreground/20 hover:bg-accent/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25 dark:hover:bg-emerald-500/25 transition-all active:scale-95"
        >
          <CheckCircle2 className="h-7 w-7" />
        </Button>
      </div>

      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent className="max-w-85 rounded-4xl p-6 border-none shadow-2xl bg-card">
          <DialogHeader className="items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-accent dark:bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-accent-foreground dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight">
                Session Complete
              </DialogTitle>
              <DialogDescription className="mt-2 text-xs font-medium uppercase tracking-wide opacity-60">
                Confirm your focus time
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex items-center justify-center gap-3 py-6">
            <Input
              type="number"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(e.target.value)}
              className="w-24 text-center text-4xl font-black h-16 rounded-2xl border-2 focus-visible:ring-primary focus-visible:border-primary bg-muted/30 tabular-nums"
              autoFocus
            />
            <Label className="text-sm font-black text-muted-foreground uppercase opacity-40 tracking-widest">
              MINS
            </Label>
          </div>

          <DialogFooter>
            <Button
              className="w-full h-14 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 transition-transform active:scale-98"
              onClick={handleConfirmComplete}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Save & Finish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}