import { motion } from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import ClientPreview from "../client-preview";
import type { PreviewIcons, PreviewLabels } from "../client-preview/types";
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
}

/**
 * Settings → User Interface → Theme Color, applied to the whole card: picking one of the
 * client's preset seeds regenerates the M3 scheme, and the card (controls, the client window
 * and the shader stage) moves to it the way the app does. The window is the hero's client
 * preview itself, only recoloured from the card's scheme. Dark / System / Light mirrors the
 * picker's mode buttons, where System follows this page.
 */
export default function MaterialCard({
  labels,
  icons,
  schemes,
  preview,
}: {
  labels: MaterialLabels;
  icons: Icons;
  schemes: Record<string, SchemePair>;
  preview: { labels: PreviewLabels; icons: PreviewIcons };
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
        preview={preview}
        onCycle={picked ? undefined : () => setSeed((index) => (index + 1) % seeds.length)}
      />
    </FeatureCard>
  );
}

/**
 * The hero's client preview in whatever scheme the card is wearing. While it plays itself the
 * pretend mouse uses the proxy and routing tiles, and `onCycle` moves the card to the next preset
 * seed every few seconds.
 */
function MaterialWindow({
  preview,
  onCycle,
}: {
  preview: { labels: PreviewLabels; icons: PreviewIcons };
  onCycle?: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const playing = useFramePlaying();
  const cycle = useRef(onCycle);
  cycle.current = onCycle;

  const cycling = !!onCycle;
  useEffect(() => {
    if (!playing || !cycling) return;
    const timer = window.setInterval(() => cycle.current?.(), 3400);
    return () => window.clearInterval(timer);
  }, [playing, cycling]);

  // The tiles are the preview's own buttons, so a cue just presses them.
  const press = (selector: string) => () =>
    root.current?.querySelector<HTMLElement>(selector)?.click();
  const mode = (index: number) => `.cp-mode-card .cp-tile:nth-child(${index})`;
  const toggle = (index: number) => `.cp-proxy-card .cp-tile:nth-child(${index})`;
  const script: Cue[] = [
    { at: mode(2), run: press(mode(2)), hold: 2000 },
    { at: toggle(2), run: press(toggle(2)), hold: 1800 },
    { at: mode(3), run: press(mode(3)), hold: 2000 },
    { at: toggle(2), run: press(toggle(2)), hold: 1400 },
    { at: mode(1), run: press(mode(1)), hold: 2200 },
  ];

  return (
    <div ref={root}>
      <ClientPreview labels={preview.labels} icons={preview.icons} scheme="material" />
      <Autoplay script={script} />
    </div>
  );
}
