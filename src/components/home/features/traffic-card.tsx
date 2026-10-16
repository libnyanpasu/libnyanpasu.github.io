import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useMemo, useState } from "react";
import { PillTabs, Rail, bytes } from "./app-ui";
import { Autoplay, type Cue } from "./frame";
import { Icon, type Icons } from "./ui";
import { DEVICES, HOSTS, PROCESSES, REGIONS, scaled } from "./traffic/data";
import { Ranking } from "./traffic/ranking";
import { Sankey } from "./traffic/sankey";
import { Stat } from "./traffic/stat";
import type { TrafficLabels } from "./traffic/types";

export type { TrafficLabels } from "./traffic/types";

/**
 * The client's Traffic page (pages/(main)/main/topology): stat cards, ranking cards and the
 * "Connection paths" Sankey, with its rail of views and the floating scope / range toolbar.
 * Figures are made up, but shaped like the backend's report.
 */

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
