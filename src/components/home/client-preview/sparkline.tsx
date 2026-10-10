import { deviation, mean } from "d3-array";
import { SourceSparkline } from "./source-sparkline";

// Advance a fixed-size history so the upstream chart can animate new samples.
// The same samples drive the metric value and its curve.
export function getFrameSeries(series: number[], frame: number) {
  if (!series.length || frame === 0) return series;
  const average = mean(series) ?? 0;
  const stable = average > 0 && (deviation(series) ?? 0) / average < 0.15;
  const latest = series.at(-1)!;
  return series.map((_, index) => {
    const sample = index + frame;
    if (sample < series.length) return series[sample];
    const time = sample - series.length + 1;
    const variation = Math.sin(time * 0.65) * 0.18 + Math.sin(time * 1.7) * 0.07;
    return Math.max(0, latest * (1 + variation * (stable ? 0.08 : 1)));
  });
}

export function Sparkline({
  series,
  frame,
  paused,
}: {
  series: number[];
  frame: number;
  paused: boolean;
}) {
  return (
    <SourceSparkline data={getFrameSeries(series, frame)} animationDuration={paused ? 0 : 1.4} />
  );
}
