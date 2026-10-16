/**
 * Records the home page demos playing one loop each and saves them as animated WebPs for READMEs:
 * the hero's client window (`hero`), the Material You card's recolouring one (`material-window`)
 * and every feature card, in light and dark, at each frame rate and quality, as
 * `dist/readme/<name>-<theme>@<fps>f-q<quality>.webp`, and for other locales under
 * `dist/readme/<locale>/`. Run it after `pnpm build`; it serves `dist` itself.
 *
 *   node scripts/capture-readme-cards.ts [--cards hero,traffic] [--themes dark]
 *     [--locales en,zh-cn] [--fps 30,60] [--quality 50,75,90] [--scale 2]
 *
 * Frames come from Chrome's screencast, so the shader stages and the pretend mouse play exactly
 * as on the site. A loop is cut between two `m3f-loop` events from the demo's `Autoplay`, recorded
 * once at the highest rate and thinned out for the lower ones.
 *
 * The screencast only sends CSS pixels whatever the device pixel ratio, so `--scale` renders the
 * page with CSS `zoom` in a viewport that much larger: the same layout, at that many times the
 * pixels.
 */
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { parseArgs, promisify } from "node:util";
import { preview } from "astro";
import { chromium, type BrowserContext, type Page } from "playwright";
import sharp from "sharp";

/** Where each demo's loops are announced (`root`), and the part of the page that is saved (`clip`). */
const TARGETS: Record<string, { root: string; clip: string }> = {
  hero: { root: ".hero-showcase", clip: ".hero-showcase .cp-window" },
  // The client window alone from the Material You card, recolouring itself as it plays.
  "material-window": {
    root: "article.m3f-card.m3f-material",
    clip: "article.m3f-card.m3f-material .cp-window",
  },
  ...Object.fromEntries(
    ["traffic", "profiles", "dashboard", "material", "cores", "logs"].map((card) => {
      const selector = `article.m3f-card.m3f-${card}`;
      return [card, { root: selector, clip: selector }];
    }),
  ),
};
const THEMES = ["light", "dark"] as const;
/** The layout the demos are recorded at, in CSS pixels. */
const LAYOUT = { width: 1280, height: 1000 };
/** Longest wait for a demo's next loop to begin or end. */
const LOOP_TIMEOUT = 90_000;

const { values: args } = parseArgs({
  options: {
    cards: { type: "string", default: Object.keys(TARGETS).join(",") },
    themes: { type: "string", default: THEMES.join(",") },
    locales: { type: "string", default: "en" },
    fps: { type: "string", default: "30,60" },
    quality: { type: "string", default: "50,75,90" },
    scale: { type: "string", default: "2" },
    out: { type: "string", default: "dist/readme" },
  },
});
const list = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const numbers = (value: string) =>
  list(value)
    .map(Number)
    .sort((a, b) => a - b);
const cards = list(args.cards);
const themes = list(args.themes) as (typeof THEMES)[number][];
const locales = list(args.locales);
const rates = numbers(args.fps);
const qualities = numbers(args.quality);
const scale = Number(args.scale);
const viewport = { width: LAYOUT.width * scale, height: LAYOUT.height * scale };

for (const card of cards) if (!TARGETS[card]) throw new Error(`Unknown card: ${card}`);
for (const theme of themes) if (!THEMES.includes(theme)) throw new Error(`Unknown theme: ${theme}`);
for (const rate of rates)
  if (!(rate >= 2 && rate <= 60)) throw new Error(`Unsupported fps: ${rate}`);
for (const quality of qualities)
  if (!(quality >= 1 && quality <= 100)) throw new Error(`Unsupported quality: ${quality}`);
if (!(scale >= 1 && scale <= 3)) throw new Error(`Unsupported scale: ${scale}`);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Frame {
  file: string;
  /** Seconds, wall clock. */
  time: number;
}

/** Resolves on the demo's next `m3f-loop` event with its wall-clock time in seconds. */
function loops(page: Page) {
  const waiting = new Map<string, (time: number) => void>();
  const ready = page.exposeFunction("__m3fLoop", (card: string) => {
    waiting.get(card)?.(Date.now() / 1000);
    waiting.delete(card);
  });
  return async (card: string) => {
    await ready;
    return new Promise<number>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`${card}: no loop within ${LOOP_TIMEOUT} ms`)),
        LOOP_TIMEOUT,
      );
      waiting.set(card, (time) => {
        clearTimeout(timer);
        resolve(time);
      });
    });
  };
}

/**
 * Where a demo sits on the page, from the document's top-left. Under `zoom`, rects and scroll
 * offsets are both in viewport pixels; only the computed radius is still in CSS pixels.
 */
