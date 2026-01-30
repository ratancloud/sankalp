import { cn } from "@/lib/utils";
import { Loader2, Pause, Play } from "lucide-react";

interface TimerButtonProps {
  isPlaying: boolean;
  progressPercent: number;
  onClick: (e: React.MouseEvent) => void;
  isOvertime: boolean;
  isLoading: boolean;
}

export default function TimerButton({
  isPlaying,
  progressPercent,
  onClick,
  isOvertime,
  isLoading,
}: TimerButtonProps) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const visualPercent = isOvertime ? 100 : progressPercent;
  const strokeDashoffset =
    circumference - (visualPercent / 100) * circumference;

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="group relative flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
    >
      <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          className="text-muted/10"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          className={cn(
            "transition-all duration-500",
            isOvertime ? "stroke-red-500" : "stroke-amber-500",
          )}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div
        className={cn(
          "z-10",
          isPlaying ? "text-amber-600" : "text-muted-foreground",
        )}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : isPlaying ? (
          <Pause className="h-6 w-6 fill-current" />
        ) : (
          <Play className="h-6 w-6 fill-current ml-1" />
        )}
      </div>
    </button>
  );
}
