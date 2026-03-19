import { NextRequest, NextResponse } from "next/server";

const PROXY_SECRET = process.env.RAPIDAPI_PROXY_SECRET;

/**
 * Validates the RapidAPI proxy secret header.
 * When set, ensures requests come through RapidAPI's proxy (not direct).
 * Returns null if valid, or a 403 NextResponse if invalid.
 */
export function validateRapidAPI(req: NextRequest): NextResponse | null {
  if (!PROXY_SECRET) return null; // Not configured, allow all
  const secret = req.headers.get("X-RapidAPI-Proxy-Secret");
  if (secret !== PROXY_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized. Use this API via RapidAPI." },
      { status: 403 }
    );
  }
  return null;
}

/** Extract RapidAPI user from header (for logging/analytics) */
export function getRapidAPIUser(req: NextRequest): string {
  return req.headers.get("X-RapidAPI-User") ?? "anonymous";
}
