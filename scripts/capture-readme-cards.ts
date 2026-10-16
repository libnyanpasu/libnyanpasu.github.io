/**
 * Records the home page demos playing one loop each for READMEs:
 * the hero's client window (`hero`), the Material You card's recolouring one (`material-window`)
 * and every feature card, in light and dark, as
 * `dist/readme/<name>-<theme>@60f-q90.webp`, `...@60f.webm` and `...@60f.avif`.
 * Other locales are saved under `dist/readme/<locale>/`. Run it after `pnpm build`;
 * it serves `dist` itself. Requires Chromium, img2webp and FFmpeg with libvpx-vp9/libsvtav1.
 *
 *   node scripts/capture-readme-cards.ts [--cards hero,traffic] [--themes dark]
 *     [--locales en,zh-cn] [--formats webp,webm,avif] [--scale 2] [--speed 0.25]
 *
 * Frames come from Chrome's screencast, so the shader stages and the pretend mouse play exactly
 * as on the site. A loop is cut between two `m3f-loop` events from the demo's `Autoplay`, recorded
 * in slow motion to give capture enough headroom, then sampled on a fixed output timeline.
 * JS, shader and browser animation clocks are slowed together; outputs play at normal speed.
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
import { installCaptureClock, sampleFrames } from "./readme-card-timing.ts";
import { checkVideoEncoders, encodeVideos, VIDEO_FORMATS } from "./readme-card-video.ts";

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
    fps: { type: "string", default: "60" },
    quality: { type: "string", default: "90" },
    formats: { type: "string", default: "webp,webm,avif" },
    scale: { type: "string", default: "2" },
    speed: { type: "string", default: "0.25" },
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
const formats = [...new Set(list(args.formats))];
const videoFormats = VIDEO_FORMATS.filter((format) => formats.includes(format));
const scale = Number(args.scale);
const speed = Number(args.speed);
const viewport = { width: LAYOUT.width * scale, height: LAYOUT.height * scale };

for (const card of cards) if (!TARGETS[card]) throw new Error(`Unknown card: ${card}`);
if (!formats.length) throw new Error("At least one format is required");
for (const format of formats)
  if (!["webp", ...VIDEO_FORMATS].includes(format)) throw new Error(`Unknown format: ${format}`);
for (const theme of themes) if (!THEMES.includes(theme)) throw new Error(`Unknown theme: ${theme}`);
for (const rate of rates)
  if (!(rate >= 2 && rate <= 60)) throw new Error(`Unsupported fps: ${rate}`);
for (const quality of qualities)
  if (!(quality >= 1 && quality <= 100)) throw new Error(`Unsupported quality: ${quality}`);
if (!(scale >= 1 && scale <= 3)) throw new Error(`Unsupported scale: ${scale}`);
if (!(speed >= 0.05 && speed <= 1)) throw new Error(`Unsupported speed: ${speed}`);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Frame {
  file: string;
  /** Seconds on the slowed recording timeline. */
  time: number;
}

/** Resolves on the demo's next `m3f-loop` event on the recording timeline. */
function loops(page: Page) {
  const waiting = new Map<string, (time: number) => void>();
  const ready = page.exposeFunction("__m3fLoop", (card: string, time: number) => {
    waiting.get(card)?.(time);
    waiting.delete(card);
  });
  return async (card: string) => {
    await ready;
    return new Promise<number>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`${card}: no loop within ${LOOP_TIMEOUT / speed} ms`)),
        LOOP_TIMEOUT / speed,
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
    (element, { name, speed }) => {
      element.addEventListener("m3f-loop", () =>
        (window as unknown as { __m3fLoop: (card: string, time: number) => void }).__m3fLoop(
          name,
          (performance.timeOrigin * speed + performance.now()) / 1000,
        ),
      );
    },
    { name: card, speed },
  );

  // Bring the demo in from below so a card's entrance plays while less than half of its demo
  // shows, which keeps the demo from starting until the card has settled.
  let box = await measure(page, card);
  await page.evaluate(
    (top) => scrollTo({ top, behavior: "instant" }),
    box.y - viewport.height + box.height * 0.35,
  );
  await sleep(1800 / speed);

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
  let collecting = false;
  let start = 0;
  let previousTime = 0;
  let longest = 0;
  let captured = 0;
  const fps = Math.max(...rates);
  let pending: { data: string; time: number; slot: number } | undefined;
  const flush = () => {
    if (!pending) return;
    const file = join(dir, `raw-${String(frames.length).padStart(5, "0")}.jpg`);
    frames.push({ file, time: pending.time });
    writes.push(writeFile(file, Buffer.from(pending.data, "base64")));
    pending = undefined;
  };
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => undefined);
    if (!collecting) return;
    const time = (metadata.timestamp ?? Date.now() / 1000) * speed;
    longest = Math.max(longest, time - previousTime);
    previousTime = time;
    captured++;
    // Slow capture supplies several candidates per output frame. Keep the nearest
    // candidate in each slot, avoiding the disk/GC load of writing all of them.
    const slot = Math.round((time - start) * fps);
    if (pending && pending.slot !== slot) flush();
    const target = start + slot / fps;
    if (!pending || Math.abs(time - target) < Math.abs(pending.time - target))
      pending = { data, time, slot };
  });

  // Warm up the capture stream before the loop boundary; its first frame can be late.
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 95,
    maxWidth: viewport.width,
    maxHeight: viewport.height,
  });
  start = await nextLoop(card);
  previousTime = start;
  collecting = true;
  const end = await nextLoop(card);
  collecting = false;
  flush();
  await cdp.send("Page.stopScreencast");
  await cdp.detach();
  await Promise.all(writes);
  if (!frames.length) throw new Error(`${card}: no frames captured`);
  longest = Math.max(longest, end - previousTime) * 1000;
  console.log(
    `  ${card}: ${captured} source frames, ${frames.length} retained, longest source gap ${longest.toFixed(1)} ms (animation time)`,
  );
  if (longest > 1500 / Math.max(...rates))
    console.warn(`  ${card}: capture missed an output interval; retry with a lower --speed`);
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
 * Crops each source once. WebP keeps transparent rounded corners; WebM/AVIF retain the
 * captured page behind the corners and extend odd dimensions by one edge pixel for YUV420.
 */
