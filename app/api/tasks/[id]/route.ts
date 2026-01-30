import { TaskStatus } from "@/generated/prisma/enums";
import { errorResponse } from "@/lib/api-utils";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
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
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    const userId = session.user.id;

    const body = await request.json();

    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse("Invalid data", { status: 400 });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: id },
    });

    if (!existingTask || existingTask.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: validation.data,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("[TASK_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    const userId = session.user.id;

    const existingTask = await prisma.task.findUnique({
      where: { id: id },
    });

    if (!existingTask || existingTask.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    await prisma.task.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error("[TASK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;
    const userId = session.user.id;

    const existingTask = await prisma.task.findUnique({
      where: { id: id },
    });

    if (!existingTask || existingTask.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    return NextResponse.json(existingTask);
  } catch (error) {
    console.error("[TASK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}