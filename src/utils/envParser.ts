export interface ParsedEnvEntry {
  key: string;
  value: string;
  comment?: string;
}

export function parseEnvContent(rawText: string): ParsedEnvEntry[] {
  const lines = rawText.split(/\r?\n/);
  const entries: ParsedEnvEntry[] = [];
  let pendingComment = "";

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith("#")) {
      pendingComment = line.replace(/^#\s*/, "");
      continue;
    }

    // Strip leading 'export '
    if (line.startsWith("export ")) {
      line = line.replace(/^export\s+/, "");
    }

    const equalIdx = line.indexOf("=");
    if (equalIdx <= 0) continue;

    const key = line.substring(0, equalIdx).trim();
    let val = line.substring(equalIdx + 1).trim();

    // Check inline comments e.g. KEY=VAL # comment
    let inlineComment = "";
    if (val.includes(" #")) {
      const parts = val.split(" #");
      val = parts[0].trim();
      inlineComment = parts.slice(1).join(" #").trim();
    }

    // Strip wrapping quotes
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }

    if (key) {
      entries.push({
        key,
        value: val,
        comment: inlineComment || pendingComment || undefined,
      });
      pendingComment = "";
    }
  }

  return entries;
}
