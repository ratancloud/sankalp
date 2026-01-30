"use client";

import React from "react";
import { useRouter } from "next/navigation";
import TaskForm from "@/components/createTask/TaskForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function CreateTaskPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSuccess = () => {
    toast.success("New schedule created successfully");
    router.push("/create-task");
    router.refresh();
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 pb-24 pt-8 md:py-8">
      <Button onClick={handleBack} variant="outline" size="sm">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      <div className="bg-background rounded-xl border space-y-6 p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">
          Create New Schedule
        </h1>
        <TaskForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}