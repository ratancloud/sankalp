import prisma from "@/lib/prisma";
import { z } from "zod";
import {
  jsonResponseCached,
  jsonResponseMutation,
  errorResponse,
  handleZodError,
} from "@/lib/api-utils";
import { toZonedTime } from "date-fns-tz";
import { WeekDay } from "@/generated/prisma/enums";
import {
  INDIA_TIMEZONE,
  JS_DAY_TO_PRISMA,
  toIndiaBucket,
} from "@/lib/date-utils";
import { requireUser } from "@/lib/require-user";

const createTaskSchema = z
  .object({
    title: z.string().min(2),
    description: z.string().optional(),
    isPrivate: z.boolean(),
    startDate: z.coerce.date().transform(toIndiaBucket),
    endDate: z.coerce.date().transform(toIndiaBucket),
    scheduledAt: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    duration: z.number().int().positive(),
    repeatOn: z.array(z.enum(WeekDay)).min(1),
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        path: ["endDate"],
        code: "custom",
        message: "Invalid Date Range",
      });
    }
  });

// Columns needed by the create-task UI and upcoming widget
const TASK_SETTING_SELECT = {
  id: true,
  title: true,
  description: true,
  isPrivate: true,
  scheduledAt: true,
  duration: true,
  repeatOn: true,
  startDate: true,
  endDate: true,
  userId: true,
} as const;

export async function POST(req: Request) {
  try {
    // Parallelize auth with body parsing — both are independent
    const [user, body] = await Promise.all([
      requireUser(),
      req.json(),
    ]);

    const validated = createTaskSchema.safeParse(body);
    if (!validated.success) {
      return handleZodError(validated.error);
    }

    const data = validated.data;

    const nowUtc = new Date();
    const todayDate = toIndiaBucket(nowUtc);
    const zonedNow = toZonedTime(nowUtc, INDIA_TIMEZONE);
    const todayEnum = JS_DAY_TO_PRISMA[zonedNow.getDay()];

    const result = await prisma.$transaction(async (tx) => {
      const setting = await tx.taskSetting.create({
        data: { userId: user.id, ...data },
        select: TASK_SETTING_SELECT,
      });

      const isActiveToday =
        todayDate >= setting.startDate && todayDate <= setting.endDate;
      const isRepeatDay = data.repeatOn.includes(todayEnum);

      if (isActiveToday && isRepeatDay) {
        await tx.task.create({
          data: {
            userId: user.id,
            taskSettingId: setting.id,
            title: data.title,
            description: data.description,
            isPrivate: data.isPrivate,
            date: todayDate,
            scheduledAt: data.scheduledAt,
            duration: data.duration,
            status: "PENDING",
          },
        });
      }

      return setting;
    });

    return jsonResponseMutation(result, 201);
  } catch (error) {
    console.error("POST Error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function GET() {
  try {
    const user = await requireUser();

    const settings = await prisma.taskSetting.findMany({
      where: { userId: user.id },
      orderBy: { scheduledAt: "asc" },
      select: TASK_SETTING_SELECT,
    });

    // Settings rarely change — safe for 30s stale-while-revalidate
    return jsonResponseCached(settings, 30, 60);
  } catch (error) {
    console.error("GET Error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

