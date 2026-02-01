import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { addDays } from "date-fns";
import { TaskStatus } from "@/generated/prisma/enums";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
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

export async function GET(req: NextRequest) {
  const user = await requireUser()

  const userId = user.id;
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "today";

  const nowUtc = new Date();
  const todayDbDate = toIndiaBucket(nowUtc);

  try {
    if (view === "today") {
      const tasks = await prisma.task.findMany({
        where: {
          userId,
          date: todayDbDate,
        },
        orderBy: { scheduledAt: "asc" },
      });

      return jsonResponse(tasks, 200);
    }

    if (view === "previous") {
      const history = await prisma.task.findMany({
        where: {
          userId,
          date: { lt: todayDbDate },
        },
        orderBy: { scheduledAt: "asc" },
        take: 50,
      });

      return jsonResponse(history, 200);
    }

    if (view === "upcoming") {
      const settings = await prisma.taskSetting.findMany({
        where: {
          userId,
          endDate: { gt: todayDbDate },
        },
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

        // We can get the weekday from the UTC date directly now
        const weekdayEnum = JS_DAY_TO_PRISMA[futureDate.getUTCDay()];

        for (const setting of settings) {
          if (!setting.repeatOn.includes(weekdayEnum)) continue;

          // Simple comparison because everything is UTC Midnight
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

      return jsonResponse(virtualTasks, 200);
    }

    return errorResponse("Invalid view");
  } catch (error) {
    console.error("TASK GET ERROR:", error);
    return errorResponse("Internal Server Error");
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser()

    const json = await req.json();
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
    });

    return jsonResponse(task);
  } catch (error) {
    console.error("[TASKS_POST]", error);
    if (error instanceof z.ZodError) {
      return errorResponse(JSON.stringify(error.issues));
    }

    return errorResponse("Internal Server Error");
  }
}
