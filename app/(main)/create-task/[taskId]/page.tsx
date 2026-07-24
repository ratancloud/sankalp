"use client";

import React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useRouter, useParams } from "next/navigation";
import TaskForm, { TaskSetting } from "@/components/createTask/TaskForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;

  const { data: task, error, isLoading } = useSWR<TaskSetting>(
    taskId ? `/api/taskSetting/${taskId}` : null,
    fetcher
  );

  const hasError = !!error;

  const handleBack = () => {
    router.push("/create-task");
  };

  const handleSuccess = () => {
    toast.success("Schedule updated successfully");
    router.push("/create-task");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading schedule...
        </p>
      </div>
    );
  }

  if (hasError || !task) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 pb-24 pt-8 md:py-8">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Schedule not found</h2>
        <p className="text-muted-foreground">
          The schedule you are trying to edit does not exist or has been deleted.
        </p>
        <Button onClick={handleBack} variant="outline">
          Go back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 pb-24 pt-8 md:py-8">
      <Button onClick={handleBack} variant="outline" size="sm">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      <div className="bg-background rounded-xl border space-y-6 p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">Edit Schedule</h1>
        <TaskForm onSuccess={handleSuccess} initialData={task} />
      </div>
    </div>
  );
}