import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { addDays } from "date-fns";
import { TaskStatus } from "@/generated/prisma/enums";
import {
  errorResponse,
  jsonResponse,
  jsonResponseCached,
  jsonResponseMutation,
  jsonResponseNoCache,
} from "@/lib/api-utils";
import { VirtualTask } from "@/types/task";
import {
  toIndiaBucket,
  JS_DAY_TO_PRISMA,
} from "@/lib/date-utils";
import z from "zod";
import { requireUser } from "@/lib/require-user";

const createTaskSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  isPrivate: z.boolean().default(false),
  date: z.coerce.date().transform(toIndiaBucket),
  scheduledAt: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  duration: z.number().int().positive(),
});

const DAYS_AHEAD = 14;

// Columns required by TodayTaskList / task board UI
const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  isPrivate: true,
  date: true,
  scheduledAt: true,
  duration: true,
  actualDuration: true,
  status: true,
  taskSettingId: true,
} as const;

export async function GET(req: NextRequest) {
  // Parallelize auth check with URL parsing — both are independent
  const [user, { searchParams }] = await Promise.all([
    requireUser(),
    Promise.resolve(new URL(req.url)),
  ]);

  const userId = user.id;
  const view = searchParams.get("view") || "today";

  const nowUtc = new Date();
  const todayDbDate = toIndiaBucket(nowUtc);

  try {
    // ── VIEW: TODAY ──────────────────────────────────────────────────────────
    // Always fresh — tasks change throughout the day
    if (view === "today") {
      const tasks = await prisma.task.findMany({
        where: { userId, date: todayDbDate },
        orderBy: { scheduledAt: "asc" },
        select: TASK_SELECT,
      });
      return jsonResponseNoCache(tasks);
    }

    // ── VIEW: PREVIOUS ───────────────────────────────────────────────────────
    // Historical — rarely changes; safe to serve stale for 30s
    if (view === "previous") {
      const history = await prisma.task.findMany({
        where: { userId, date: { lt: todayDbDate } },
        orderBy: [{ date: "desc" }, { scheduledAt: "asc" }],
        take: 50,
        select: TASK_SELECT,
      });
      return jsonResponseCached(history, 30, 60);
    }

    // ── VIEW: UPCOMING ───────────────────────────────────────────────────────
    // Pure computation from settings — cache for 60s, SWR for 5 min
    if (view === "upcoming") {
      const settings = await prisma.taskSetting.findMany({
        where: { userId, endDate: { gt: todayDbDate } },
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          isPrivate: true,
          scheduledAt: true,
          duration: true,
          repeatOn: true,
          startDate: true,
          endDate: true,
        },
      });

      const virtualTasks: VirtualTask[] = [];

      for (let i = 1; i <= DAYS_AHEAD; i++) {
        const futureDate = addDays(todayDbDate, i);
        const weekdayEnum = JS_DAY_TO_PRISMA[futureDate.getUTCDay()];

        for (const setting of settings) {
          if (!setting.repeatOn.includes(weekdayEnum)) continue;
          if (futureDate < setting.startDate) continue;
          if (futureDate > setting.endDate) continue;

          virtualTasks.push({
            id: `virtual-${setting.id}-${futureDate.toISOString()}`,
            taskSettingId: setting.id,
            title: setting.title,
            description: setting.description,
            isPrivate: setting.isPrivate,
            date: futureDate,
            scheduledAt: setting.scheduledAt,
            duration: setting.duration,
            actualDuration: 0,
            status: TaskStatus.PENDING,
            isVirtual: true,
          });
        }
      }

      return jsonResponseCached(virtualTasks, 60, 300);
    }

    return errorResponse("Invalid view", 400);
  } catch (error) {
    console.error("TASK GET ERROR:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function POST(req: Request) {
  try {
    // Parallelize auth with body parsing — independent async operations
    const [user, json] = await Promise.all([
      requireUser(),
      req.json(),
    ]);

    const body = createTaskSchema.parse(json);

    const task = await prisma.task.create({
      data: {
        userId: user.id,
        title: body.title,
        description: body.description,
        isPrivate: body.isPrivate,
        date: body.date,
        scheduledAt: body.scheduledAt,
        duration: body.duration,
        status: "PENDING",
        actualDuration: 0,
      },
      select: TASK_SELECT,
    });

    return jsonResponseMutation(task, 201);
  } catch (error) {
    console.error("[TASKS_POST]", error);
    if (error instanceof z.ZodError) {
      return errorResponse(JSON.stringify(error.issues), 400);
    }
    return errorResponse("Internal Server Error", 500);
  }
}