async function encode(
  { frames, start, end, clip }: Awaited<ReturnType<typeof record>>,
  output: (fps: number, format: string, quality?: number) => string,
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

  const cropped = new Map<Frame, Promise<{ webp: string; video: string }>>();
  const crop = (frame: Frame) => {
    let file = cropped.get(frame);
    if (!file) {
      const path = frame.file.replace(/\.jpg$/, ".png");
      const video = frame.file.replace(/\.jpg$/, ".video.png");
      const source = sharp(frame.file).extract(region);
      file = Promise.all([
        formats.includes("webp")
          ? source
              .clone()
              .ensureAlpha()
              .composite([{ input: mask, blend: "dest-in" }])
              .png({ compressionLevel: 1 })
              .toFile(path)
          : undefined,
        videoFormats.length
          ? source
              .clone()
              .extend({ right: region.width % 2, bottom: region.height % 2, extendWith: "copy" })
              .png({ compressionLevel: 1 })
              .toFile(video)
          : undefined,
      ]).then(() => ({ webp: path, video }));
      cropped.set(frame, file);
    }
    return file;
  };

  const results = await Promise.allSettled(
    rates.map(async (fps) => {
      const { frames: kept, delays } = sampleFrames(frames, start, end, fps);
      const croppedFiles = await Promise.all(kept.map(crop));
      const webpFiles = croppedFiles.map((file) => file.webp);
      const videoFiles = croppedFiles.map((file) => file.video);
      const outputs = videoFormats.map((format) => ({ format, file: output(fps, format) }));
      const jobs = [
        ...qualities
          .filter(() => formats.includes("webp"))
          .map(async (quality) => {
            const file = output(fps, "webp", quality);
            await webp(webpFiles, delays, quality, fps, resolve(file));
            return [
              { file, width: region.width, seconds: delays.reduce((a, b) => a + b, 0) / 1000 },
            ];
          }),
        (async () => {
          await encodeVideos(
            videoFiles,
            fps,
            Object.fromEntries(outputs.map(({ format, file }) => [format, file])),
          );
          return outputs.map(({ file }) => ({
            file,
            width: region.width + (region.width % 2),
            seconds: kept.length / fps,
          }));
        })(),
      ];
      const encoded = await Promise.allSettled(jobs);
      const failures = encoded.filter((result) => result.status === "rejected");
      if (failures.length)
        throw new AggregateError(
          failures.map((result) => result.reason),
          "Encoding failed",
        );
      return Promise.all(
        encoded
          .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
          .map(async (result) => ({
            ...result,
            frames: kept.length,
            reused: kept.length - new Set(kept).size,
            size: (await stat(result.file)).size,
          })),
      );
    }),
  );
  const failures = results.filter((result) => result.status === "rejected");
  if (failures.length)
    throw new AggregateError(
      failures.map((result) => result.reason),
      "Encoding failed",
    );
  return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

await checkVideoEncoders(videoFormats);
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
      await page.addInitScript(installCaptureClock, speed);
      const animation = await context.newCDPSession(page);
      await animation.send("Animation.setPlaybackRate", { playbackRate: speed });
      const nextLoop = loops(page);
      await page.goto(`${origin}${locale === "en" ? "/" : `/${locale}/`}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForSelector("article.m3f-card");
      const siteTheme = await page.evaluate(() => document.documentElement.dataset.theme);
      if (siteTheme !== theme)
        throw new Error(`Expected the ${theme} theme, the page is ${siteTheme}`);

      for (const card of cards) {
        const dir = await mkdtemp(join(work, `${card}-`));
        const output = (fps: number, format: string, quality?: number) =>
          join(
            outDir,
            `${card}-${theme}@${fps}f${quality === undefined ? "" : `-q${quality}`}.${format}`,
          );
        try {
          const started = Date.now();
          const recording = await record(context, page, nextLoop, card, dir);
          for (const result of await encode(recording, output)) {
            const kbps = (result.size * 8) / result.seconds / 1000;
            const fps = result.frames / result.seconds;
            console.log(
              `${result.file}: ${result.width}px, ${result.frames} frames (${fps.toFixed(1)} fps, ${result.reused} reused samples), ${result.seconds.toFixed(1)} s, ${(result.size / 1e6).toFixed(2)} MB, ${kbps.toFixed(0)} kbps`,
            );
          }
          console.log(`  ${card}-${theme} took ${((Date.now() - started) / 1000).toFixed(0)} s`);
        } catch (error) {
          failed = true;
          console.error(`${card}-${theme}:`, error);
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
