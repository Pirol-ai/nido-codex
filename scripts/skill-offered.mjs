// Is the skill actually put in front of the model?
//
// Installed is not offered. A skill can sit in the plugin, be listed as enabled, and never reach
// the model — that is exactly what happened to the same kind of skill in another agent, where one wrong key in
// the front matter hid it from every session while `skills list` kept saying `enabled`.
//
// Codex has no command that answers this, so this asks Codex itself: it stands a throwaway
// endpoint in front of it, runs one turn, and reads the request. No model answers, no account is
// used and no tokens are spent — the request is the evidence. What has to be in it is the skill's
// line in the <skills_instructions> block, because that list is all the model is given; it reads
// SKILL.md only if it decides to.
//
// It runs inside the CODEX_HOME check.sh has already set up, with the plugin installed.

import { spawn } from "node:child_process";
import { createServer } from "node:http";

const want = process.argv[2] ?? "nido:nido";

if (!process.env.CODEX_HOME) {
  console.error("CODEX_HOME is not set: run this through check.sh, not on your own Codex");
  process.exit(1);
}

const server = createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    res.writeHead(500, { "content-type": "application/json" });
    res.end('{"error":{"message":"this endpoint only listens"}}');
    done(body);
  });
});

let finished = false;
const done = (body) => {
  if (finished) return;
  finished = true;
  clearTimeout(give_up);
  codex.kill("SIGKILL");
  server.close();

  // The block sits inside a JSON string, so read it from the parsed request, not from the raw
  // text, or every newline is still a backslash and an n.
  const texts = [];
  const walk = (value) => {
    if (typeof value === "string") texts.push(value);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  try {
    walk(JSON.parse(body));
  } catch {
    console.error("Codex sent something that is not JSON");
    process.exit(1);
  }

  const block = texts.find((text) => text.includes("<skills_instructions>"));
  if (!block) {
    console.error("Codex sent no skills at all — the request has no <skills_instructions> block");
    process.exit(1);
  }
  const line = block.split("\n").find((l) => l.includes(want));
  if (!line) {
    console.error(`MISSING: "${want}" is not among the skills Codex offers the model`);
    console.error(block.split("\n").filter((l) => l.trim().startsWith("- ")).join("\n"));
    process.exit(1);
  }
  console.log(`   offered: ${line.trim().slice(0, 100)}…`);
  process.exit(0);
};

let codex;
const give_up = setTimeout(() => {
  console.error("Codex never asked the endpoint anything within 120s");
  codex?.kill("SIGKILL");
  process.exit(1);
}, 120_000);

server.listen(0, "127.0.0.1", () => {
  const { port } = server.address();
  const provider = `{name="capture",base_url="http://127.0.0.1:${port}/v1",wire_api="responses",env_key="CODEX_CAPTURE_KEY"}`;
  codex = spawn(
    "codex",
    [
      "exec",
      "--sandbox", "read-only",
      "--skip-git-repo-check",
      "-c", "model_provider=capture",
      "-c", `model_providers.capture=${provider}`,
      "Run python3 --version in a fresh sandbox.",
    ],
    { env: { ...process.env, CODEX_CAPTURE_KEY: "none" }, stdio: ["ignore", "ignore", "pipe"] },
  );
  let stderr = "";
  codex.stderr.on("data", (chunk) => (stderr += chunk));
  codex.on("exit", () => {
    if (finished) return;
    clearTimeout(give_up);
    server.close();
    console.error("Codex stopped before it asked the endpoint anything");
    if (stderr.trim()) console.error(stderr.trim().split("\n").slice(-5).join("\n"));
    process.exit(1);
  });
});
