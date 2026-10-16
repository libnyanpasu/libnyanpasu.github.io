import { Spark } from "../app-ui";
import { Icon, type Icons } from "../ui";
import { ROWS, SERIES, WIDGETS } from "./data";
import type { DashboardLabels, WidgetId } from "./types";

export function Tile({
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
