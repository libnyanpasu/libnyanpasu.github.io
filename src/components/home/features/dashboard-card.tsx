import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";
import { Spark } from "./app-ui";
import { Autoplay, type Cue } from "./frame";
import { Icon, type Icons } from "./ui";

/**
 * The dashboard in edit mode (pages/(main)/main/dashboard): widgets on the grid get a close
 * control, a floating pill offers "Add Widget" and "Save", and the widget library opens as a
 * sheet with search. The sixteen widgets and their sizes follow components/widgets/consts.ts on
 * an eight-column grid.
 */

export type WidgetId =
  | "down"
  | "up"
  | "memory"
  | "connections"
  | "proxy"
  | "core"
  | "mode"
  | "quota"
  | "schedule"
  | "recent"
  | "process"
  | "exit"
  | "target"
  | "rule"
  | "active"
  | "providers";

export interface DashboardLabels {
  widgets: Record<WidgetId, string>;
  addWidget: string;
  save: string;
  edit: string;
  search: string;
  closeLibrary: string;
  remove: string;
  noResults: string;
  /** `{value}` */
  total: string;
  systemProxy: string;
  tunMode: string;
  modes: [rule: string, global: string, direct: string];
  running: string;
  profile: string;
}

type Visual = "rate" | "spark" | "count" | "proxy" | "core" | "mode" | "quota" | "bars" | "rows";

const WIDGETS: Record<WidgetId, { w: number; h: number; icon: string; visual: Visual }> = {
  down: { w: 2, h: 2, icon: "down", visual: "rate" },
  up: { w: 2, h: 2, icon: "up", visual: "rate" },
  memory: { w: 2, h: 2, icon: "memory", visual: "spark" },
  connections: { w: 2, h: 2, icon: "code", visual: "count" },
  proxy: { w: 4, h: 2, icon: "code", visual: "proxy" },
  core: { w: 4, h: 2, icon: "memory", visual: "core" },
  mode: { w: 4, h: 2, icon: "route", visual: "mode" },
  quota: { w: 4, h: 2, icon: "cloud", visual: "quota" },
  schedule: { w: 4, h: 2, icon: "schedule", visual: "rows" },
  recent: { w: 4, h: 2, icon: "traffic", visual: "bars" },
  process: { w: 4, h: 3, icon: "apps", visual: "rows" },
  exit: { w: 4, h: 3, icon: "split", visual: "rows" },
  target: { w: 4, h: 3, icon: "dns", visual: "rows" },
  rule: { w: 4, h: 3, icon: "rule", visual: "rows" },
  active: { w: 8, h: 2, icon: "cable", visual: "rows" },
  providers: { w: 4, h: 2, icon: "grid", visual: "rows" },
};

const ORDER = Object.keys(WIDGETS) as WidgetId[];
const INITIAL: WidgetId[] = ["down", "up", "memory", "connections", "proxy", "core"];

const ROWS: Partial<Record<WidgetId, [string, string][]>> = {
  schedule: [
    ["profile", "6 h"],
    ["Local", "—"],
  ],
  process: [
    ["Google Chrome", "5.37 GiB"],
    ["steam", "4.97 GiB"],
    ["Telegram", "910 MiB"],
  ],
  exit: [
    ["JP IEPL 01", "6.12 GiB"],
    ["HK IEPL 02", "2.40 GiB"],
    ["DIRECT", "1.08 GiB"],
  ],
  target: [
    ["store.steampowered.com", "4.95 GiB"],
    ["www.youtube.com", "2.30 GiB"],
    ["api.github.com", "412 MiB"],
  ],
  rule: [
    ["RuleSet(steam)", "5.06 GiB"],
    ["Match", "3.14 GiB"],
    ["RuleSet(developer)", "2.21 GiB"],
  ],
  active: [
    ["objects.githubusercontent.com", "↓ 12.4 MiB/s"],
    ["api.telegram.org", "↓ 96 KiB/s"],
  ],
  providers: [
    ["steam", "2 h"],
    ["developer", "2 h"],
  ],
};

const SERIES: Partial<Record<WidgetId, number[]>> = {
  down: [3, 5, 4, 8, 6, 11, 9, 14, 10, 16, 12, 18],
  up: [2, 2, 3, 2, 4, 3, 3, 5, 4, 3, 5, 4],
  memory: [30, 31, 31, 34, 33, 32, 30, 31, 31, 30, 31, 30],
};