const measure = (page: Page, card: string) =>
  page.$eval(
    TARGETS[card].clip,
    (element, zoom) => {
      const box = element.getBoundingClientRect();
      // The home page's header stays over the top of the viewport.
      const header = document.querySelector(".home-header");
      const pinned = header && /fixed|sticky/.test(getComputedStyle(header).position);
      return {
        x: box.left + scrollX,
        y: box.top + scrollY,
        width: box.width,
        height: box.height,
        radius: (parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0) * zoom,
        header: pinned ? header.getBoundingClientRect().bottom : 0,
      };
    },
    scale,
  );

async function record(
  context: BrowserContext,
  page: Page,
  nextLoop: (card: string) => Promise<number>,
  card: string,
  dir: string,
) {
  await page.$eval(
    TARGETS[card].root,
    (element, name) => {
      element.addEventListener("m3f-loop", () =>
        (window as unknown as { __m3fLoop: (card: string) => void }).__m3fLoop(name),
      );
    },
    card,
  );

  // Bring the demo in from below so a card's entrance plays while less than half of its demo
  // shows, which keeps the demo from starting until the card has settled.
  let box = await measure(page, card);
  await page.evaluate(
    (top) => scrollTo({ top, behavior: "instant" }),
    box.y - viewport.height + box.height * 0.35,
  );
  await sleep(1800);

  // Then centre it below the site header, where the demo starts playing.
  box = await measure(page, card);
  const room = viewport.height - box.header;
  if (box.height > room)
    throw new Error(`${card}: ${box.height}px tall, taller than the ${room}px viewport`);
  const top = box.y - box.header - (room - box.height) / 2;
  await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), top);
  // Measured again rather than worked out: near the top of the page (the hero) the scroll
  // stops short of `top`.
  const scrolled = await page.evaluate(() => scrollY);
  const clip = { ...box, x: box.x - (await page.evaluate(() => scrollX)), y: box.y - scrolled };

  const cdp = await context.newCDPSession(page);
  const frames: Frame[] = [];
  const writes: Promise<void>[] = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => undefined);
    const file = join(dir, `raw-${String(frames.length).padStart(5, "0")}.jpg`);
    frames.push({ file, time: metadata.timestamp ?? Date.now() / 1000 });
    writes.push(writeFile(file, Buffer.from(data, "base64")));
  });

  const start = await nextLoop(card);
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 95,
    maxWidth: viewport.width,
    maxHeight: viewport.height,
  });
  const end = await nextLoop(card);
  await cdp.send("Page.stopScreencast");
  await cdp.detach();
  await Promise.all(writes);
  if (!frames.length) throw new Error(`${card}: no frames captured`);
  return { frames, start, end, clip };
}

/**
 * Joins frames into an animated WebP with libwebp's `img2webp`, rather than sharp, for its
 * keyframe settings. Between keyframes the lossy encoder leaves pixels that changed less than
 * its tolerance as they were, so the tail of a slow fade (a log row going out) stays on screen
 * as a ghost; a keyframe every second clears it. `-kmin` just under `-kmax` keeps the encoder
 * from trying every frame in between as a keyframe, which is over four times faster for about
 * the same size; `-sharp_yuv` is left off for the same reason.
 */
async function webp(
  files: string[],
  delays: number[],
  quality: number,
  fps: number,
  output: string,
) {
  const args = ["-loop", "0", "-kmin", String(fps - 1), "-kmax", String(fps)];
  args.push("-lossy", "-q", String(quality), "-m", "4");
  // Frame names only (they all sit in one directory), to keep the command line short.
  files.forEach((file, index) => args.push("-d", String(delays[index]), basename(file)));
  args.push("-o", output);
  await promisify(execFile)("img2webp", args, {
    cwd: join(files[0], ".."),
    maxBuffer: 64 * 1024 * 1024,
  });
}

/**
 * Crops the frames to the demo with its rounded corners cut out, and joins them into one WebP per
 * frame rate and quality. Each frame is cropped once, however many outputs keep it.
 */
