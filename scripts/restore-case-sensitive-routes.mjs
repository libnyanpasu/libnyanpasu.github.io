import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const lowerCaseZh = "dist/zh-cn";
const legacyZh = "dist/zh-CN";

const distEntries = existsSync("dist") ? readdirSync("dist") : [];
const hasLowerCaseZh = distEntries.includes("zh-cn");
const hasLegacyZh = distEntries.includes("zh-CN");

if (hasLowerCaseZh && !hasLegacyZh) {
  try {
    cpSync(lowerCaseZh, legacyZh, { recursive: true });
  } catch (error) {
    if (error?.code !== "ERR_FS_CP_EINVAL") throw error;
  }
} else if (hasLowerCaseZh && hasLegacyZh) {
  rmSync(legacyZh, { force: true, recursive: true });
  cpSync(lowerCaseZh, legacyZh, { recursive: true });
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : fullPath;
  });
}

if (existsSync(legacyZh)) {
  for (const file of walk(legacyZh).filter((file) => file.endsWith(".html"))) {
    const html = readFileSync(file, "utf8")
      .replace('<html lang="en" dir="ltr"', '<html lang="zh-CN" dir="ltr"')
      .replace('property="og:locale" content="en"', 'property="og:locale" content="zh_CN"');
    writeFileSync(file, html);
  }
}
