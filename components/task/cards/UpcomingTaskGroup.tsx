import { format } from "date-fns";
import { ReactNode } from "react";

export function UpcomingTaskGroup({
  date,
  totalTask,
  children
}: {
  date: string;
  totalTask: number;
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {format(new Date(date), "dd MMM yyyy")}
        </h2>

        <span className="text-xs text-muted-foreground">
          {totalTask} Tasks
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