async function encode(
  { frames, end, clip }: Awaited<ReturnType<typeof record>>,
  output: (fps: number, quality: number) => string,
) {
  const { width: frameWidth = viewport.width } = await sharp(frames[0].file).metadata();
  const ratio = frameWidth / viewport.width;
  const region = {
    left: Math.max(0, Math.round(clip.x * ratio)),
    top: Math.max(0, Math.round(clip.y * ratio)),
    width: Math.round(clip.width * ratio),
    height: Math.round(clip.height * ratio),
  };
  const radius = clip.radius * ratio;
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${region.width}" height="${region.height}"><rect width="100%" height="100%" rx="${radius}" ry="${radius}"/></svg>`,
  );

  const cropped = new Map<Frame, Promise<string>>();
  const crop = (frame: Frame) => {
    let file = cropped.get(frame);
    if (!file) {
      const path = frame.file.replace(/\.jpg$/, ".png");
      file = sharp(frame.file)
        .extract(region)
        .ensureAlpha()
        .composite([{ input: mask, blend: "dest-in" }])
        .png({ compressionLevel: 1 })
        .toFile(path)
        .then(() => path);
      cropped.set(frame, file);
    }
    return file;
  };

  // Each encode is single-threaded, so every rate and quality runs side by side.
  const jobs = await Promise.all(
    rates.map(async (fps) => {
      // Drop frames that come faster than the rate; each kept frame lasts until the next.
      const interval = 1 / fps;
      const kept = frames.reduce<Frame[]>((acc, frame) => {
        if (!acc.length || frame.time - acc[acc.length - 1].time >= interval * 0.9) acc.push(frame);
        return acc;
      }, []);
      const delays = kept.map((frame, index) =>
        Math.max(16, Math.round(((kept[index + 1]?.time ?? end) - frame.time) * 1000)),
      );
      const files = await Promise.all(kept.map(crop));
      return qualities.map((quality) => ({ fps, quality, files, delays }));
    }),
  );
  return Promise.all(
    jobs.flat().map(async ({ fps, quality, files, delays }) => {
      const file = output(fps, quality);
      await webp(files, delays, quality, fps, resolve(file));
      const { size } = await stat(file);
      const seconds = delays.reduce((a, b) => a + b, 0) / 1000;
      return { file, frames: files.length, seconds, size, width: region.width };
    }),
  );
}

const server = await preview({
  root: process.cwd(),
  logLevel: "warn",
  server: { host: "127.0.0.1", port: 4329 },
});
const origin = `http://127.0.0.1:${server.port}`;
const browser = await chromium.launch({
  // CI runners have no GPU: let WebGL fall back to SwiftShader so the shader stages still draw.
  args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const work = await mkdtemp(join(tmpdir(), "readme-cards-"));
let failed = false;

try {
  for (const locale of locales) {
    const outDir = locale === "en" ? args.out : join(args.out, locale);
    await mkdir(outDir, { recursive: true });

    for (const theme of themes) {
      const context = await browser.newContext({
        viewport,
        colorScheme: theme,
        reducedMotion: "no-preference",
      });
      // Before any script runs, so the page lays out at `LAYOUT` from the start. The site only
      // has max-width breakpoints, all below `LAYOUT.width`, so the wider viewport changes none.
      await context.addInitScript((zoom) => {
        const apply = () => {
          if (document.documentElement) document.documentElement.style.zoom = String(zoom);
          return !!document.documentElement;
        };
        if (!apply())
          new MutationObserver((_, observer) => apply() && observer.disconnect()).observe(
            document,
            { childList: true },
          );
      }, scale);
      const page = await context.newPage();
      const nextLoop = loops(page);
      await page.goto(`${origin}${locale === "en" ? "/" : `/${locale}/`}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForSelector("article.m3f-card");
      const siteTheme = await page.evaluate(() => document.documentElement.dataset.theme);
      if (siteTheme !== theme)
        throw new Error(`Expected the ${theme} theme, the page is ${siteTheme}`);

      for (const card of cards) {
        const dir = await mkdtemp(join(work, `${card}-`));
        const output = (fps: number, quality: number) =>
          join(outDir, `${card}-${theme}@${fps}f-q${quality}.webp`);
        try {
          const started = Date.now();
          const recording = await record(context, page, nextLoop, card, dir);
          for (const result of await encode(recording, output)) {
            const kbps = (result.size * 8) / result.seconds / 1000;
            // At 2x the screencast may not keep up with the higher rates; this is what it reached.
            const fps = result.frames / result.seconds;
            console.log(
              `${result.file}: ${result.width}px, ${result.frames} frames (${fps.toFixed(0)} fps), ${result.seconds.toFixed(1)} s, ${(result.size / 1e6).toFixed(2)} MB, ${kbps.toFixed(0)} kbps`,
            );
          }
          console.log(`  ${card}-${theme} took ${((Date.now() - started) / 1000).toFixed(0)} s`);
        } catch (error) {
          failed = true;
          console.error(`${card}-${theme}: ${error instanceof Error ? error.message : error}`);
        } finally {
          await rm(dir, { recursive: true, force: true });
        }
      }
      await context.close();
    }
  }
} finally {
  await browser.close();
  await server.stop();
  await rm(work, { recursive: true, force: true });
}

if (failed) process.exitCode = 1;
