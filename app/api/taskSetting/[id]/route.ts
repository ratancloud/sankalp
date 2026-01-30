import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { headers } from "next/headers";
import { jsonResponse, errorResponse, handleZodError } from "@/lib/api-utils";
import { WeekDay } from "@/generated/prisma/enums";
import { toIndiaBucket } from "@/lib/date-utils";

const updateTaskSchema = z
  .object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    isPrivate: z.boolean().optional(),
    startDate: z.coerce.date().transform(toIndiaBucket).optional(),
    endDate: z.coerce.date().transform(toIndiaBucket).optional(),
    scheduledAt: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format")
      .optional(),
    duration: z.number().int().positive().optional(),
    repeatOn: z.array(z.enum(WeekDay)).min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      if (data.endDate < data.startDate) {
        ctx.addIssue({
          code: "custom",
          message: "End date cannot be before start date",
          path: ["endDate"],
        });
      }
    }
  });

async function verifyOwner(id: string, userId: string) {
  const setting = await prisma.taskSetting.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!setting) return "NOT_FOUND";
  if (setting.userId !== userId) return "FORBIDDEN";
  return "OK";
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;

    const check = await verifyOwner(id, session.user.id);
    if (check === "NOT_FOUND") return errorResponse("Not found", 404);
    if (check === "FORBIDDEN") return errorResponse("Forbidden", 403);
    await prisma.taskSetting.delete({ where: { id: id } });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("DELETE Error:", error);
    return errorResponse("Internal Server Error");
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;

    const body = await req.json();
    const validated = updateTaskSchema.safeParse(body);

    if (!validated.success) return handleZodError(validated.error);

    const check = await verifyOwner(id, session.user.id);
    if (check === "NOT_FOUND") return errorResponse("Not found", 404);
    if (check === "FORBIDDEN") return errorResponse("Forbidden", 403);

    const updated = await prisma.taskSetting.update({
      where: { id: id },
      data: validated.data,
    });

    return jsonResponse(updated);
  } catch (error) {
    console.error("PATCH Error:", error);
    return errorResponse("Internal Server Error");
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return errorResponse("Unauthorized", 401);

    const { id } = await context.params;

    const check = await verifyOwner(id, session.user.id);
    if (check === "NOT_FOUND") return errorResponse("Not found", 404);
    if (check === "FORBIDDEN") return errorResponse("Forbidden", 403);

    const taskSetting = await prisma.taskSetting.findUnique({
      where: { id: id },
    });

    return jsonResponse(taskSetting);
  } catch (error) {
    console.error("GET Error:", error);
    return errorResponse("Internal Server Error");
  }
}
