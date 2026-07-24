import prisma from "@/lib/prisma";
import { z } from "zod";
import {
  jsonResponse,
  jsonResponseMutation,
  jsonResponseNoCache,
  errorResponse,
  handleZodError,
} from "@/lib/api-utils";
import { WeekDay } from "@/generated/prisma/enums";
import { toIndiaBucket } from "@/lib/date-utils";
import { requireUser } from "@/lib/require-user";

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

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Parallelize auth + params resolution
    const [user, { id }] = await Promise.all([
      requireUser(),
      context.params,
    ]);

    // Single query — deleteMany with userId = implicit ownership check
    const result = await prisma.taskSetting.deleteMany({
      where: { id, userId: user.id },
    });

    if (result.count === 0) {
      return errorResponse("Not found or unauthorized", 403);
    }

    return jsonResponseMutation({ success: true });
  } catch (error) {
    console.error("DELETE Error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Parallelize auth + params + body parsing — all independent
    const [user, { id }, body] = await Promise.all([
      requireUser(),
      context.params,
      req.json(),
    ]);

    const validated = updateTaskSchema.safeParse(body);
    if (!validated.success) return handleZodError(validated.error);

    // Single query — updateMany with userId = implicit ownership check
    const result = await prisma.taskSetting.updateMany({
      where: { id, userId: user.id },
      data: validated.data,
    });

    if (result.count === 0) {
      return errorResponse("Not found or unauthorized", 403);
    }

    // Fetch updated row to return full data (1 extra query — necessary for response)
    const updated = await prisma.taskSetting.findUnique({ where: { id } });
    return jsonResponseMutation(updated);
  } catch (error) {
    console.error("PATCH Error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Parallelize auth + params resolution
    const [user, { id }] = await Promise.all([
      requireUser(),
      context.params,
    ]);

    // Single query with ownership check embedded in where clause
    const taskSetting = await prisma.taskSetting.findUnique({
      where: { id, userId: user.id },
    });

    if (!taskSetting) {
      return errorResponse("Not found or unauthorized", 403);
    }

    return jsonResponseNoCache(taskSetting);
  } catch (error) {
    console.error("GET Error:", error);
    return errorResponse("Internal Server Error", 500);
  }
}