function Tile({
  id,
  labels,
  icons,
  proxy,
  setProxy,
  mode,
  setMode,
}: {
  id: WidgetId;
  labels: DashboardLabels;
  icons: Icons;
  proxy: [boolean, boolean];
  setProxy: (value: [boolean, boolean]) => void;
  mode: number;
  setMode: (value: number) => void;
}) {
  const def = WIDGETS[id];
  const title = labels.widgets[id];
  const head = (
    <span className="db-title">
      <Icon icon={icons[def.icon]} />
      <span>{title}</span>
    </span>
  );

  switch (def.visual) {
    case "rate":
      return (
        <>
          {head}
          <b className="db-metric">{id === "down" ? "18.7 MiB/s" : "2.4 MiB/s"}</b>
          <small className="db-meta">
            {labels.total.replace("{value}", id === "down" ? "12.31 GiB" : "618.6 MiB")}
          </small>
          <Spark values={SERIES[id]!} className="db-spark" />
        </>
      );
    case "spark":
      return (
        <>
          {head}
          <b className="db-metric">30.63 MiB</b>
          <Spark values={SERIES[id]!} className="db-spark" />
        </>
      );
    case "count":
      return (
        <>
          {head}
          <b className="db-metric">128</b>
        </>
      );
    case "proxy":
      return (
        <>
          {head}
          <span className="db-toggles">
            {[labels.systemProxy, labels.tunMode].map((name, index) => (
              <button
                key={name}
                type="button"
                aria-pressed={proxy[index]}
                data-cue={`toggle-${index}`}
                onClick={() =>
                  setProxy(proxy.map((v, i) => (i === index ? !v : v)) as [boolean, boolean])
                }
              >
                <Icon icon={index === 0 ? icons.desktop : icons.code} />
                {name}
              </button>
            ))}
          </span>
        </>
      );
    case "mode":
      return (
        <>
          {head}
          <span className="db-toggles" role="radiogroup" aria-label={title}>
            {labels.modes.map((name, index) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={mode === index}
                data-cue={`mode-${index}`}
                onClick={() => setMode(index)}
              >
                <Icon icon={[icons.route, icons.proxies, icons.outward][index]} />
                {name}
              </button>
            ))}
          </span>
        </>
      );
    case "core":
      return (
        <>
          {head}
          <span className="db-core">
            <img src="/images/core/mihomo-96.png" alt="" width="32" height="32" loading="lazy" />
            <span>
              <b>Mihomo Alpha</b>
              <small>alpha-94b13ae</small>
            </span>
            <span className="db-running">{labels.running}</span>
          </span>
        </>
      );
    case "quota":
      return (
        <>
          {head}
          <b className="db-metric">240.28 GiB</b>
          <span className="db-quota">
            <i style={{ inlineSize: "60%" }} />
          </span>
        </>
      );
    case "bars":
      return (
        <>
          {head}
          <span className="db-bars" aria-hidden="true">
            {[22, 38, 30, 56, 44, 70, 52, 88, 64, 48, 76, 60].map((v, i) => (
              <i key={i} style={{ blockSize: `${v}%` }} />
            ))}
          </span>
        </>
      );
    case "rows":
      return (
        <>
          {head}
          <span className="db-rows">
            {ROWS[id]!.map(([name, value]) => (
              <span key={name}>
                <span>{name === "profile" ? labels.profile : name}</span>
                <b>{value}</b>
              </span>
            ))}
          </span>
        </>
      );
  }
}

