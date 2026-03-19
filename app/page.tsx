export default function Home() {
  return (
    <main style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "600px" }}>
      <h1>AI Code Tools API</h1>
      <p>Available via <strong>RapidAPI</strong>.</p>
      <h2>Endpoints</h2>
      <ul>
        <li><code>POST /api/v1/readme</code> — Generate README from GitHub repo</li>
        <li><code>POST /api/v1/review</code> — AI code review</li>
        <li><code>POST /api/v1/test</code> — Generate unit tests</li>
      </ul>
    </main>
  );
}
