import { Task } from "@/types/task";
import { ScheduleTaskCard } from "./ScheduleTaskCard";
import { format } from "date-fns";

export function TaskDateGroup({
  date,
  tasks,
}: {
  date: string;
  tasks: Task[];
}) {
  return (
    <div className="space-y-3">
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {format(new Date(date), "dd MMM yyyy")}
        </h2>

        <span className="text-xs text-muted-foreground">
          {tasks.length} Tasks
        </span>
      </div>

      {/* Tasks */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <ScheduleTaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
