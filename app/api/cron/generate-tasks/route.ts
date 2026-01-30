import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TaskStatus } from "@/generated/prisma/enums";
import { toIndiaBucket, getIndiaWeekdayEnum } from "@/lib/date-utils";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  console.log("Cron: Daily Task Generation Started");

  try {
    const nowUtc = new Date();
    const taskDate = toIndiaBucket(nowUtc);
    const todayEnum = getIndiaWeekdayEnum(nowUtc);

    console.log(
      `Generating tasks for ${taskDate.toISOString()} (${todayEnum})`,
    );

    const activeSettings = await prisma.taskSetting.findMany({
      where: {
        startDate: { lte: taskDate },
        endDate: { gte: taskDate },
        repeatOn: { has: todayEnum },
      },
    });

    if (activeSettings.length === 0) {
      console.log("No eligible settings found.");
      return NextResponse.json({ success: true, count: 0 });
    }

    const tasksToCreate = activeSettings.map((setting) => ({
      userId: setting.userId,
      taskSettingId: setting.id,
      
      title: setting.title,
      description: setting.description,
      isPrivate: setting.isPrivate,

      date: taskDate,
      scheduledAt: setting.scheduledAt,
      duration: setting.duration,
      status: TaskStatus.PENDING,
    }));

    const result = await prisma.task.createMany({
      data: tasksToCreate,
      skipDuplicates: true,
    });

    console.log(`Generated ${result.count} tasks`);

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
