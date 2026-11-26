import fs from "node:fs";
import path from "node:path";
import { PROJECT_ROOT } from "../config.js";

const packageInfo = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, "package.json"), "utf8"),
) as { version: string };

export const PACKAGE_VERSION = packageInfo.version;
