/** Runs in the recording page before any application code. Browser animations use the
 * matching CDP document-timeline rate; JS timers, Motion and shader clocks use this rate. */
export function installCaptureClock(rate: number) {
  const now = performance.now.bind(performance);
  const epoch = performance.timeOrigin;
  Object.defineProperty(performance, "now", { value: () => now() * rate });
  Date.now = () => Math.floor(epoch + now() * rate);

  // CDP's document-timeline rate already scales requestAnimationFrame timestamps.
  const timeout = window.setTimeout.bind(window);
  const interval = window.setInterval.bind(window);
  Object.defineProperty(window, "setTimeout", {
    value: (handler: TimerHandler, delay = 0, ...args: unknown[]) =>
      timeout(handler, delay / rate, ...args),
  });
  Object.defineProperty(window, "setInterval", {
    value: (handler: TimerHandler, delay = 0, ...args: unknown[]) =>
      interval(handler, delay / rate, ...args),
  });
}

/** Sample the source on a fixed output timeline. Rounding cumulative boundaries, rather
 * than each duration, keeps 60 fps at 60 fps (17/16/17 ms) without stretching the loop. */
export function sampleFrames<T extends { time: number }>(
  frames: T[],
  start: number,
  end: number,
  fps: number,
) {
  if (!frames.length || end <= start) throw new Error("Cannot sample an empty recording");
  const duration = Math.round((end - start) * 1000);
  const count = Math.ceil((duration * fps) / 1000);
  const sampled: T[] = [];
  const delays: number[] = [];
  let source = 0;
  for (let index = 0; index < count; index++) {
    const time = start + index / fps;
    // Nearest source sample; never discard a useful frame just because capture jitter
    // placed it a little less than one nominal interval after the previous one.
    while (
      source + 1 < frames.length &&
      Math.abs(frames[source + 1].time - time) <= Math.abs(frames[source].time - time)
    )
      source++;
    sampled.push(frames[source]);
    delays.push(
      Math.min(duration, Math.round(((index + 1) * 1000) / fps)) - Math.round((index * 1000) / fps),
    );
  }
  // A tiny final remainder should extend the preceding frame, not create a <=10 ms
  // frame which browsers may clamp to 100 ms.
  if (delays.length > 1 && delays.at(-1)! <= 10) {
    delays[delays.length - 2] += delays.pop()!;
    sampled.pop();
  }
  return { frames: sampled, delays };
}
