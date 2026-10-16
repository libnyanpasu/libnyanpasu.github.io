import { motion } from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Spark } from "./app-ui";
import { Autoplay, useFramePlaying, type Cue } from "./frame";
import FeatureCard from "./feature-card";
import type { SchemePair } from "./material-schemes";
import { Icon, arrowNav, type Icons } from "./ui";

export interface MaterialLabels {
  title: string;
  description: string;
  themeColor: string;
  themeMode: string;
  /** Same order as the client's picker. */
  modes: [dark: string, system: string, light: string];
  app: {
    file: string;
    settings: string;
    help: string;
    nav: string[];
    download: string;
    upload: string;
    memory: string;
    connections: string;
    proxyStatus: string;
    systemProxy: string;
    tunMode: string;
    routingMode: string;
    rule: string;
    global: string;
    direct: string;
    coreStatus: string;
    running: string;
    byService: string;
  };
}

const NAV_ICONS = [
  "dashboard",
  "proxies",
  "grid",
  "code",
  "traffic",
  "rule",
  "terminal",
  "settings",
  "apps",
];

/**
 * Settings → User Interface → Theme Color, applied to the whole card: picking one of the
 * client's preset seeds regenerates the M3 scheme, and the card (controls, the client window
 * and the shader stage) moves to it the way the app does. Dark / System / Light mirrors the
 * picker's mode buttons, where System follows this page.
 */
