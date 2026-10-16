import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Highlight, PillTabs, Rail } from "./app-ui";
import { Autoplay, type Cue } from "./frame";
import { Icon, type Icons } from "./ui";

/**
 * The client's Logs page (pages/(main)/main/logs): a rail of levels, records with time and a
 * level badge over a monospace message, and a floating search field beside the Core / App /
 * Service source tabs. Badge colours follow log-level-badge.tsx.
 */

export interface LogsLabels {
  rail: string;
  levels: [
    all: string,
    trace: string,
    debug: string,
    info: string,
    warn: string,
    error: string,
    fatal: string,
  ];
  search: string;
  sourceLabel: string;
  sources: [core: string, app: string, service: string];
  empty: string;
  clear: string;
}

type Level = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
const LEVELS: (Level | null)[] = [null, "trace", "debug", "info", "warn", "error", "fatal"];

interface LogRecord {
  time: string;
  level: Level;
  target?: string;
  message: string;
}

const CORE: LogRecord[] = [
  { time: "08:23:31", level: "info", message: "Start initial configuration in progress" },
  {
    time: "08:23:31",
    level: "info",
    message:
      "[TCP] 127.0.0.1:51602 --> api.github.com:443 match RuleSet(developer) using Developer[JP IEPL 01]",
  },
  { time: "08:23:32", level: "trace", message: "[Sniffer] sniff TLS host api.github.com" },
  {
    time: "08:23:33",
    level: "debug",
    message: "[DNS] cache hit api.telegram.org --> 149.154.167.220",
  },
  {
    time: "08:23:36",
    level: "warn",
    message:
      "[TCP] dial Selected (match Match/) 127.0.0.1:51626 --> www.svgrepo.com:443 error: hk02.example.net:10112 connect error: EOF",
  },
  {
    time: "08:23:40",
    level: "info",
    message:
      "[TCP] 127.0.0.1:51640 --> store.steampowered.com:443 match RuleSet(steam) using Steam[DIRECT]",
  },
  {
    time: "08:23:41",
    level: "error",
    message: "[Provider] steam pull error: context deadline exceeded",
  },
];

const APP: LogRecord[] = [
  {
    time: "08:23:29",
    level: "info",
    target: "nyanpasu::core::clash",
    message: "core mihomo-alpha started by service",
  },
  {
    time: "08:23:29",
    level: "debug",
    target: "nyanpasu::ipc",
    message: "connected to core over IPC · Unix Socket",
  },
  {
    time: "08:23:30",
    level: "info",
    target: "nyanpasu::config::runtime",
    message: "runtime config generated, revision 8",
  },
  {
    time: "08:23:30",
    level: "warn",
    target: "nyanpasu::profile",
    message: "subscription refresh took 4.2 s, retrying once",
  },
  {
    time: "08:23:35",
    level: "info",
    target: "nyanpasu::logging",
    message: "rotated nyanpasu.log at 16 MiB, compressed with the built-in dictionary",
  },
];

const SERVICE: LogRecord[] = [
  {
    time: "08:23:27",
    level: "info",
    target: "nyanpasu_service::server",
    message: "listening on nyanpasu-service.sock",
  },
  {
    time: "08:23:28",
    level: "info",
    target: "nyanpasu_service::core",
    message: "spawned mihomo-alpha with config-9.yaml",
  },
  {
    time: "08:23:28",
    level: "debug",
    target: "nyanpasu_service::core",
    message: "health check ok in 3 ms",
  },
  {
    time: "08:24:02",
    level: "fatal",
    target: "nyanpasu_service::core",
    message: "core exited unexpectedly (signal 9), restarting",
  },
  {
    time: "08:24:03",
    level: "info",
    target: "nyanpasu_service::core",
    message: "core restarted, pid 87560",
  },
];

const SOURCES = [CORE, APP, SERVICE];

export default function LogsCard({ labels, icons }: { labels: LogsLabels; icons: Icons }) {
  const [level, setLevel] = useState(0);
  const [source, setSource] = useState(0);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const wanted = LEVELS[level];
    const q = query.trim().toLowerCase();
    return SOURCES[source].filter(
      (row) =>
        (!wanted || row.level === wanted) &&
        (!q ||
          `${row.time} ${row.level} ${row.target ?? ""} ${row.message}`.toLowerCase().includes(q)),
    );
  }, [level, source, query]);

  // The pretend mouse: narrow to warnings and errors, switch log sources, search, clear.
  const script: Cue[] = [
    { at: '[data-cue="rail-4"]', run: () => setLevel(4), hold: 1800 },
    { at: '[data-cue="rail-5"]', run: () => setLevel(5), hold: 1600 },
    { at: '[data-cue="rail-0"]', run: () => setLevel(0), hold: 900 },
    { at: '[data-cue="source-1"]', run: () => setSource(1), hold: 1800 },
    { at: '[data-cue="source-2"]', run: () => setSource(2), hold: 1800 },
    { at: '[data-cue="search"]', type: { text: "core", set: setQuery }, hold: 2000 },
    { at: '[data-cue="clear"]', run: () => setQuery(""), hold: 800 },
    { at: '[data-cue="source-0"]', run: () => setSource(0), hold: 1600 },
  ];
  const reset = () => {
    setLevel(0);
    setSource(0);
    setQuery("");
  };

  const rail = labels.levels.map((label, index) => ({
    label,
    icon: icons[["article", "search", "bug", "info", "warning", "error", "stop"][index]],
  }));

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-page lg">
        <Rail label={labels.rail} items={rail} value={level} onChange={setLevel} compact />
        <div className="app-page-main">
          <div className="lg-list" role="log" aria-live="off">
            <AnimatePresence mode="popLayout" initial={false}>
              {rows.map((row) => (
                <motion.div
                  layout="position"
                  key={`${source}-${row.time}-${row.message}`}
                  className="lg-row"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 460, damping: 40 }}
                >
                  <span className="lg-head">
                    <time>
                      <Highlight text={row.time} query={query} />
                    </time>
                    <span className="lg-badge" data-level={row.level}>
                      <Highlight text={row.level} query={query} />
                    </span>
                    {row.target && (
                      <code className="lg-target">
                        <Highlight text={row.target} query={query} />
                      </code>
                    )}
                  </span>
                  <code className="lg-message">
                    <Highlight text={row.message} query={query} />
                  </code>
                </motion.div>
              ))}
            </AnimatePresence>
            {rows.length === 0 && (
              <div className="lg-empty">
                <span>
                  <Icon icon={icons.article} />
                </span>
                <p>{labels.empty}</p>
              </div>
            )}
          </div>

          <div className="app-toolbar">
            <label className="app-search">
              <Icon icon={icons.search} />
              <input
                type="search"
                data-cue="search"
                value={query}
                placeholder={labels.search}
                aria-label={labels.search}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="app-search-clear"
                  data-cue="clear"
                  aria-label={labels.clear}
                  onClick={() => setQuery("")}
                >
                  <Icon icon={icons.close} />
                </button>
              )}
            </label>
            <PillTabs
              cue="source"
              label={labels.sourceLabel}
              options={labels.sources}
              value={source}
              onChange={setSource}
            />
          </div>
        </div>
        <Autoplay script={script} reset={reset} />
      </div>
    </MotionConfig>
  );
}
