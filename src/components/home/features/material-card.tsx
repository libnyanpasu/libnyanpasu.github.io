import { useEffect, useState, type CSSProperties } from "react";
import FeatureCard from "./feature-card";
import type { SchemePair } from "./material-schemes";
import { Icon, Segmented, arrowNav, type Icons } from "./ui";

export interface MaterialLabels {
  title: string;
  description: string;
  pick: string;
  mode: string;
  light: string;
  dark: string;
  appName: string;
  running: string;
  traffic: string;
  proxies: string;
  settings: string;
}

/**
 * The Material You feature is itself themed: picking a seed re-generates the M3 scheme and the
 * whole card (controls, mock window and shader stage) moves to it, the way the app does.
 */
export default function MaterialCard({
  labels,
  icons,
  schemes,
  delay,
}: {
  labels: MaterialLabels;
  icons: Icons;
  schemes: Record<string, SchemePair>;
  delay?: number;
}) {
  const seeds = Object.keys(schemes);
  const [seed, setSeed] = useState(0);
  const [siteDark, setSiteDark] = useState(false);
  const [mode, setMode] = useState<boolean | null>(null);

  useEffect(() => {
    // Start from the site's own scheme and follow it; the segmented control can override.
    const root = document.documentElement;
    const sync = () => {
      setSiteDark(root.dataset.theme === "dark");
      setMode(null);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const dark = mode ?? siteDark;
  // Until the visitor picks something the card simply inherits the page's own scheme, which
  // also keeps the server-rendered card right in dark mode before hydration.
  const themed = seed !== 0 || mode !== null;

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
  const modes = [labels.light, labels.dark];

  const controls = (
    <div className="m3f-material-controls">
      <div className="m3f-group">
        <span className="m3f-label" id="m3f-seed-label">
          {labels.pick}
        </span>
        <div
          className="m3f-swatches"
          role="radiogroup"
          aria-labelledby="m3f-seed-label"
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
              onClick={() => setSeed(index)}
              onKeyDown={arrowNav(seeds.length, index, setSeed)}
            >
              <Icon icon={icons.check} />
            </button>
          ))}
        </div>
      </div>
      <Segmented
        label={labels.mode}
        options={modes}
        value={dark ? 1 : 0}
        onChange={(index) => setMode(index === 1)}
        check={icons.check}
      />
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
      delay={delay}
      style={
        themed ? ({ ...scheme, colorScheme: dark ? "dark" : "light" } as CSSProperties) : undefined
      }
    >
      <div className="m3f-mini" aria-hidden="true">
        <div className="m3f-mini-rail">
          <span className="m3f-mini-fab">
            <Icon icon={icons.bolt} />
          </span>
          <span data-active>
            <Icon icon={icons.dashboard} />
          </span>
          <span>
            <Icon icon={icons.proxies} />
          </span>
          <span>
            <Icon icon={icons.settings} />
          </span>
        </div>
        <div className="m3f-mini-main">
          <div className="m3f-mini-bar">
            <b>{labels.appName}</b>
            <span className="m3f-mini-switch">
              <i />
            </span>
          </div>
          <div className="m3f-mini-hero">
            <span>{labels.running}</span>
            <strong>Mihomo</strong>
          </div>
          <div className="m3f-mini-row">
            <div className="m3f-mini-tile m3f-mini-secondary">
              <small>{labels.traffic}</small>
              <i />
            </div>
            <div className="m3f-mini-tile m3f-mini-tertiary">
              <small>{labels.proxies}</small>
              <i />
            </div>
          </div>
          <div className="m3f-mini-actions">
            <span className="m3f-mini-btn">{labels.settings}</span>
            <span className="m3f-mini-btn m3f-mini-btn-tonal" />
          </div>
        </div>
      </div>
    </FeatureCard>
  );
}
