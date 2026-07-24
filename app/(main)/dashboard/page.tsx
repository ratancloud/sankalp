import Link from "next/link";
import { addDays, format } from "date-fns";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Gauge,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import prisma from "@/lib/prisma";
import { requirePageUser } from "@/lib/require-page-access";
import { toIndiaBucket, getIndiaWeekdayEnum } from "@/lib/date-utils";
import { TaskStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type UpcomingItem = {
  id: string;
  title: string;
  date: Date;
  scheduledAt: string;
  duration: number;
};

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min`;
}

function formatClock(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour.toString()}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

function buildUpcomingItems(
  settings: Array<{
    id: string;
    title: string;
    scheduledAt: string;
    duration: number;
    repeatOn: string[];
    startDate: Date;
    endDate: Date;
  }>,
) {
  const today = toIndiaBucket(new Date());
  const items: UpcomingItem[] = [];

  for (let offset = 1; offset <= 7; offset += 1) {
    const futureDate = addDays(today, offset);
    const weekday = getIndiaWeekdayEnum(futureDate);

    for (const setting of settings) {
      if (!setting.repeatOn.includes(weekday)) continue;
      if (futureDate < setting.startDate) continue;
      if (futureDate > setting.endDate) continue;

      items.push({
        id: `${setting.id}-${futureDate.toISOString()}`,
        title: setting.title,
        date: futureDate,
        scheduledAt: setting.scheduledAt,
        duration: setting.duration,
      });
    }
  }

  return items.sort((a, b) => {
    const dateDiff = a.date.getTime() - b.date.getTime();
    if (dateDiff !== 0) return dateDiff;
    return a.scheduledAt.localeCompare(b.scheduledAt);
  });
}

export default async function DashboardPage() {
  const user = await requirePageUser();
  const today = toIndiaBucket(new Date());

  const [todayTasks, totalCompleted, activeSchedules, scheduleRows] =
    await Promise.all([
      // Today's tasks — only columns needed for display + business logic
      prisma.task.findMany({
        where: { userId: user.id, date: today },
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          title: true,
          status: true,
          scheduledAt: true,
          duration: true,
        },
      }),
      // Count of all-time completed — single aggregation, no row fetch
      prisma.task.count({
        where: { userId: user.id, status: TaskStatus.COMPLETED },
      }),
      // Count of active schedules today
      prisma.taskSetting.count({
        where: {
          userId: user.id,
          startDate: { lte: today },
          endDate: { gte: today },
        },
      }),
      // Schedule rows for upcoming widget — projected to required fields only
      prisma.taskSetting.findMany({
        where: { userId: user.id, endDate: { gt: today } },
        select: {
          id: true,
          title: true,
          scheduledAt: true,
          duration: true,
          repeatOn: true,
          startDate: true,
          endDate: true,
        },
      }),
    ]);


  const completedToday = todayTasks.filter(
    (task) => task.status === TaskStatus.COMPLETED,
  ).length;
  const progressValue =
    todayTasks.length > 0
      ? Math.round((completedToday / todayTasks.length) * 100)
      : 0;
  // totalCompleted is now a direct DB count — no JS filter needed
  const pendingToday = todayTasks.filter(
    (task) => task.status === TaskStatus.PENDING,
  ).length;
  const upcomingItems = buildUpcomingItems(scheduleRows).slice(0, 5);
  const nextTask = todayTasks.find(
    (task) => task.status !== TaskStatus.COMPLETED,
  );
  const weekdayLabel = format(new Date(), "EEEE, MMMM do");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pb-24 pt-8 sm:px-6 lg:px-8 md:py-8">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-background via-background to-primary/5 p-6 shadow-sm md:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent-foreground/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-primary/8 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Badge variant="outline" className="w-fit gap-1 bg-background/70">
              <Sparkles className="h-3.5 w-3.5" />
              Your daily command center
            </Badge>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Good to see you, {user.name || "there"}.
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Here&apos;s a quick view of today&apos;s progress, active schedules,
                and what&apos;s coming next in your week.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5">
                <CalendarCheck2 className="h-4 w-4" />
                {weekdayLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5">
                <Target className="h-4 w-4" />
                {activeSchedules} active schedules
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5">
                <Users className="h-4 w-4" />
                {totalCompleted} completed tasks overall
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-5">
              <Link href="/create-task/new">
                <Plus className="mr-2 h-4 w-4" />
                New schedule
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="/task">
                Open task board
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/60 border-l-4 border-l-primary/50 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5">
          <CardHeader className="pb-3">
            <CardDescription>Today&apos;s tasks</CardDescription>
            <CardTitle className="text-3xl">{todayTasks.length}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              {pendingToday} still pending
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-l-4 border-l-emerald-500/50 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-500/5">
          <CardHeader className="pb-3">
            <CardDescription>Completion rate</CardDescription>
            <CardTitle className="text-3xl">{progressValue}%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Progress value={progressValue} />
            <p className="text-sm text-muted-foreground">
              {completedToday} of {todayTasks.length || 0} done today
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-l-4 border-l-violet-500/50 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-500/5">
          <CardHeader className="pb-3">
            <CardDescription>Active schedules</CardDescription>
            <CardTitle className="text-3xl">{activeSchedules}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gauge className="h-4 w-4" />
              Ready to generate upcoming tasks
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-l-4 border-l-amber-500/50 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-500/5">
          <CardHeader className="pb-3">
            <CardDescription>Next focus block</CardDescription>
            <CardTitle className="text-3xl">
              {nextTask ? formatClock(nextTask.scheduledAt) : "--:--"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              {nextTask ? nextTask.title : "No task scheduled for today"}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between gap-4 border-b pb-5">
            <div>
              <CardTitle>Today&apos;s plan</CardTitle>
              <CardDescription>
                Your live tasks for {format(today, "MMMM do, yyyy")}
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/task">View board</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {todayTasks.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 p-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No tasks for today</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create a schedule to start generating tasks for your day.
                </p>
                <Button asChild className="mt-5 rounded-full">
                  <Link href="/create-task/new">Create schedule</Link>
                </Button>
              </div>
            ) : (
              todayTasks.map((task) => {
                const completed = task.status === TaskStatus.COMPLETED;

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border bg-background/80 px-4 py-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{task.title}</p>
                        <Badge variant={completed ? "secondary" : "outline"}>
                          {task.status.toLowerCase().replaceAll("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatClock(task.scheduledAt)} · {formatDuration(task.duration)}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="shrink-0">
                      <Link href="/task">
                        Open
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader className="border-b pb-5">
              <CardTitle>Upcoming tasks</CardTitle>
              <CardDescription>
                Next seven days, synthesized from your active schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              {upcomingItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming scheduled tasks yet.
                </p>
              ) : (
                upcomingItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border bg-background/80 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(item.date, "EEE, MMM d")} · {formatClock(item.scheduledAt)}
                        </p>
                      </div>
                      <Badge variant="outline">{formatDuration(item.duration)}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-primary text-primary-foreground">
            <CardHeader className="border-b border-primary-foreground/10 pb-5">
              <CardTitle>Keep the flow going</CardTitle>
              <CardDescription className="text-primary-foreground/75">
                Jump back into focus mode or add another schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <Button asChild variant="secondary" className="w-full rounded-full">
                <Link href={nextTask ? `/focus/${nextTask.id}` : "/task"}>
                  {nextTask ? "Start next focus block" : "Open task board"}
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full rounded-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/create-task/new">Create new schedule</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}