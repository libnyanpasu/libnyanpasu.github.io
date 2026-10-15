import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Icon, type Icons } from "./ui";

export interface LogsLabels {
  search: string;
  all: string;
  info: string;
  warn: string;
  error: string;
  empty: string;
}

type Level = "info" | "warn" | "error";

const RECORDS: { time: string; level: Level; target: string; message: string }[] = [
  {
    time: "10:42:08",
    level: "info",
    target: "core::tun",
    message: "TUN device nyanpasu-tun is up",
  },
  {
    time: "10:42:08",
    level: "info",
    target: "core::dns",
    message: "fake-ip pool 198.18.0.0/16 ready",
  },
  {
    time: "10:42:11",
    level: "info",
    target: "profile",
    message: "Applied profile with 2 processing steps",
  },
  {
    time: "10:42:19",
    level: "warn",
    target: "provider",
    message: "Subscription refresh took 4.2s, retrying",
  },
  { time: "10:42:27", level: "info", target: "proxy", message: "Group Auto selected Tokyo 02" },
  {
    time: "10:42:35",
    level: "error",
    target: "dial",
    message: "dial tcp 203.0.113.9:443: i/o timeout",
  },
  { time: "10:42:36", level: "warn", target: "dns", message: "Fallback resolver answered first" },
  {
    time: "10:42:44",
    level: "info",
    target: "service",
    message: "Service connected, core managed by service",
  },
  {
    time: "10:42:52",
    level: "info",
    target: "log",
    message: "Rotated nyanpasu.log, compressed 3 files",
  },
];

function highlight(text: string, query: string) {
  if (!query) return text;
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark>{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </>
  );
}

export default function LogsCard({ labels, icons }: { labels: LogsLabels; icons: Icons }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | Level>("all");

  const filters: { id: "all" | Level; label: string }[] = [
    { id: "all", label: labels.all },
    { id: "info", label: labels.info },
    { id: "warn", label: labels.warn },
    { id: "error", label: labels.error },
  ];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RECORDS.filter(
      (row) =>
        (level === "all" || row.level === level) &&
        (!q || `${row.target} ${row.message}`.toLowerCase().includes(q)),
    );
  }, [query, level]);

  return (
    <div className="m3f-logs-body">
      <label className="m3f-field">
        <Icon icon={icons.search} />
        <input
          type="text"
          value={query}
          placeholder={labels.search}
          aria-label={labels.search}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            className="m3f-icon-button"
            aria-label="Clear"
            onClick={() => setQuery("")}
          >
            <Icon icon={icons.close} />
          </button>
        )}
      </label>
      <div className="m3f-chip-row" role="group" aria-label={labels.search}>
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className="m3f-chip m3f-chip-filter"
            aria-pressed={level === filter.id}
            onClick={() => setLevel(filter.id)}
          >
            <Icon icon={icons.check} className="m3f-chip-check" />
            {filter.label}
          </button>
        ))}
      </div>
      <MotionConfig reducedMotion="user">
        <motion.div layout className="m3f-log-list" role="log" aria-live="off">
          <LayoutGroup>
            <AnimatePresence mode="popLayout" initial={false}>
              {rows.map((row) => (
                <motion.div
                  layout
                  key={`${row.time}-${row.target}`}
                  className="m3f-log-row"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ type: "spring", stiffness: 460, damping: 38 }}
                >
                  <time>{row.time}</time>
                  <span className="m3f-level" data-level={row.level}>
                    {row.level}
                  </span>
                  <code>
                    <span className="m3f-log-target">{highlight(row.target, query.trim())}</span>{" "}
                    {highlight(row.message, query.trim())}
                  </code>
                </motion.div>
              ))}
            </AnimatePresence>
          </LayoutGroup>
          {rows.length === 0 && <p className="m3f-empty">{labels.empty}</p>}
        </motion.div>
      </MotionConfig>
    </div>
  );
}
