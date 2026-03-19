const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface TreeEntry {
  path: string;
  type: string;
  sha: string;
  url: string;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([^/]+)\/([^/\s.]+?)(?:\.git)?(?:\/.*)?$/,
    /^([^/]+)\/([^/]+)$/,
  ];
  for (const p of patterns) {
    const m = url.trim().match(p);
    if (m) return { owner: m[1], repo: m[2] };
  }
  return null;
}

const PRIORITY_FILES = [
  "package.json", "pyproject.toml", "Cargo.toml", "go.mod",
  "requirements.txt", "Makefile", "Dockerfile",
];

const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next",
  "coverage", "__pycache__", "vendor",
]);

const MAX_FILE_BYTES = 8000;
const MAX_FILES = 20;

export async function fetchRepoContext(repoUrl: string): Promise<string> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) throw new Error("Invalid GitHub URL");

  const { owner, repo } = parsed;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (GITHUB_TOKEN) headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;

  const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `GitHub API error ${metaRes.status}`);
  }
  const meta = await metaRes.json() as {
    description?: string;
    language?: string;
    topics?: string[];
    stargazers_count?: number;
    default_branch?: string;
  };

  const branch = meta.default_branch ?? "main";
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers }
  );
  if (!treeRes.ok) throw new Error("Could not fetch repo tree");
  const tree = await treeRes.json() as { tree: TreeEntry[] };

  const files = tree.tree.filter(
    (f) =>
      f.type === "blob" &&
      !SKIP_DIRS.has(f.path.split("/")[0]) &&
      /\.(ts|tsx|js|jsx|py|go|rs|java|md|json|yaml|yml|toml|txt)$/.test(f.path)
  );

  const prioritized = [
    ...files.filter((f) => PRIORITY_FILES.some((p) => f.path.endsWith(p))),
    ...files.filter((f) => !PRIORITY_FILES.some((p) => f.path.endsWith(p))),
  ].slice(0, MAX_FILES);

  const contents: string[] = [];
  for (const file of prioritized) {
    try {
      const r = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`,
        { headers }
      );
      if (!r.ok) continue;
      const data = await r.json() as { content?: string; encoding?: string };
      if (data.encoding === "base64" && data.content) {
        const decoded = Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
        contents.push(`### ${file.path}\n\`\`\`\n${decoded.slice(0, MAX_FILE_BYTES)}\n\`\`\``);
      }
    } catch {
      // skip
    }
  }

  return `# Repository: ${owner}/${repo}
Description: ${meta.description ?? "N/A"}
Language: ${meta.language ?? "N/A"}
Stars: ${meta.stargazers_count ?? 0}
Topics: ${(meta.topics ?? []).join(", ") || "N/A"}

## Files

${contents.join("\n\n")}`;
}
