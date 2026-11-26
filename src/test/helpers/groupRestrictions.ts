import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach } from "node:test";
import { DATABASE_DIR } from "../../config.js";

export const groupRestrictionsPath = path.join(
  DATABASE_DIR,
  "group-restrictions.json",
);

export function backupGroupRestrictions() {
  if (!fs.existsSync(groupRestrictionsPath)) {
    return null;
  }

  return fs.readFileSync(groupRestrictionsPath);
}

export function restoreGroupRestrictions(backup) {
  if (backup === null) {
    if (fs.existsSync(groupRestrictionsPath)) {
      fs.unlinkSync(groupRestrictionsPath);
    }
    return;
  }

  fs.writeFileSync(groupRestrictionsPath, backup);
}

export function useGroupRestrictionsCleanup(setup) {
  let backup;

  beforeEach(() => {
    backup = backupGroupRestrictions();
    setup?.();
  });

  afterEach(() => {
    restoreGroupRestrictions(backup);
  });
}
