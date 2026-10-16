import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import { PillTabs, Rail, bytes } from "./app-ui";
import { Autoplay, type Cue } from "./frame";
import { Icon, type IconData, type Icons } from "./ui";

/**
 * The client's Traffic page (pages/(main)/main/topology): stat cards, ranking cards and the
 * "Connection paths" Sankey, with its rail of views and the floating scope / range toolbar.
 * Figures are made up, but shaped like the backend's report.
 */

export interface TrafficLabels {
  rail: string;
  views: [overview: string, paths: string, geography: string, device: string, process: string];
  total: string;
  connections: string;
  processes: string;
  hosts: string;
  topProcesses: string;
  topHosts: string;
  topRegions: string;
  topDevices: string;
  viewAll: string;
  /** `{count}` */
  others: string;
  /** `{count}` */
  connectionCount: string;
  scopeLabel: string;
  scopes: [string, string, string];
  metric: string;
  rangeLabel: string;
  ranges: [string, string, string];
  layers: string;
  limit: string;
  caption: string;
  /** `{filter}` */
  removeFilter: string;
}

interface Row {
  name: string;
  up: number;
  down: number;
  conns: number;
  mono?: boolean;
}

const MiB = 1024 * 1024;
const row = (name: string, up: number, down: number, conns: number, mono = false): Row => ({
  name,
  up: up * MiB,
  down: down * MiB,
  conns,
  mono,
});

// One day of traffic; other ranges and scopes scale it.
const PROCESSES = [
  row("steam", 96, 5104, 212),
  row("Google Chrome", 412, 5088, 1864),
  row("Telegram", 61, 849, 408),
  row("curl", 18, 742, 96),
  row("Safari", 9, 186, 120),
  row("git-remote-https", 6, 92, 38),
];
const HOSTS = [
  row("store.steampowered.com", 88, 4980, 164, true),
  row("objects.githubusercontent.com", 12, 1806, 84, true),
  row("www.google.com", 140, 1210, 702, true),
  row("api.telegram.org", 52, 806, 366, true),
  row("cdn.jsdelivr.net", 4, 380, 141, true),
  row("www.youtube.com", 92, 2260, 230, true),
];
const REGIONS = [
  row("United States", 230, 6540, 1420),
  row("Japan", 196, 3480, 680),
  row("Hong Kong", 84, 1206, 330),
  row("Singapore", 42, 520, 184),
  row("Netherlands", 18, 314, 124),
];
const DEVICES = [
  row("127.0.0.1", 498, 9840, 2310, true),
  row("192.168.1.20", 72, 1630, 330, true),
  row("192.168.1.35", 32, 591, 98, true),
];

const RANGE_SCALE = [1, 6.3, 24.8];
const SCOPE_SCALE = [1, 0.14, 0.86];

function scaled(rows: Row[], range: number, scope: number) {
  const k = RANGE_SCALE[range] * SCOPE_SCALE[scope];
  return rows
    .map((r, i) => {
      // A little drift per range, so the ranking reshuffles like real data would.
      const drift = 1 + 0.22 * Math.sin(i * 1.7 + range * 2.1 + scope);
      return {
        ...r,
        up: r.up * k * drift,
        down: r.down * k * drift,
        conns: Math.max(1, Math.round(r.conns * k * drift)),
      };
    })
    .sort((a, b) => b.up + b.down - (a.up + a.down));
}

// ── Sankey ─────────────────────────────────────────────────────────────────
const FLOWS: [origin: string, rule: string, chain: string, value: number][] = [
  ["steam", "RuleSet(steam)", "Steam", 52],
  ["Google Chrome", "Match", "Selected", 31],
  ["Google Chrome", "RuleSet(developer)", "Developer", 24],
  ["Telegram", "RuleSet(telegramcidr)", "Telegram", 9],
  ["curl", "RuleSet(developer)", "Developer", 7],
  ["Telegram", "Match", "Selected", 2],
  ["curl", "Match", "Selected", 1.5],
];

