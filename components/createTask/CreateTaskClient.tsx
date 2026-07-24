"use client";

import React, { useState, useTransition } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, Loader2 } from "lucide-react";
import TaskSettingCard from "./TaskSettingCard";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TaskSetting } from "@/generated/prisma/client";
import TaskSettingCardSkeleton from "../skelton/TaskSettingCardSkeleton";

const TasksPageClient = () => {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { data: tasks = [], isLoading, mutate } = useSWR<TaskSetting[]>("/api/taskSetting", fetcher);

  const handleCreate = () => {
    router.push("/create-task/new");
  };

  const handleEdit = (task: TaskSetting) => {
    router.push(`/create-task/${task.id}`);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    startTransition(async () => {
      try {
        // Optimistic delete
        mutate(
          tasks.filter((t) => t.id !== deleteId),
          false
        );

        const response = await fetch(`/api/taskSetting/${deleteId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          mutate(); // Rollback
          throw new Error("Failed to delete");
        }

        mutate(); // Sync
        toast.success("Schedule deleted successfully");
      } catch (error) {
        toast.error("Failed to delete schedule");
      } finally {
        setDeleteId(null);
      }
    });
  };

  return (
    <div className="relative mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 pb-24 pt-8 md:py-8">
      {/* --- Header Section --- */}
      <div className="hidden md:flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Schedule Task</h1>
        <Button
          onClick={handleCreate}
          className="shadow-sm font-medium transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Schedule
        </Button>
      </div>

      {/* --- Content Logic --- */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => (
            <TaskSettingCardSkeleton key={id} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl bg-muted/5 animate-in fade-in zoom-in duration-500">
          <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
            <ListTodo className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold">No tasks scheduled yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs text-center mt-1 mb-6">
            Get started by creating a new schedule for your daily or weekly
            routines.
          </p>
          <Button variant="outline" onClick={handleCreate}>
            Create your first task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {tasks.map((task) => (
            <TaskSettingCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* --- Mobile Floating Action Button --- */}
      <Button
        onClick={handleCreate}
        size="icon"
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-50 md:hidden transition-transform hover:scale-110 active:scale-90"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Create schedule</span>
      </Button>

      {/* --- Delete Confirmation Dialog --- */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              schedule and stop generating future tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Schedule"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TasksPageClient;
