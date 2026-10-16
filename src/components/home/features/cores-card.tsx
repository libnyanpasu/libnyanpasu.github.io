import { LayoutGroup, MotionConfig, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Autoplay, type Cue } from "./frame";
import { Icon, type Icons } from "./ui";

/**
 * Settings → Clash → Core Manager (core-manager-card.tsx): the core in use on top with its
 * restart control, the other cores below it, and "Check Updates" in the footer. Clicking a core
 * switches to it; a newer version shows as `current → latest` with an update control.
 */

export interface CoresLabels {
  title: string;
  restart: string;
  checkUpdates: string;
  update: string;
  restarting: string;
  loading: string;
}

interface Core {
  id: string;
  name: string;
  version: string;
  latest?: string;
  image: string;
}

const CORES: Core[] = [
  { id: "mihomo-alpha", name: "Mihomo Alpha", version: "alpha-94b13ae", image: "mihomo-96" },
  { id: "clash", name: "Clash Premium", version: "n2023-09-05-gdcc8d87", image: "clash" },
  { id: "mihomo", name: "Mihomo", version: "v1.19.32", image: "mihomo-96" },
  { id: "clash-rs", name: "Clash Rust", version: "0.10.10", image: "clash-rs" },
  {
    id: "clash-rs-alpha",
    name: "Clash Rust Alpha",
    version: "0.10.10-alpha+sha.39282d2",
    image: "clash-rs",
  },
  { id: "meow", name: "Meow", version: "0.22.0", image: "meow" },
  { id: "meow-alpha", name: "Meow Alpha", version: "0.22.0-alpha+5d71564", image: "meow" },
];

// What "Check Updates" finds.
const LATEST: Record<string, string> = {
  "mihomo-alpha": "alpha-c2e81f0",
  "meow-alpha": "0.22.1-alpha+0b2a9e4",
};

function Version({ core }: { core: Core }) {
  if (!core.latest) return <small>{core.version}</small>;
  return (
    <small className="cm-newer">
      {core.version}
      <span aria-hidden="true">→</span>
      <b>{core.latest}</b>
    </small>
  );
}

export default function CoresCard({ labels, icons }: { labels: CoresLabels; icons: Icons }) {
  const [cores, setCores] = useState(CORES);
  const [current, setCurrent] = useState(CORES[0].id);
  const [busy, setBusy] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const run = (id: string, then?: () => void) => {
    if (busy) return;
    setBusy(id);
    later(() => {
      then?.();
      setBusy(null);
    }, 1100);
  };

  const check = () => {
    if (checking) return;
    setChecking(true);
    later(() => {
      setCores((list) => list.map((core) => ({ ...core, latest: LATEST[core.id] })));
      setChecking(false);
    }, 1200);
  };

  const update = (id: string) =>
    run(id, () =>
      setCores((list) =>
        list.map((core) =>
          core.id === id ? { ...core, version: core.latest!, latest: undefined } : core,
        ),
      ),
    );

  // The pretend mouse: check for updates, update a core, switch to another core and back.
  const script: Cue[] = [
    { at: '[data-cue="check"]', run: check, hold: 2200 },
    { at: '[data-cue="update-meow-alpha"]', run: () => update("meow-alpha"), hold: 2000 },
    {
      at: '[data-cue="core-mihomo"]',
      run: () => run("mihomo", () => setCurrent("mihomo")),
      hold: 2400,
    },
    { at: '[data-cue="restart"]', run: () => run("mihomo"), hold: 2000 },
    {
      at: '[data-cue="core-mihomo-alpha"]',
      run: () => run("mihomo-alpha", () => setCurrent("mihomo-alpha")),
      hold: 2400,
    },
  ];
  const reset = () => {
    timers.current.forEach(window.clearTimeout);
    setCores(CORES);
    setCurrent(CORES[0].id);
    setBusy(null);
    setChecking(false);
  };

  const active = cores.find((core) => core.id === current)!;
  const others = cores.filter((core) => core.id !== current);

  return (
    <MotionConfig reducedMotion="user">
      <div className="cm">
        <span className="cm-section">{labels.title}</span>
        <div className="cm-card">
          <LayoutGroup>
            <motion.div layout className="cm-current" data-busy={busy === current || undefined}>
              <motion.img
                layoutId={`cm-${active.id}`}
                src={`/images/core/${active.image}.png`}
                alt=""
                width="48"
                height="48"
              />
              <span className="cm-text">
                <motion.b layoutId={`cm-name-${active.id}`}>{active.name}</motion.b>
                {busy === current ? (
                  <small className="cm-state">{labels.restarting}</small>
                ) : (
                  <Version core={active} />
                )}
              </span>
              {active.latest && (
                <button
                  type="button"
                  className="cm-icon"
                  data-cue={`update-${active.id}`}
                  aria-label={labels.update}
                  title={labels.update}
                  onClick={() => update(active.id)}
                >
                  <Icon icon={icons.update} />
                </button>
              )}
              <button
                type="button"
                className="cm-icon"
                aria-label={labels.restart}
                title={labels.restart}
                data-cue="restart"
                onClick={() => run(current)}
              >
                <Icon icon={icons.restart} className={busy === current ? "m3f-spin" : undefined} />
              </button>
              <span className="cm-progress" aria-hidden="true" />
            </motion.div>

            <div className="cm-grid">
              {others.map((core) => (
                <motion.div
                  layout
                  key={core.id}
                  className="cm-item"
                  data-busy={busy === core.id || undefined}
                >
                  <button
                    type="button"
                    className="cm-item-main"
                    data-cue={`core-${core.id}`}
                    disabled={!!busy}
                    onClick={() => run(core.id, () => setCurrent(core.id))}
                  >
                    <motion.img
                      layoutId={`cm-${core.id}`}
                      src={`/images/core/${core.image}.png`}
                      alt=""
                      width="40"
                      height="40"
                      loading="lazy"
                    />
                    <span className="cm-text">
                      <motion.b layoutId={`cm-name-${core.id}`}>{core.name}</motion.b>
                      {busy === core.id ? (
                        <small className="cm-state">{labels.restarting}</small>
                      ) : (
                        <Version core={core} />
                      )}
                    </span>
                  </button>
                  {core.latest && (
                    <button
                      type="button"
                      className="cm-icon"
                      aria-label={`${labels.update}: ${core.name}`}
                      data-cue={`update-${core.id}`}
                      title={labels.update}
                      onClick={() => update(core.id)}
                    >
                      <Icon icon={icons.update} />
                    </button>
                  )}
                  <span className="cm-progress" aria-hidden="true" />
                </motion.div>
              ))}
            </div>
          </LayoutGroup>
          <div className="cm-footer">
            <button
              type="button"
              className="cm-check"
              data-cue="check"
              onClick={check}
              aria-busy={checking}
            >
              {checking && <Icon icon={icons.sync} className="m3f-spin" />}
              {checking ? labels.loading : labels.checkUpdates}
            </button>
          </div>
        </div>
        <Autoplay script={script} reset={reset} />
      </div>
    </MotionConfig>
  );
}