const SW = 400;
const SH = 168;
const NODE = 8;
const GAP = 8;
const COLS = [0, SW / 2 - NODE / 2, SW - NODE];

interface SNode {
  key: string;
  col: number;
  name: string;
  value: number;
  y: number;
  h: number;
}

function layoutSankey() {
  const columns: Map<string, SNode>[] = [new Map(), new Map(), new Map()];
  for (const flow of FLOWS) {
    flow.slice(0, 3).forEach((name, col) => {
      const key = `${col}:${name}`;
      const node = columns[col].get(key) ?? {
        key,
        col,
        name: name as string,
        value: 0,
        y: 0,
        h: 0,
      };
      node.value += flow[3];
      columns[col].set(key, node);
    });
  }
  const total = FLOWS.reduce((sum, flow) => sum + flow[3], 0);
  const nodes = new Map<string, SNode>();
  columns.forEach((column) => {
    const list = [...column.values()].sort((a, b) => b.value - a.value);
    const scale = (SH - GAP * (list.length - 1)) / total;
    let y = 0;
    for (const node of list) {
      node.y = y;
      node.h = node.value * scale;
      y += node.h + GAP;
      nodes.set(node.key, node);
    }
  });

  // Bands: each flow crosses two gaps; stack them within each node in node order.
  const outOffset = new Map<string, number>();
  const inOffset = new Map<string, number>();
  const bands: { d: string; nodes: string[]; value: number }[] = [];
  const ordered = [...FLOWS].sort((a, b) => {
    const ay = nodes.get(`1:${a[1]}`)!.y + nodes.get(`2:${a[2]}`)!.y / 1000;
    const by = nodes.get(`1:${b[1]}`)!.y + nodes.get(`2:${b[2]}`)!.y / 1000;
    return ay - by;
  });
  for (const flow of ordered) {
    const keys = flow.slice(0, 3).map((name, col) => `${col}:${name}`);
    for (let col = 0; col < 2; col++) {
      const a = nodes.get(keys[col])!;
      const b = nodes.get(keys[col + 1])!;
      const scale = a.h / a.value;
      const h = flow[3] * scale;
      const y0 = a.y + (outOffset.get(a.key) ?? 0);
      const y1 = b.y + (inOffset.get(b.key) ?? 0);
      outOffset.set(a.key, (outOffset.get(a.key) ?? 0) + h);
      inOffset.set(b.key, (inOffset.get(b.key) ?? 0) + h);
      const x0 = COLS[col] + NODE;
      const x1 = COLS[col + 1];
      const xm = (x0 + x1) / 2;
      bands.push({
        d: `M${x0} ${y0}C${xm} ${y0} ${xm} ${y1} ${x1} ${y1}V${y1 + h}C${xm} ${y1 + h} ${xm} ${y0 + h} ${x0} ${y0 + h}Z`,
        nodes: keys,
        value: flow[3],
      });
    }
  }
  return { nodes: [...nodes.values()], bands };
}

