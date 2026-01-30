import { Task } from "@/types/task";
import { TaskDateGroup } from "./cards/TaskDateGroup";

function groupByDate(tasks: Task[]) {
  return tasks.reduce(
    (acc, task) => {
      const key = task.date.split("T")[0];
      acc[key] ||= [];
      acc[key].push(task);
      return acc;
    },
    {} as Record<string, Task[]>,
  );
}

export function PastTaskList({ tasks }: { tasks: Task[] }) {
  const grouped = groupByDate(tasks);

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([date, items]) => (
        <TaskDateGroup key={date} date={date} tasks={items} />
      ))}
    </div>
  );
}
