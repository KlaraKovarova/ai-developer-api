import { NextRequest, NextResponse } from "next/server";
import { validateRapidAPI } from "@/lib/auth";
import { generateTests } from "@/lib/claude";

export const maxDuration = 30;

/**
 * POST /api/v1/test
 *
 * Body: { "code": "<source code>", "language": "typescript" (optional) }
 *
 * Response: { "language": "typescript", "framework": "Jest", "tests": "<test file content>" }
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
    const result = await generateTests(code, language, apiKey);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Test generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/v1/test",
    description: "Generate complete unit tests for any code (auto-detects language)",
    body: {
      code: "string (required) — source code to test (max 50,000 chars)",
      language: "string (optional) — hint: javascript, typescript, python, go, rust, java",
    },
    response: {
      language: "string — detected language",
      framework: "string — test framework used",
      tests: "string — complete test file content",
    },
  });
}