function Sankey({
  caption,
  focus,
  setFocus,
}: {
  caption: string;
  focus: string | null;
  setFocus: (key: string | null) => void;
}) {
  const { nodes, bands } = useMemo(layoutSankey, []);
  const [hover, setHover] = useState<string | null>(null);
  const active = hover ?? focus;

  return (
    <div className="tr-sankey">
      <svg viewBox={`-2 -2 ${SW + 4} ${SH + 4}`} role="img" aria-label={caption}>
        <g className="tr-bands">
          {bands.map((band, i) => (
            <path
              key={i}
              d={band.d}
              data-dim={active && !band.nodes.includes(active) ? "" : undefined}
            />
          ))}
        </g>
        {nodes.map((node) => (
          <g
            key={node.key}
            className="tr-node"
            data-col={node.col}
            data-active={active === node.key || undefined}
            data-dim={active && active !== node.key ? "" : undefined}
            tabIndex={0}
            role="button"
            aria-pressed={focus === node.key}
            aria-label={node.name}
            data-cue={`node-${node.key}`}
            onPointerEnter={() => setHover(node.key)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(node.key)}
            onBlur={() => setHover(null)}
            onClick={() => setFocus(focus === node.key ? null : node.key)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              setFocus(focus === node.key ? null : node.key);
            }}
          >
            <rect x={COLS[node.col]} y={node.y} width={NODE} height={Math.max(node.h, 2)} rx={3} />
            <text
              x={node.col === 2 ? COLS[2] - 8 : COLS[node.col] + NODE + 8}
              y={node.y + Math.max(node.h, 2) / 2}
              textAnchor={node.col === 2 ? "end" : "start"}
              dominantBaseline="central"
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>
      <p className="tr-caption">{caption}</p>
    </div>
  );
}

// ── Ranking card ───────────────────────────────────────────────────────────
function Ranking({
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

function Stat({
  icon,
  label,
  value,
  wide,
  children,
}: {
  icon: IconData;
  label: string;
  value: string;
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="tr-stat" data-wide={wide || undefined}>
      <span className="tr-stat-icon">
        <Icon icon={icon} />
      </span>
      <span className="tr-stat-text">
        <small>{label}</small>
        <span className="tr-stat-figure">
          <b>{value}</b>
          {children}
        </span>
      </span>
    </div>
  );
}

export default function TrafficCard({ labels, icons }: { labels: TrafficLabels; icons: Icons }) {
  const [view, setView] = useState(0);
  const [scope, setScope] = useState(0);
  const [range, setRange] = useState(0);
  const [filter, setFilter] = useState<string | null>(null);
  const [node, setNode] = useState<string | null>(null);

  const data = useMemo(
    () => ({
      processes: scaled(PROCESSES, range, scope),
      hosts: scaled(HOSTS, range, scope),
      regions: scaled(REGIONS, range, scope),
      devices: scaled(DEVICES, range, scope),
    }),
    [range, scope],
  );

  const all = [...data.processes];
  const picked = filter ? all.find((r) => r.name === filter) : null;
  const pool = picked ? [picked] : all;
  const up = pool.reduce((sum, r) => sum + r.up, 0);
  const down = pool.reduce((sum, r) => sum + r.down, 0);
  const conns = pool.reduce((sum, r) => sum + r.conns, 0);
  const select = (name: string) => setFilter((current) => (current === name ? null : name));

  // The pretend mouse: filter by a process, narrow the scope and range, follow the paths of a
  // process and a policy, then come back to the overview.
  const script: Cue[] = [
    { at: '[data-cue="row-steam"]', run: () => setFilter("steam"), hold: 2200 },
    { at: '[data-cue="filter"]', run: () => setFilter(null), hold: 900 },
    { at: '[data-cue="scope-1"]', run: () => setScope(1), hold: 1800 },
    { at: '[data-cue="range"]', run: () => setRange(1), hold: 1800 },
    { at: '[data-cue="rail-1"]', run: () => setView(1), hold: 1400 },
    { at: '[data-cue="node-0:Google Chrome"]', run: () => setNode("0:Google Chrome"), hold: 2400 },
    { at: '[data-cue="node-2:Steam"]', run: () => setNode("2:Steam"), hold: 2400 },
    { at: '[data-cue="rail-4"]', run: () => (setNode(null), setView(4)), hold: 2000 },
    { at: '[data-cue="scope-0"]', run: () => setScope(0), hold: 1000 },
    { at: '[data-cue="rail-0"]', run: () => setView(0), hold: 1600 },
  ];
  const reset = () => {
    setView(0);
    setScope(0);
    setRange(0);
    setFilter(null);
    setNode(null);
  };

  const rail = [
    { icon: icons.dashboard, label: labels.views[0] },
    { icon: icons.lan, label: labels.views[1] },
    { icon: icons.proxies, label: labels.views[2] },
    { icon: icons.devices, label: labels.views[3] },
    { icon: icons.apps, label: labels.views[4] },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-page tr">
        <Rail label={labels.rail} items={rail} value={view} onChange={setView} />
        <div className="app-page-main">
          <div className="app-page-head">
            <h4>{labels.views[view]}</h4>
            {view !== 0 && (
              <span className="tr-summary">
                {bytes(up + down)} ·{" "}
                {labels.connectionCount.replace("{count}", conns.toLocaleString())}
              </span>
            )}
            <AnimatePresence>
              {filter && (
                <motion.button
                  type="button"
                  className="tr-filter"
                  data-cue="filter"
                  aria-label={labels.removeFilter.replace("{filter}", filter)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setFilter(null)}
                >
                  {labels.processes}: {filter}
                  <Icon icon={icons.close} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="app-page-scroll">
            {view === 0 && (
              <div className="tr-stats">
                <Stat icon={icons.swap} label={labels.total} value={bytes(up + down)} wide>
                  <span className="tr-stat-split">
                    <span>
                      <i>↑</i>
                      {bytes(up)}
                    </span>
                    <span>
                      <i>↓</i>
                      {bytes(down)}
                    </span>
                  </span>
                </Stat>
                <Stat
                  icon={icons.cable}
                  label={labels.connections}
                  value={conns.toLocaleString()}
                />
                <Stat
                  icon={icons.apps}
                  label={labels.processes}
                  value={String(picked ? 1 : PROCESSES.length)}
                />
              </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                className="tr-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
              >
                {view === 0 && (
                  <div className="tr-overview">
                    <Ranking
                      icon={icons.apps}
                      title={labels.topProcesses}
                      rows={data.processes}
                      limit={3}
                      labels={labels}
                      selected={filter}
                      onSelect={select}
                      onViewAll={() => setView(4)}
                    />
                    <Ranking
                      icon={icons.dns}
                      title={labels.topHosts}
                      rows={data.hosts}
                      limit={3}
                      labels={labels}
                      selected={null}
                      onSelect={() => undefined}
                    />
                  </div>
                )}
                {view === 1 && (
                  <div className="tr-paths">
                    <div className="tr-paths-head">
                      <span>
                        {labels.layers}
                        <Icon icon={icons.dropdown} />
                      </span>
                      <span>
                        {labels.limit}
                        <Icon icon={icons.dropdown} />
                      </span>
                    </div>
                    <Sankey caption={labels.caption} focus={node} setFocus={setNode} />
                  </div>
                )}
                {view === 2 && (
                  <Ranking
                    icon={icons.proxies}
                    title={labels.topRegions}
                    rows={data.regions}
                    limit={4}
                    labels={labels}
                    selected={null}
                    onSelect={() => undefined}
                  />
                )}
                {view === 3 && (
                  <Ranking
                    icon={icons.devices}
                    title={labels.topDevices}
                    rows={data.devices}
                    limit={4}
                    labels={labels}
                    selected={null}
                    onSelect={() => undefined}
                  />
                )}
                {view === 4 && (
                  <Ranking
                    icon={icons.apps}
                    title={labels.topProcesses}
                    rows={data.processes}
                    limit={5}
                    labels={labels}
                    selected={filter}
                    onSelect={select}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="app-toolbar">
            <PillTabs
              cue="scope"
              label={labels.scopeLabel}
              options={labels.scopes}
              value={scope}
              onChange={setScope}
            />
            <div className="app-toolbar-group">
              <span className="app-toolbar-select" aria-hidden="true">
                {labels.metric}
                <Icon icon={icons.dropdown} />
              </span>
              <button
                type="button"
                className="app-toolbar-select"
                data-cue="range"
                aria-label={`${labels.rangeLabel}: ${labels.ranges[range]}`}
                onClick={() => setRange((value) => (value + 1) % labels.ranges.length)}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={range}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {labels.ranges[range]}
                  </motion.span>
                </AnimatePresence>
                <Icon icon={icons.dropdown} />
              </button>
            </div>
          </div>
        </div>
        <Autoplay script={script} reset={reset} />
      </div>
    </MotionConfig>
  );
}
