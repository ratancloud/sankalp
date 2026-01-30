import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { headers } from "next/headers";
import { jsonResponse, errorResponse, handleZodError } from "@/lib/api-utils";
import { toZonedTime } from "date-fns-tz";
import { WeekDay } from "@/generated/prisma/enums";
import { INDIA_TIMEZONE, JS_DAY_TO_PRISMA, toIndiaBucket } from "@/lib/date-utils";


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

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const validated = createTaskSchema.safeParse(body);

    if (!validated.success) {
      return handleZodError(validated.error);
    }

    const data = validated.data;

    // 1. Get "Today" in India (UTC Midnight Bucket)
    const nowUtc = new Date();
    const todayDate = toIndiaBucket(nowUtc);
    
    // 2. Get "Today's Weekday" in India
    const zonedNow = toZonedTime(nowUtc, INDIA_TIMEZONE);
    const todayEnum = JS_DAY_TO_PRISMA[zonedNow.getDay()];

    const result = await prisma.$transaction(async (tx) => {
      const setting = await tx.taskSetting.create({
        data: {
          userId: session.user.id,
          ...data,
        },
      });
      
      const isActiveToday = 
        todayDate >= setting.startDate && 
        todayDate <= setting.endDate;

      const isRepeatDay = data.repeatOn.includes(todayEnum);

      if (isActiveToday && isRepeatDay) {
        await tx.task.create({
          data: {
            userId: session.user.id,
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

    return jsonResponse(result, 201);
  } catch (error) {
    console.error("POST Error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}