export default function MaterialCard({
  labels,
  icons,
  schemes,
}: {
  labels: MaterialLabels;
  icons: Icons;
  schemes: Record<string, SchemePair>;
}) {
  const seeds = Object.keys(schemes);
  const [seed, setSeed] = useState(0);
  const [siteDark, setSiteDark] = useState(false);
  // 0 dark, 1 system, 2 light.
  const [mode, setMode] = useState(1);
  // Once the visitor picks a colour or mode, the demo stops choosing for them.
  const [picked, setPicked] = useState(false);
  const groupId = useId();

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setSiteDark(root.dataset.theme === "dark");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const dark = mode === 1 ? siteDark : mode === 0;
  // Until the visitor picks something the card simply inherits the page's own scheme, which
  // also keeps the server-rendered card right in dark mode before hydration.
  const themed = seed !== 0 || mode !== 1;

  const scheme = schemes[seeds[seed]][dark ? "dark" : "light"];
  const role = (name: string) => scheme[`--md-sys-color-${name}`];
  const stage = [
    role("primary-container"),
    role("tertiary-container"),
    role("surface-container-high"),
    role("secondary-container"),
    role("surface-container"),
    role("primary"),
    role("tertiary"),
  ];
  const modeIcons = [icons.dark, icons.brightness, icons.light];

  const controls = (
    <div className="mu-controls">
      <div className="mu-row">
        <span className="mu-label" id={`${groupId}-color`}>
          {labels.themeColor}
        </span>
        <span className="mu-hex">
          <i style={{ background: seeds[seed] }} />
          {seeds[seed]}
        </span>
      </div>
      <div
        className="mu-swatches"
        role="radiogroup"
        aria-labelledby={`${groupId}-color`}
        data-m3f-group
      >
        {seeds.map((color, index) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={seed === index}
            aria-label={color}
            tabIndex={seed === index ? 0 : -1}
            data-m3f-item
            style={{ "--swatch": color } as CSSProperties}
            onClick={() => (setSeed(index), setPicked(true))}
            onKeyDown={arrowNav(seeds.length, index, (next) => (setSeed(next), setPicked(true)))}
          >
            <Icon icon={icons.check} />
          </button>
        ))}
      </div>
      <div className="mu-row">
        <span className="mu-label" id={`${groupId}-mode`}>
          {labels.themeMode}
        </span>
      </div>
      <div
        className="mu-modes"
        role="radiogroup"
        aria-labelledby={`${groupId}-mode`}
        data-m3f-group
      >
        {labels.modes.map((name, index) => (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={mode === index}
            tabIndex={mode === index ? 0 : -1}
            data-m3f-item
            onClick={() => (setMode(index), setPicked(true))}
            onKeyDown={arrowNav(3, index, (next) => (setMode(next), setPicked(true)))}
          >
            {mode === index && (
              <motion.span
                className="mu-modes-pill"
                layoutId={`${groupId}-pill`}
                transition={{ type: "spring", stiffness: 520, damping: 42 }}
              />
            )}
            <Icon icon={modeIcons[index]} />
            <span>{name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <FeatureCard
      name="material"
      tone="primary"
      icon={icons.palette}
      shape={["flower8", "cookie12"]}
      title={labels.title}
      description={labels.description}
      wide
      extra={controls}
      stage={{ colors: stage, shapes: true, seed: 5 }}
      style={
        themed ? ({ ...scheme, colorScheme: dark ? "dark" : "light" } as CSSProperties) : undefined
      }
    >
      <MaterialWindow
        app={labels.app}
        icons={icons}
        onCycle={picked ? undefined : () => setSeed((index) => (index + 1) % seeds.length)}
      />
    </FeatureCard>
  );
}

/**
 * The client's dashboard in miniature, in whatever scheme the card is wearing. While it plays
 * itself the pretend mouse uses the routing and proxy tiles, and `onCycle` moves the card to the
 * next preset seed every few seconds.
 */
function MaterialWindow({
  app,
  icons,
  onCycle,
}: {
  app: MaterialLabels["app"];
  icons: Icons;
  onCycle?: () => void;
}) {
  const [proxy, setProxy] = useState([true, false]);
  const [routing, setRouting] = useState(0);
  const playing = useFramePlaying();
  const cycle = useRef(onCycle);
  cycle.current = onCycle;

  const cycling = !!onCycle;
  useEffect(() => {
    if (!playing || !cycling) return;
    const timer = window.setInterval(() => cycle.current?.(), 3400);
    return () => window.clearInterval(timer);
  }, [playing, cycling]);

  const script: Cue[] = [
    { at: '[data-cue="routing-1"]', run: () => setRouting(1), hold: 2000 },
    { at: '[data-cue="proxy-1"]', run: () => setProxy([true, true]), hold: 1800 },
    { at: '[data-cue="routing-2"]', run: () => setRouting(2), hold: 2000 },
    { at: '[data-cue="proxy-1"]', run: () => setProxy([true, false]), hold: 1400 },
    { at: '[data-cue="routing-0"]', run: () => setRouting(0), hold: 2200 },
  ];

  return (
    <div className="mu-window">
      <div className="mu-titlebar" aria-hidden="true">
        <span className="mu-lights">
          <i />
          <i />
          <i />
        </span>
        <span className="mu-menus">
          <span>{app.file}</span>
          <span>{app.settings}</span>
          <span>{app.help}</span>
        </span>
        <span className="mu-brand">
          <img src="/images/logo.png" alt="" width="14" height="14" />
          Clash Nyanpasu
        </span>
      </div>
      <div className="mu-nav" aria-hidden="true">
        {app.nav.map((name, index) => (
          <span key={name} data-active={index === 0 || undefined}>
            <Icon icon={icons[NAV_ICONS[index]]} />
            {name}
          </span>
        ))}
      </div>
      <div className="mu-body">
        <div className="mu-metric">
          <span className="mu-head">
            <Icon icon={icons.down} />
            {app.download}
          </span>
          <b>18.7 MiB/s</b>
          <Spark values={[3, 6, 4, 9, 7, 12, 9, 15, 11, 17]} className="mu-spark" />
        </div>
        <div className="mu-metric">
          <span className="mu-head">
            <Icon icon={icons.up} />
            {app.upload}
          </span>
          <b>2.4 MiB/s</b>
          <Spark values={[2, 3, 2, 4, 3, 3, 5, 4, 3, 4]} className="mu-spark" />
        </div>
        <div className="mu-metric">
          <span className="mu-head">
            <Icon icon={icons.memory} />
            {app.memory}
          </span>
          <b>30.63 MiB</b>
          <Spark values={[31, 30, 33, 32, 30, 31, 30, 31, 30, 30]} className="mu-spark" />
        </div>
        <div className="mu-metric">
          <span className="mu-head">
            <Icon icon={icons.code} />
            {app.connections}
          </span>
          <b>128</b>
        </div>

        <div className="mu-panel mu-proxy">
          <span className="mu-head">
            <Icon icon={icons.code} />
            {app.proxyStatus}
          </span>
          <span className="mu-tiles">
            {[app.systemProxy, app.tunMode].map((name, index) => (
              <button
                key={name}
                type="button"
                aria-pressed={proxy[index]}
                data-cue={`proxy-${index}`}
                onClick={() => setProxy(proxy.map((v, i) => (i === index ? !v : v)))}
              >
                <Icon icon={index === 0 ? icons.desktop : icons.code} />
                {name}
              </button>
            ))}
          </span>
        </div>
        <div className="mu-panel mu-routing">
          <span className="mu-head">
            <Icon icon={icons.route} />
            {app.routingMode}
          </span>
          <span className="mu-tiles" role="radiogroup" aria-label={app.routingMode}>
            {[app.rule, app.global, app.direct].map((name, index) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={routing === index}
                data-cue={`routing-${index}`}
                onClick={() => setRouting(index)}
              >
                <Icon icon={[icons.route, icons.proxies, icons.outward][index]} />
                {name}
              </button>
            ))}
          </span>
        </div>
        <div className="mu-panel mu-core">
          <span className="mu-head">
            <Icon icon={icons.memory} />
            {app.coreStatus}
            <small>{app.byService}</small>
          </span>
          <span className="mu-core-row">
            <img src="/images/core/mihomo-96.png" alt="" width="28" height="28" />
            <span>
              <b>Mihomo Alpha</b>
              <small>alpha-94b13ae</small>
            </span>
            <em>{app.running}</em>
          </span>
        </div>
      </div>
      <Autoplay script={script} />
    </div>
  );
}
