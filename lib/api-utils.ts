import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 500, details?: any) {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleZodError(error: ZodError) {
  return errorResponse("Invalid fields", 400, error.flatten().fieldErrors);
}