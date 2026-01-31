import { Task } from "@/types/task";
import { UpcomingTaskCard } from "./cards/UpcomingTaskCard";
import { UpcomingTaskGroup } from "./cards/UpcomingTaskGroup";

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

export function UpcomingTaskList({ tasks }: { tasks: Task[] }) {
  const grouped = groupByDate(tasks);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, tasks]) => (
        <UpcomingTaskGroup key={date} date={date} totalTask={tasks.length}>
          {tasks.map((task, idx) => (
            <UpcomingTaskCard key={idx} task={task} />
          ))}
        </UpcomingTaskGroup>
      ))}
    </div>
  );
}
