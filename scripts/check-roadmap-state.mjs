import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const checkpointPath = fileURLToPath(
  new URL("../docs/internal/goals/roadmap-checkpoint.md", import.meta.url),
);
const source = readFileSync(checkpointPath, "utf8");

const requiredHeadings = [
  "## Current focus",
  "## Completed",
  "## Next",
  "## Deferred",
  "## Feedback loop",
  "## Formal approvals",
];

for (const heading of requiredHeadings) {
  if (!source.includes(heading)) {
    throw new Error(`Missing roadmap checkpoint heading: ${heading}`);
  }
}

if (!/\*\*Status: v0\.1\.2 public release complete; post-release maintenance\*\*/.test(source)) {
  throw new Error("Roadmap checkpoint status must track the completed v0.1.2 public release");
}

if (!/\*\*Updated: \d{4}-\d{2}-\d{2}\*\*/.test(source)) {
  throw new Error("Roadmap checkpoint must include an ISO updated date");
}

if (!source.includes("| Date | Feedback | Decision | Follow-up | Evidence |")) {
  throw new Error("Roadmap checkpoint feedback table is missing or has changed shape");
}

const feedbackRows = source
  .split("\n")
  .filter((line) => /^\| \d{4}-\d{2}-\d{2} \|/.test(line));

if (feedbackRows.length === 0) {
  throw new Error("Roadmap checkpoint must contain at least one dated feedback row");
}

console.log(`Roadmap checkpoint OK: ${feedbackRows.length} feedback row(s)`);
