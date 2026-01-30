"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, CalendarDays, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UpcomingTaskList } from "@/components/task/UpcomingTaskList";
import { PastTaskList } from "@/components/task/PastTaskList";
import { TodayTaskList } from "@/components/task/TodayTaskList";
import { Task } from "@/types/task";
import EmptyState from "@/components/task/EmptyState";
import { TaskStatus } from "@/generated/prisma/enums";

export default function TaskPage() {
  const [activeTab, setActiveTab] = useState("today");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchTasks() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tasks?view=${activeTab}`);

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        if (!ignore) {
          setTasks(data || []);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load tasks");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchTasks();

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  const completedCount =
    activeTab === "today"
      ? tasks.filter((t) => t.status === "COMPLETED").length
      : 0;

  const progressPercent =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    // 1. Optimistic Update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );

    // 2. API Call
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      // Optionally re-fetch or toast success
    } catch (e) {
      toast.error("Failed to update status");
      // Revert on error if needed
    }
  };

  const handleUpdateData = async (id: string, data: any) => {
    // 1. Optimistic Update (Crucial for timer smoothness)
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));

    // 2. API Call (Debounce this in production if calling frequently)
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      toast.success("Task deleted");
    } catch (e) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 pb-24 pt-8 md:py-8">
      {/* --- Header Section --- */}
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Good Morning, Ratan
          </h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {format(new Date(), "EEEE, MMMM do")}
          </p>
        </div>

        {activeTab === "today" && !loading && (
          <div className="hidden md:block">
            <Button className="shadow-sm hover:shadow-md transition-all">
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Button>
          </div>
        )}
      </header>

      {/* Mobile Progress Bar (Only show on Today tab) */}
      <div className="md:hidden">
        {activeTab === "today" && !loading && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border bg-background p-3 shadow-sm">
            <div className="relative h-10 w-10 shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted/20"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeDasharray={`${progressPercent}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
              </svg>
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold">
                {progressPercent}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Daily Goal</span>
              <span className="text-xs text-muted-foreground">
                {completedCount} / {tasks.length} completed
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- Main Content --- */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        {/* Sticky Tabs Header */}
        <div className="sticky top-20 z-30 rounded-full border bg-background/80 p-1 shadow-sm backdrop-blur-md md:static md:rounded-lg md:bg-muted/50 md:backdrop-blur-none">
          <TabsList className="grid w-full grid-cols-3 bg-transparent">
            {["previous", "today", "upcoming"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                disabled={loading}
                className="rounded-full capitalize data-[state=active]:bg-muted md:data-[state=active]:bg-background md:data-[state=active]:shadow-sm"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="min-h-75">
          {loading ? (
            <div className="flex h-40 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
            </div>
          ) : (
            <>
              {/* Tab: HISTORY */}
              <TabsContent
                value="previous"
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {tasks.length > 0 ? (
                  <PastTaskList tasks={tasks} />
                ) : (
                  <EmptyState type="previous" />
                )}
              </TabsContent>

              {/* Tab: TODAY */}
              <TabsContent value="today" className="...">
                {tasks.length > 0 ? (
                  <TodayTaskList
                    tasks={tasks}
                    onStatusChange={handleStatusChange}
                    onUpdateData={handleUpdateData}
                    onDelete={handleDelete}
                  />
                ) : (
                  <EmptyState type="today" />
                )}
              </TabsContent>

              {/* Tab: UPCOMING */}
              <TabsContent
                value="upcoming"
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {tasks.length > 0 ? (
                  <UpcomingTaskList tasks={tasks} />
                ) : (
                  <EmptyState type="upcoming" />
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      {/* Mobile FAB */}
      {activeTab === "today" && !loading && (
        <div className="fixed bottom-24 right-4 z-50 md:hidden">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">New Task</span>
          </Button>
        </div>
      )}
    </div>
  );
}
