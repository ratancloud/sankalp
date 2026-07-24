import { TaskStatus } from "@/generated/prisma/enums";
import {
  errorResponse,
  jsonResponseMutation,
  jsonResponseNoCache,
} from "@/lib/api-utils";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/require-user";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  duration: z.number().optional(),
  actualDuration: z.number().optional(),
  status: z.enum(TaskStatus).optional(),
});

// Shared column projection for task responses
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Auth + params + body — all independent, run in parallel
    const [user, { id }, body] = await Promise.all([
      requireUser(),
      context.params,
      request.json(),
    ]);

    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("Invalid data", 400);
    }

    const dataToUpdate = { ...validation.data };

    // Fetch the existing row only if we need business logic on durations
    // This is the ONE necessary query before update — but we merge ownership
    // check into it to avoid a second trip
    const existingTask = await prisma.task.findUnique({
      where: { id, userId: user.id },
      select: { actualDuration: true, duration: true },
    });

    if (!existingTask) {
      // Either not found or not owned by this user — return 403 either way
      return errorResponse("Not found or unauthorized", 403);
    }

    const finalActualDuration =
      dataToUpdate.actualDuration ?? existingTask.actualDuration;
    const finalPlannedDuration =
      dataToUpdate.duration ?? existingTask.duration;

    if (!("status" in dataToUpdate)) {
      if (finalActualDuration === 0) {
        dataToUpdate.status = "PENDING";
      } else if (finalActualDuration >= finalPlannedDuration) {
        dataToUpdate.status = "COMPLETED";
      }
    }

    if (dataToUpdate.status === "SKIPPED") {
      dataToUpdate.actualDuration = 0;
    }

    // Single update — ownership already verified above via findUnique where clause
    const updatedTask = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
      select: TASK_SELECT,
    });

    return jsonResponseMutation(updatedTask);
  } catch (error) {
    console.error("[TASK_PATCH]", error);
    return errorResponse("Internal Error", 500);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Parallelize auth + params resolution
    const [user, { id }] = await Promise.all([
      requireUser(),
      context.params,
    ]);

    // deleteMany with userId in where — single query, implicit ownership check
    const result = await prisma.task.deleteMany({
      where: { id, userId: user.id },
    });

    if (result.count === 0) {
      // Nothing deleted → either not found or not owned by user
      return errorResponse("Not found or unauthorized", 403);
    }

    return jsonResponseMutation({ success: true });
  } catch (error) {
    console.error("[TASK_DELETE]", error);
    return errorResponse("Internal Error", 500);
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Parallelize auth + params resolution
    const [user, { id }] = await Promise.all([
      requireUser(),
      context.params,
    ]);

    // Single query with ownership check embedded in where clause
    const task = await prisma.task.findUnique({
      where: { id, userId: user.id },
      select: TASK_SELECT,
    });

    if (!task) {
      return errorResponse("Not found or unauthorized", 403);
    }

    return jsonResponseNoCache(task);
  } catch (error) {
    console.error("[TASK_GET]", error);
    return errorResponse("Internal Error", 500);
  }
}
