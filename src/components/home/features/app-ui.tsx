import { motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { Icon, arrowNav, type IconData } from "./ui";

/**
 * Pieces of the desktop client, rebuilt from its source (frontend/nyanpasu) so the demos read as
 * the app rather than as generic Material widgets: the icon rail of its data pages, the floating
 * pill tabs at their bottom, its switch, sparkline and byte formatting.
 */

export interface RailItem {
  icon: IconData;
  label: string;
}

/** Left rail of the Traffic, Logs, Rules and Connections pages: a pill behind the icon. */
export function Rail({
  label,
  items,
  value,
  onChange,
  compact = false,
  cue = "rail",
}: {
  label: string;
  items: RailItem[];
  value: number;
  onChange: (index: number) => void;
  /** Icons only; the label moves to the tooltip. */
  compact?: boolean;
  /** `data-cue` prefix for the demo's autoplay script. */
  cue?: string;
}) {
  const id = useId();
  return (
    <div
      className="app-rail"
      role="tablist"
      aria-label={label}
      aria-orientation="vertical"
      data-compact={compact || undefined}
      data-m3f-group
    >
      {items.map((item, index) => {
        const selected = value === index;
        return (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={compact ? item.label : undefined}
            title={compact ? item.label : undefined}
            tabIndex={selected ? 0 : -1}
            data-m3f-item
            data-cue={`${cue}-${index}`}
            onClick={() => onChange(index)}
            onKeyDown={arrowNav(items.length, index, onChange)}
          >
            <span className="app-rail-icon">
              {selected && (
                <motion.span
                  className="app-rail-pill"
                  layoutId={`${id}-pill`}
                  transition={{ type: "spring", stiffness: 520, damping: 40 }}
                />
              )}
              <Icon icon={item.icon} />
            </span>
            {!compact && <span className="app-rail-label">{item.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** The floating rounded-full tab group at the bottom of a data page. */
export function PillTabs({
  label,
  options,
  value,
  onChange,
  cue = "pill",
}: {
  label: string;
  options: ReactNode[];
  value: number;
  onChange: (index: number) => void;
  /** `data-cue` prefix for the demo's autoplay script. */
  cue?: string;
}) {
  const id = useId();
  return (
    <div className="app-pills" role="radiogroup" aria-label={label} data-m3f-group>
      {options.map((option, index) => (
        <button
          key={index}
          type="button"
          role="radio"
          aria-checked={value === index}
          tabIndex={value === index ? 0 : -1}
          data-m3f-item
          data-cue={`${cue}-${index}`}
          onClick={() => onChange(index)}
          onKeyDown={arrowNav(options.length, index, onChange)}
        >
          {value === index && (
            <motion.span
              className="app-pills-pill"
              layoutId={`${id}-pill`}
              transition={{ type: "spring", stiffness: 520, damping: 42 }}
            />
          )}
          <span className="app-pills-label">{option}</span>
        </button>
      ))}
    </div>
  );
}

/** The client's M3 switch (handle grows and shows a check when on). */
export function Switch({
  checked,
  onChange,
  label,
  check,
  cue,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  check?: IconData;
  cue?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      className="app-switch"
      aria-checked={checked}
      aria-label={label}
      data-cue={cue}
      onClick={() => onChange(!checked)}
    >
      <span className="app-switch-handle">
        <Icon icon={check} />
      </span>
    </button>
  );
}

/** Area sparkline in currentColor, as the dashboard's traffic and memory widgets draw it. */
export function Spark({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((v, i) => [
    (i / (values.length - 1)) * 100,
    36 - ((v - min) / (max - min || 1)) * 30,
  ]);
  let line = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const mid = (x0 + x1) / 2;
    line += `C${mid} ${y0} ${mid} ${y1} ${x1} ${y1}`;
  }
  return (
    <svg
      className={className ? `app-spark ${className}` : "app-spark"}
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="app-spark-fill" d={`${line}V40H0Z`} />
      <path className="app-spark-line" d={line} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const UNITS = ["B", "KiB", "MiB", "GiB", "TiB"];

/** `parseTraffic` from the client: binary units, two decimals. */
export function bytes(value: number) {
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${unit === 0 ? value : value.toFixed(2)} ${UNITS[unit]}`;
}

/** Wrap every case-insensitive match of `query` in <mark>, like the client's HighlightText. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  if (!q) return text;
  const parts: ReactNode[] = [];
  const lower = text.toLowerCase();
  let from = 0;
  let at = lower.indexOf(q);
  while (at >= 0) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(<mark key={at}>{text.slice(at, at + q.length)}</mark>);
    from = at + q.length;
    at = lower.indexOf(q, from);
  }
  parts.push(text.slice(from));
  return parts;
}
