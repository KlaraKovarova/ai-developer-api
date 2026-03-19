import { NextRequest, NextResponse } from "next/server";
import { validateRapidAPI } from "@/lib/auth";
import { reviewCode } from "@/lib/claude";

export const maxDuration = 30;

/**
 * POST /api/v1/review
 *
 * Body: { "code": "<source code>", "language": "typescript" (optional) }
 *
 * Response: { "summary": "...", "critical": [...], "warnings": [...], "suggestions": [...], "recommendations": [...] }
 */
export async function POST(req: NextRequest) {
  const authError = validateRapidAPI(req);
  if (authError) return authError;

  try {
    const body = await req.json() as { code?: string; language?: string };
    const { code, language } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        {
          error: "code is required",
          example: { code: "function add(a, b) { return a + b; }", language: "javascript" },
        },
        { status: 400 }
      );
    }

    if (code.length > 50000) {
      return NextResponse.json(
        { error: "code exceeds 50,000 character limit" },
        { status: 400 }
      );
    }

    const apiKey = req.headers.get("X-Api-Key") ?? undefined;
    const review = await reviewCode(code, language, apiKey);
    return NextResponse.json(review);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Review failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/v1/review",
    description: "AI-powered code review with structured feedback",
    body: {
      code: "string (required) — source code to review (max 50,000 chars)",
      language: "string (optional) — programming language hint",
    },
    response: {
      summary: "string",
      critical: "string[] — critical bugs and security issues",
      warnings: "string[] — performance and logic issues",
      suggestions: "string[] — style and improvement suggestions",
      recommendations: "string[] — top actionable improvements",
    },
  });
}