export default function DashboardCard({
  labels,
  icons,
}: {
  labels: DashboardLabels;
  icons: Icons;
}) {
  const [items, setItems] = useState<WidgetId[]>(INITIAL);
  const [editing, setEditing] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [query, setQuery] = useState("");
  const [proxy, setProxy] = useState<[boolean, boolean]>([true, false]);
  const [mode, setMode] = useState(0);

  const q = query.trim().toLowerCase();
  const library = ORDER.filter((id) => !q || labels.widgets[id].toLowerCase().includes(q));
  const add = (id: WidgetId) => {
    setItems((list) => (list.includes(id) ? list : [...list, id]));
    setSheet(false);
    setQuery("");
  };

  // The pretend mouse: flip a proxy toggle, add two widgets from the library (one found by
  // search), use the new one, drop another, then save the layout.
  const script: Cue[] = [
    { at: '[data-cue="toggle-1"]', run: () => setProxy([true, true]), hold: 1200 },
    { at: '[data-cue="add"]', run: () => setSheet(true), hold: 800 },
    {
      at: '[data-cue="search"]',
      type: { text: labels.widgets.recent, set: setQuery },
      hold: 900,
    },
    { at: '[data-cue="add-recent"]', run: () => add("recent"), hold: 1600 },
    { at: '[data-cue="add"]', run: () => setSheet(true), hold: 700 },
    { at: '[data-cue="add-mode"]', run: () => add("mode"), hold: 1600 },
    { at: '[data-cue="mode-1"]', run: () => setMode(1), hold: 1400 },
    {
      at: '[data-cue="close-connections"]',
      run: () => setItems((list) => list.filter((item) => item !== "connections")),
      hold: 1400,
    },
    { at: '[data-cue="save"]', run: () => setEditing(false), hold: 2600 },
    { at: '[data-cue="edit"]', run: () => setEditing(true), hold: 1000 },
  ];
  const reset = () => {
    setItems(INITIAL);
    setEditing(true);
    setSheet(false);
    setQuery("");
    setProxy([true, false]);
    setMode(0);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="db" data-editing={editing || undefined}>
        <motion.div layout className="db-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((id) => (
              <motion.div
                layout
                key={id}
                className="db-tile"
                data-visual={WIDGETS[id].visual}
                style={{
                  gridColumn: `span ${WIDGETS[id].w}`,
                  gridRow: `span ${WIDGETS[id].h}`,
                }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              >
                <Tile
                  id={id}
                  labels={labels}
                  icons={icons}
                  proxy={proxy}
                  setProxy={setProxy}
                  mode={mode}
                  setMode={setMode}
                />
                <AnimatePresence>
                  {editing && (
                    <motion.button
                      type="button"
                      className="db-close"
                      data-cue={`close-${id}`}
                      aria-label={`${labels.remove}: ${labels.widgets[id]}`}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      onClick={() => setItems((list) => list.filter((item) => item !== id))}
                    >
                      <Icon icon={icons.close} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {editing ? (
            <motion.div
              key="edit"
              className="db-pill"
              initial={{ opacity: 0, scale: 0.8, y: 48 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 48 }}
              transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            >
              <button
                type="button"
                className="db-pill-raised"
                data-cue="add"
                onClick={() => setSheet(true)}
              >
                <Icon icon={icons.add} />
                {labels.addWidget}
              </button>
              <button
                type="button"
                className="db-pill-flat"
                data-cue="save"
                onClick={() => setEditing(false)}
              >
                <Icon icon={icons.check} />
                {labels.save}
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="view"
              type="button"
              className="db-pill db-pill-edit"
              data-cue="edit"
              initial={{ opacity: 0, scale: 0.8, y: 48 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 48 }}
              transition={{ type: "spring", bounce: 0, duration: 0.45 }}
              onClick={() => setEditing(true)}
            >
              <Icon icon={icons.edit} />
              {labels.edit}
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {sheet && (
            <motion.div
              className="db-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheet(false)}
            >
              <motion.div
                className="db-sheet"
                role="dialog"
                aria-label={labels.addWidget}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 40 }}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.key === "Escape" && setSheet(false)}
              >
                <span className="db-handle" aria-hidden="true" />
                <div className="db-sheet-head">
                  <b>{labels.addWidget}</b>
                  <button
                    type="button"
                    className="db-icon"
                    aria-label={labels.closeLibrary}
                    onClick={() => setSheet(false)}
                  >
                    <Icon icon={icons.close} />
                  </button>
                </div>
                <label className="app-search">
                  <Icon icon={icons.search} />
                  <input
                    type="search"
                    data-cue="search"
                    value={query}
                    placeholder={labels.search}
                    aria-label={labels.search}
                    autoComplete="off"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <div className="db-library">
                  {library.map((id) => {
                    const added = items.includes(id);
                    return (
                      <div key={id} className="db-entry" data-added={added || undefined}>
                        <Icon icon={icons[WIDGETS[id].icon]} />
                        <span>{labels.widgets[id]}</span>
                        <small>
                          {WIDGETS[id].w}×{WIDGETS[id].h}
                        </small>
                        <button
                          type="button"
                          className="db-icon db-add"
                          data-cue={`add-${id}`}
                          disabled={added}
                          aria-label={`${labels.addWidget}: ${labels.widgets[id]}`}
                          onClick={() => add(id)}
                        >
                          <Icon icon={added ? icons.check : icons.add} />
                        </button>
                      </div>
                    );
                  })}
                  {library.length === 0 && <p className="db-empty">{labels.noResults}</p>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <Autoplay script={script} reset={reset} />
      </div>
    </MotionConfig>
  );
}
