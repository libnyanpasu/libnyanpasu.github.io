import { MotionConfig, motion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { CountUp, Icon, Segmented, type Icons } from "./ui";

export interface TrafficLabels {
  rangeLabel: string;
  ranges: [string, string, string];
  history: string;
  peak: string;
  processes: string;
  destinations: string;
  process: [string, string, string];
  regions: [string, string, string];
  locale: string;
}

const W = 520;
const H = 180;
const PAD = 18;
const POINTS = 24;

const RANGES = [
  { total: "38.2", unit: "GB", peak: 86, seed: 7, shares: [62, 24, 14], dest: [48, 31, 21] },
  { total: "214", unit: "GB", peak: 54, seed: 19, shares: [55, 31, 14], dest: [41, 36, 23] },
  { total: "861", unit: "GB", peak: 41, seed: 31, shares: [48, 36, 16], dest: [37, 34, 29] },
];

/** Deterministic pseudo-random series in 0..1, so server and client render the same chart. */
function series(seed: number) {
  let state = seed * 9301 + 49297;
  const noise = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
  const raw = Array.from({ length: POINTS }, (_, i) => {
    const t = i / (POINTS - 1);
    return (
      0.38 +
      0.22 * Math.sin(t * Math.PI * (2 + (seed % 3)) + seed) +
      0.14 * Math.sin(t * Math.PI * 7 + seed * 2) +
      0.2 * noise()
    );
  });
  // Calm edges keep the peak well inside the chart.
  raw.forEach((v, i) => {
    raw[i] = v * (0.45 + 0.55 * Math.sin((i / (POINTS - 1)) * Math.PI));
  });
  const min = Math.min(...raw);
  const max = Math.max(...raw);
  return raw.map((v) => (v - min) / (max - min));
}

function toPoints(values: number[]) {
  return values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: H - PAD - v * (H - PAD * 2),
  }));
}

/** Catmull-Rom spline as cubic Béziers; the command count never changes, so `d` can tween. */
function smooth(points: { x: number; y: number }[]) {
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function tickLabels(range: number, locale: string) {
  if (range === 0) return ["00:00", "06:00", "12:00", "18:00", "24:00"];
  const day = 86_400_000;
  const base = Date.UTC(2026, 0, 5);
  const format =
    range === 1
      ? new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" })
      : new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" });
  const span = range === 1 ? 6 : 29;
  return [0, 0.25, 0.5, 0.75, 1].map((t) => format.format(base + Math.round(t * span) * day));
}

export default function TrafficCard({ labels, icons }: { labels: TrafficLabels; icons: Icons }) {
  const [range, setRange] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const gradient = `m3f-fill-${useId().replace(/:/g, "")}`;

  const all = useMemo(() => RANGES.map((r) => toPoints(series(r.seed))), []);
  const values = useMemo(() => RANGES.map((r) => series(r.seed)), []);
  const lines = useMemo(() => all.map(smooth), [all]);
  const areas = useMemo(() => lines.map((line) => `${line}L${W} ${H}L0 ${H}Z`), [lines]);
  const peakIndex = values[range].indexOf(Math.max(...values[range]));
  const active = hover ?? peakIndex;
  const point = all[range][active];
  const data = RANGES[range];
  const current = Math.max(1, Math.round(values[range][active] * data.peak));
  const ticks = tickLabels(range, labels.locale);

  return (
    <MotionConfig reducedMotion="user">
      <div className="m3f-traffic-body">
        <div className="m3f-traffic-main">
          <div className="m3f-traffic-top">
            <div className="m3f-stat">
              <span className="m3f-label">{labels.history}</span>
              <strong>
                <CountUp value={Number(data.total)} decimals={data.total.includes(".") ? 1 : 0} />
                <small>{data.unit}</small>
              </strong>
            </div>
            <Segmented
              label={labels.rangeLabel}
              options={labels.ranges}
              value={range}
              onChange={setRange}
              check={icons.check}
            />
          </div>

          <div
            className="m3f-chart"
            onPointerMove={(event) => {
              const box = event.currentTarget.getBoundingClientRect();
              const t = (event.clientX - box.left) / box.width;
              setHover(Math.min(POINTS - 1, Math.max(0, Math.round(t * (POINTS - 1)))));
            }}
            onPointerLeave={() => setHover(null)}
          >
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="currentColor" stopOpacity=".32" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                className="m3f-chart-grid"
                d={`M0 ${H * 0.25}H${W}M0 ${H * 0.5}H${W}M0 ${H * 0.75}H${W}`}
              />
              <motion.path
                fill={`url(#${gradient})`}
                initial={false}
                animate={{ d: areas[range] }}
                transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
              />
              <motion.path
                className="m3f-chart-line"
                initial={false}
                animate={{ d: lines[range] }}
                transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <motion.span
              className="m3f-chart-marker"
              initial={false}
              animate={{ left: `${(point.x / W) * 100}%`, top: `${(point.y / H) * 100}%` }}
              transition={{ type: "spring", stiffness: 520, damping: 40 }}
            >
              <span className="m3f-chart-dot" />
              <span className="m3f-chart-tip">
                {hover === null && <b>{labels.peak}</b>}
                {current} MB/s
              </span>
            </motion.span>
          </div>
          <div className="m3f-ticks" aria-hidden="true">
            {ticks.map((tick, i) => (
              <span key={i}>{tick}</span>
            ))}
          </div>
        </div>

        <div className="m3f-traffic-side">
          <div className="m3f-group">
            <span className="m3f-label">{labels.processes}</span>
            <ul className="m3f-progress-list">
              {labels.process.map((name, i) => (
                <li key={name}>
                  <span>{name}</span>
                  <span className="m3f-linear" role="presentation">
                    <i style={{ inlineSize: `${data.shares[i]}%` }} />
                  </span>
                  <span className="m3f-progress-value">{data.shares[i]}%</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="m3f-group">
            <span className="m3f-label">{labels.destinations}</span>
            <div className="m3f-chip-row">
              {labels.regions.map((name, i) => (
                <span className="m3f-chip m3f-chip-assist" key={name}>
                  <Icon icon={icons.language} />
                  {name}
                  <b>{data.dest[i]}%</b>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
