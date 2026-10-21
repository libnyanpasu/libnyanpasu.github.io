import type { DownloadSource, DownloadSourceId } from "./types";

export interface ProbeResult {
  id: DownloadSourceId;
  status: "ready" | "timeout" | "unmeasurable";
  elapsed?: number;
}

function probeImage(source: DownloadSource, signal: AbortSignal): Promise<ProbeResult> {
  if (!source.probeUrl) return Promise.resolve({ id: source.id, status: "unmeasurable" });
  return new Promise((resolve) => {
    if (signal.aborted) return resolve({ id: source.id, status: "unmeasurable" });
    const image = new Image();
    const started = performance.now();
    let finished = false;
    const finish = (status: ProbeResult["status"]) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener("abort", abort);
      image.removeAttribute("src");
      resolve({
        id: source.id,
        status,
        ...(status === "ready" ? { elapsed: performance.now() - started } : {}),
      });
    };
    const abort = () => finish("unmeasurable");
    const timeout = setTimeout(() => finish("timeout"), 4500);
    signal.addEventListener("abort", abort, { once: true });
    // An image load verifies decodable bytes without needing CORS response access.
    image.referrerPolicy = "no-referrer";
    image.onload = () => finish(image.naturalWidth > 0 ? "ready" : "unmeasurable");
    image.onerror = () => finish("unmeasurable");
    const url = new URL(source.probeUrl!);
    url.searchParams.set("_nyanpasu_probe", String(Date.now()));
    image.src = url.href;
  });
}

export async function probeSources(
  sources: DownloadSource[],
  signal: AbortSignal,
): Promise<ProbeResult[]> {
  const results: ProbeResult[] = [];
  let index = 0;
  async function worker() {
    while (index < sources.length && !signal.aborted) {
      const source = sources[index++];
      results.push(await probeImage(source, signal));
    }
  }
  await Promise.all([worker(), worker()]);
  return results;
}

export function probeCacheKey(tag: string, sources: DownloadSource[]) {
  return `nyanpasu-download:${tag}:${sources.map((source) => source.probeUrl || source.id).join("|")}`;
}

export function readProbeCache(key: string): ProbeResult[] | undefined {
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (
      cached &&
      Number.isFinite(cached.at) &&
      Date.now() - cached.at >= 0 &&
      Date.now() - cached.at < 5 * 60_000 &&
      Array.isArray(cached.results) &&
      cached.results.every(
        (item: ProbeResult) =>
          ["nyanpasu", "sourceforge", "ghfast", "github"].includes(item.id) &&
          ["ready", "timeout", "unmeasurable"].includes(item.status) &&
          (item.status !== "ready" || (Number.isFinite(item.elapsed) && item.elapsed! >= 0)),
      )
    ) {
      return cached.results;
    }
  } catch {
    // Downloads still work with browser storage disabled.
  }
  return undefined;
}

export function writeProbeCache(key: string, results: ProbeResult[]) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), results }));
  } catch {
    // Caching is optional.
  }
}
