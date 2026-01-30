import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { addDays } from "date-fns";
import { TaskStatus } from "@/generated/prisma/enums";
import { jsonResponse } from "@/lib/api-utils";
import { VirtualTask } from "@/types/task";
import {
  toIndiaBucket,
  getIndiaWeekdayEnum,
  JS_DAY_TO_PRISMA,
} from "@/lib/date-utils";
import z from "zod";

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "today";

  const nowUtc = new Date();
  const todayDbDate = toIndiaBucket(nowUtc);
  const todayEnum = getIndiaWeekdayEnum(nowUtc);

  try {
    if (view === "today") {
      const [existingTasks, activeSettings] = await Promise.all([
        prisma.task.findMany({
          where: {
            userId,
            date: todayDbDate,
          },
          orderBy: { scheduledAt: "asc" },
        }),
        prisma.taskSetting.findMany({
          where: {
            userId,
            startDate: { lte: todayDbDate },
            endDate: { gte: todayDbDate },
            repeatOn: { has: todayEnum },
          },
        }),
      ]);

      const existingSettingIds = new Set(
        existingTasks
          .map((t) => t.taskSettingId)
          .filter((id): id is string => id !== null),
      );

      const tasksToCreate = [];

      for (const setting of activeSettings) {
        if (existingSettingIds.has(setting.id)) continue;

        tasksToCreate.push({
          userId,
          taskSettingId: setting.id,
          title: setting.title,
          description: setting.description,
          isPrivate: setting.isPrivate,
          date: todayDbDate,
          scheduledAt: setting.scheduledAt,
          duration: setting.duration,
          status: TaskStatus.PENDING,
        });
      }

      if (tasksToCreate.length === 0) {
        return jsonResponse(existingTasks, 200);
      }

      await prisma.task.createMany({
        data: tasksToCreate,
        skipDuplicates: true,
      });

      const finalTasks = await prisma.task.findMany({
        where: { userId, date: todayDbDate },
        orderBy: { scheduledAt: "asc" },
      });

      return jsonResponse(finalTasks, 200);
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
      });

      const virtualTasks: VirtualTask[] = [];

      for (let i = 1; i <= DAYS_AHEAD; i++) {
        // Calculate future bucket (e.g. Today + 1 day)
        // Since todayDbDate is already UTC Midnight, addDays maintains that.
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

    return new NextResponse("Invalid view", { status: 400 });
  } catch (error) {
    console.error("TASK GET ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = createTaskSchema.parse(json);

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
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

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASKS_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
