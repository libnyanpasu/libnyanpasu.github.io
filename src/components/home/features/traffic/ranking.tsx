import { AnimatePresence, motion } from "motion/react";
import { bytes } from "../app-ui";
import { Icon, type IconData } from "../ui";
import type { TrafficLabels } from "./types";
import type { Row } from "./data";

// ── Ranking card ───────────────────────────────────────────────────────────
export function Ranking({
  icon,
  title,
  rows,
  limit,
  labels,
  selected,
  onSelect,
  onViewAll,
}: {
  icon: IconData;
  title: string;
  rows: Row[];
  limit: number;
  labels: TrafficLabels;
  selected: string | null;
  onSelect: (name: string) => void;
  onViewAll?: () => void;
}) {
  const shown = rows.slice(0, limit);
  const rest = rows.slice(limit);
  const restBytes = rest.reduce((sum, r) => sum + r.up + r.down, 0);
  return (
    <section className="tr-rank">
      <header>
        <Icon icon={icon} />
        <h4>{title}</h4>
        <span className="tr-count">{rows.length}</span>
        {onViewAll && (
          <button type="button" className="tr-view-all" onClick={onViewAll}>
            {labels.viewAll}
          </button>
        )}
      </header>
      <div className="tr-rows">
        <AnimatePresence initial={false}>
          {shown.map((r, index) => (
            <motion.button
              key={r.name}
              type="button"
              layout="position"
              className="tr-row"
              data-first={index === 0 || undefined}
              aria-pressed={selected === r.name}
              data-cue={`row-${r.name}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
              onClick={() => onSelect(r.name)}
            >
              <span className="tr-row-top">
                <span className="tr-row-name" data-mono={r.mono || undefined}>
                  {r.name}
                </span>
                <span className="tr-row-value">{bytes(r.up + r.down)}</span>
              </span>
              <span className="tr-row-meta">
                <span>
                  <i>↑</i>
                  {bytes(r.up)}
                </span>
                <span>
                  <i>↓</i>
                  {bytes(r.down)}
                </span>
                <span>{labels.connectionCount.replace("{count}", r.conns.toLocaleString())}</span>
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
        {rest.length > 0 && (
          <p className="tr-others">
            {labels.others.replace("{count}", String(rest.length))} · {bytes(restBytes)}
          </p>
        )}
      </div>
    </section>
  );
}
