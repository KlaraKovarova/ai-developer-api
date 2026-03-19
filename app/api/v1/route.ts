import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "AI Code Tools API",
    version: "1.0.0",
    endpoints: [
      {
        path: "/api/v1/readme",
        method: "POST",
        description: "Generate README.md for a GitHub repository",
      },
      {
        path: "/api/v1/review",
        method: "POST",
        description: "AI code review with structured feedback",
      },
      {
        path: "/api/v1/test",
        method: "POST",
        description: "Generate unit tests for any code",
      },
    ],
  });
}
