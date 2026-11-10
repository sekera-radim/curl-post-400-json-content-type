#!/usr/bin/env node
// Extract every ```bash fenced block from README.md and run it for real
// against the running server, so a doc example that reads a field the API
// no longer returns fails right here, instead of just looking fine in prose.
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const readme = readFileSync(join(here, "..", "app", "README.md"), "utf8");
const blocks = [...readme.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]);

if (blocks.length === 0) {
  console.error("no bash blocks found in README.md");
  process.exit(1);
}

blocks.forEach((block, i) => {
  const n = i + 1;
  try {
    execSync(block, { shell: "/bin/bash", stdio: ["ignore", "pipe", "pipe"] });
    console.log(`ok ${n} - README example ${n} ran against the live server`);
  } catch (err) {
    console.error(`not ok ${n} - ${(err.stderr || err.message).toString().trim()}`);
    process.exit(1);
  }
});
console.log("ALL PASSED");
