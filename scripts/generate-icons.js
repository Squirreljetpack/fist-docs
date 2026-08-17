#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pyScript = resolve(__dirname, "generate-icons.py");

const result = spawnSync("python3", [pyScript], { stdio: "inherit" });
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
