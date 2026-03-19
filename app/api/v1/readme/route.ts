import { NextRequest, NextResponse } from "next/server";
import { validateRapidAPI } from "@/lib/auth";
import { fetchRepoContext } from "@/lib/github";
import { generateReadme } from "@/lib/claude";

export const maxDuration = 60;

/**
 * POST /api/v1/readme
 *
 * Body: { "repoUrl": "https://github.com/owner/repo" }
 *
 * Response: { "readme": "<markdown content>", "repo": "owner/repo" }
 */
export async function POST(req: NextRequest) {
  const authError = validateRapidAPI(req);
  if (authError) return authError;

  try {
    const body = await req.json() as { repoUrl?: string };
    const { repoUrl } = body;

    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json(
        { error: "repoUrl is required", example: { repoUrl: "https://github.com/owner/repo" } },
        { status: 400 }
      );
    }

    const apiKey = req.headers.get("X-Api-Key") ?? undefined;
    const repoContext = await fetchRepoContext(repoUrl);
    const readme = await generateReadme(repoContext, apiKey);

    // Extract repo name for response
    const match = repoUrl.match(/github\.com\/([^/]+\/[^/\s.]+)/);
    const repo = match ? match[1] : repoUrl;

    return NextResponse.json({ readme, repo });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    const status = message.includes("Invalid GitHub") || message.includes("Not Found") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/** GET /api/v1/readme — returns endpoint info */
export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/v1/readme",
    description: "Generate a professional README.md for any public GitHub repository",
    body: { repoUrl: "string (required) — GitHub repository URL" },
    response: { readme: "string — Markdown content", repo: "string — owner/repo" },
  });
}
