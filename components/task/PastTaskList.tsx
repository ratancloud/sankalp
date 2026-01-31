import { Task } from "@/types/task";
import { PastTaskCard } from "./cards/PastTaskCard";
import { PastTaskGroup } from "./cards/PastTaskGroup";

function groupByDate(tasks: Task[]) {
  const grouped = tasks.reduce(
    (acc, task) => {
      const d = new Date(task.date);
      const key = d.toISOString().split("T")[0];

      acc[key] ||= [];
      acc[key].push(task);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  return Object.entries(grouped).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
  );
}

export function PastTaskList({ tasks }: { tasks: Task[] }) {
  const sortedGroups = groupByDate(tasks);

  return (
    <div className="space-y-4">
      {sortedGroups.map(([date, groupTasks]) => (
        <PastTaskGroup key={date} date={date} tasks={groupTasks}>
          {groupTasks.map((task) => (
            <PastTaskCard key={task.id} task={task} />
          ))}
        </PastTaskGroup>
      ))}
    </div>
  );
}
