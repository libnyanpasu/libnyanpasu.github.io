import assert from "node:assert/strict";
import { test } from "node:test";
import { chromium } from "playwright";
import { installCaptureClock, sampleFrames } from "./readme-card-timing.ts";

test("60 fps keeps the loop duration without accumulating millisecond rounding", () => {
  const source = Array.from({ length: 3600 }, (_, index) => ({ time: 1000 + index / 60 }));
  const result = sampleFrames(source, 1000, 1060, 60);
  assert.equal(result.frames.length, 3600);
  assert.equal(
    result.delays.reduce((a, b) => a + b, 0),
    60_000,
  );
  assert.deepEqual(new Set(result.delays), new Set([16, 17]));
  assert.deepEqual(result.frames, source);
});

test("jittered capture is sampled on the output grid instead of greedily dropping frames", () => {
  const source = Array.from({ length: 240 }, (_, index) => ({
    time: index / 240 + (index % 2 ? 0.0002 : 0),
  }));
  for (const fps of [30, 60]) {
    const result = sampleFrames(source, 0, 1, fps);
    assert.equal(result.frames.length, fps);
    assert.equal(
      result.delays.reduce((a, b) => a + b, 0),
      1000,
    );
    result.frames.forEach((frame, index) =>
      assert.ok(Math.abs(frame.time - index / fps) < 1 / 240),
    );
    assert.equal(new Set(result.frames).size, fps);
  }
});

test("out-of-order screencast timestamps cannot trap sampling on an early frame", () => {
  const ordered = Array.from({ length: 240 }, (_, index) => ({ time: 1000 + index / 240 }));
  const source = [...ordered];
  // A late compositor frame can arrive behind a newer timestamp.
  [source[15], source[16]] = [source[16], source[15]];
  const original = [...source];

  const result = sampleFrames(source, 1000, 1001, 60);
  assert.deepEqual(result, sampleFrames(ordered, 1000, 1001, 60));
  assert.equal(new Set(result.frames).size, 60);
  assert.deepEqual(source, original, "sampling must not reorder the caller's recording");
});

test("the loop tail cannot produce a short frame that browsers clamp", () => {
  const result = sampleFrames([{ time: 0 }, { time: 0.5 }], 0, 1.004, 60);
  assert.equal(
    result.delays.reduce((a, b) => a + b, 0),
    1004,
  );
  assert.ok(result.delays.every((delay) => delay > 10));
  assert.equal(result.frames.length, result.delays.length);
});

test("slow capture keeps timers, shader clocks, rAF and browser animations in sync", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.addInitScript(installCaptureClock, 0.25);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Animation.setPlaybackRate", { playbackRate: 0.25 });
    await page.goto(
      "data:text/html," +
        encodeURIComponent(
          "<style>@keyframes fade{from{opacity:0}to{opacity:1}}#css{animation:fade 1s linear both paused}</style><div id=css></div><div id=waapi></div>",
        ),
    );
    const wallStart = Date.now();
    const result = await page.evaluate(async () => {
      const css = document.querySelector<HTMLElement>("#css")!;
      css.style.animationPlayState = "running";
      const animation = document
        .querySelector("#waapi")!
        .animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, fill: "both" });
      const first = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
      const start = performance.now();
      const date = Date.now();
      let ticks = 0;
      const interval = setInterval(() => ticks++, 50);
      await new Promise<void>((resolve) => setTimeout(resolve, 200));
      clearInterval(interval);
      const last = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
      return {
        elapsed: performance.now() - start,
        date: Date.now() - date,
        raf: last - first,
        animation: Number(animation.currentTime),
        css: Number(getComputedStyle(css).opacity) * 1000,
        ticks,
      };
    });
    assert.ok(Date.now() - wallStart >= 750, "200 ms of animation needs about 800 ms of capture");
    for (const clock of [result.date, result.raf, result.animation, result.css]) {
      assert.ok(Math.abs(clock - result.elapsed) < 50, JSON.stringify(result));
    }
    assert.ok(result.elapsed >= 190 && result.elapsed < 350, JSON.stringify(result));
    assert.ok(result.ticks >= 3 && result.ticks <= 5);
  } finally {
    await browser.close();
  }
});
