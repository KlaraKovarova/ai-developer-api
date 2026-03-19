import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5-20251001";

function client(apiKey?: string): Anthropic {
  const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not configured. Pass your key via X-Api-Key header (BYOK) or set it server-side.");
  return new Anthropic({ apiKey: key });
}

export async function generateReadme(repoContext: string, apiKey?: string): Promise<string> {
  const msg = await client(apiKey).messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: `You are an expert technical writer. Given information about a code repository, generate a professional, well-structured README.md.

The README must:
1. Start with a concise, compelling project title and one-line description
2. Include relevant badges as placeholders where appropriate
3. Contain these sections: Features, Prerequisites, Installation, Usage, Configuration, License
4. Use clear, professional English with realistic code examples
5. Output ONLY the raw markdown content, no preamble`,
    messages: [{ role: "user", content: repoContext }],
  });
  const block = msg.content[0];
  if (block.type !== "text") throw new Error("Unexpected response");
  return block.text;
}

export async function reviewCode(code: string, language?: string, apiKey?: string): Promise<{
  summary: string;
  critical: string[];
  warnings: string[];
  suggestions: string[];
  recommendations: string[];
}> {
  const msg = await client(apiKey).messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are a senior software engineer. Review the provided code and return a JSON object with this exact structure:
{
  "summary": "2-3 sentence overview of code quality",
  "critical": ["array of critical bugs and security issues"],
  "warnings": ["array of performance issues and logic errors"],
  "suggestions": ["array of style and improvement suggestions"],
  "recommendations": ["array of top 3-5 actionable improvements"]
}
Return ONLY valid JSON, no markdown fences.`,
    messages: [
      {
        role: "user",
        content: `Language: ${language ?? "auto-detect"}\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
      },
    ],
  });
  const block = msg.content[0];
  if (block.type !== "text") throw new Error("Unexpected response");
  return JSON.parse(block.text) as {
    summary: string;
    critical: string[];
    warnings: string[];
    suggestions: string[];
    recommendations: string[];
  };
}

export async function generateTests(code: string, language?: string, apiKey?: string): Promise<{
  language: string;
  framework: string;
  tests: string;
}> {
  const msg = await client(apiKey).messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: `You are a TDD expert. Analyze the code and return a JSON object:
{
  "language": "detected language",
  "framework": "test framework used",
  "tests": "complete test file content as a string"
}
For the tests field: include all imports, cover happy path + edge cases + error cases.
Return ONLY valid JSON. Escape newlines in the tests string with \\n.`,
    messages: [
      {
        role: "user",
        content: `Language hint: ${language ?? "auto-detect"}\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
      },
    ],
  });
  const block = msg.content[0];
  if (block.type !== "text") throw new Error("Unexpected response");
  return JSON.parse(block.text) as {
    language: string;
    framework: string;
    tests: string;
  };
}
