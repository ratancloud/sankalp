"use client";

import { Task } from "@/types/task";
import { TodayTaskCard } from "./cards/TodayTaskCard";
import { TaskStatus } from "@/generated/prisma/enums";
import { ClipboardList } from "lucide-react";

interface TodayTaskListProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onUpdateData: (id: string, data: { actualDuration: number }) => Promise<void>;
  onDelete: (id: string) => void;
}

export function TodayTaskList({ 
  tasks, 
  onStatusChange, 
  onUpdateData, 
  onDelete 
}: TodayTaskListProps) {

  // Sort tasks so that completed ones move to the bottom
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === TaskStatus.COMPLETED && b.status !== TaskStatus.COMPLETED) return 1;
    if (a.status !== TaskStatus.COMPLETED && b.status === TaskStatus.COMPLETED) return -1;
    return 0;
  });

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl bg-muted/5 opacity-60">
        <div className="bg-muted p-4 rounded-full mb-4">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-bold text-lg">Your list is empty</h3>
        <p className="text-sm text-muted-foreground max-w-50">
          Add a task above to start tracking your focus.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Today&apos;s Schedule
        </h2>
        <span className="text-xs font-medium text-muted-foreground">
          {tasks.filter(t => t.status === TaskStatus.COMPLETED).length} / {tasks.length} Completed
        </span>
      </div>

      <div className="space-y-3">
        {sortedTasks.map((task) => (
          <TodayTaskCard 
            key={task.id} 
            task={task} 
            onStatusChange={onStatusChange}
            onUpdateData={onUpdateData}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}