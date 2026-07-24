import { TaskStatus } from "@/generated/prisma/enums";
import { errorResponse, jsonResponse } from "@/lib/api-utils";
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser()
    const { id } = await context.params;
    const userId = user.id;

    const body = await request.json();

    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse("Invalid data");
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: id },
    });

    if (!existingTask || existingTask.userId !== userId) {
      return errorResponse("Unauthorized");
    }

    const dataToUpdate = { ...validation.data };
    const finalActualDuration =
      dataToUpdate.actualDuration ?? existingTask.actualDuration;
    const finalPlannedDuration = dataToUpdate.duration ?? existingTask.duration;

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

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: dataToUpdate,
    });

    return jsonResponse(updatedTask);
  } catch (error) {
    console.error("[TASK_PATCH]", error);
    return errorResponse("Internal Error")
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser()

    const { id } = await context.params;
    const userId = user.id;

    const existingTask = await prisma.task.findUnique({
      where: { id: id },
    });

    if (!existingTask || existingTask.userId !== userId) {
      return errorResponse("Unauthorized");
    }

    await prisma.task.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error("[TASK_DELETE]", error);
    return errorResponse("Internal Error")
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser()

    const { id } = await context.params;
    const userId = user.id;

    const existingTask = await prisma.task.findUnique({
      where: { id: id },
    });

    if (!existingTask || existingTask.userId !== userId) {
      return errorResponse("Unauthorized")
    }

    return jsonResponse(existingTask);
  } catch (error) {
    console.error("[TASK_GET]", error);
    return errorResponse("Internal Error")
  }
}
