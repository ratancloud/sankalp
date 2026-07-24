import { NextResponse } from "next/server";
import { ZodError } from "zod";

// --- Base response helpers ---

export function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * For write operations (POST/PATCH/DELETE) — no caching.
 */
export function jsonResponseMutation(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * For GET endpoints that can tolerate stale data.
 * @param maxAge      seconds the client/CDN serves from cache without revalidating
 * @param swr         seconds after maxAge where stale is served while fresh fetched in background
 */
export function jsonResponseCached(
  data: unknown,
  maxAge: number,
  swr = 0,
  status = 200,
) {
  const swrPart = swr > 0 ? `, stale-while-revalidate=${swr}` : "";
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": `private, max-age=${maxAge}${swrPart}`,
    },
  });
}

/**
 * For GET endpoints that must always be fresh (today's tasks, session data).
 */
export function jsonResponseNoCache(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}

// --- Error helpers ---

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleZodError(error: ZodError) {
  return errorResponse("Invalid fields", 400, error.flatten().fieldErrors);
}