import { useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ChevronDown, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";

interface PastTaskGroupProps {
  date: string;
  tasks: Task[];
  children: React.ReactNode;
}

export function PastTaskGroup({ date, tasks, children }: PastTaskGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dateObj = new Date(date);

  // Calculate summary stats for the header
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalCount = tasks.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  // Helper for friendly date names
  const getDateLabel = () => {
    if (isToday(dateObj)) return "Today";
    if (isYesterday(dateObj)) return "Yesterday";
    return format(dateObj, "EEEE, MMMM do");
  };

  return (
    <div className="border rounded-xl bg-card overflow-hidden shadow-sm transition-all duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Date Icon & Label */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground text-sm">
                {getDateLabel()}
              </h3>
              <p className="text-xs text-muted-foreground">
                {format(dateObj, "yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Summary Stats (visible when collapsed or expanded) */}
          <div className="flex items-center gap-4 text-right">
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-foreground">
                {completedCount}/{totalCount} Done
              </span>
              <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Dropdown Chevron */}
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-200",
              isOpen && "transform rotate-180",
            )}
          />
        </div>
      </button>

      {/* Accordion Content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 pt-0 space-y-4 border-t border-border/40 bg-muted/5">
            {/* Add a little top padding for the list */}
            <div className="h-2" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
