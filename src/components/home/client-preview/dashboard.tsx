import { CoreStatus, DEMO_CORE_PREVIEW_DATA, type CorePreviewData } from "./core-status";
import { ActiveConnections, SubscriptionQuota } from "./extra-widgets";
import { DEMO_METRICS, MetricCard, type MetricPreviewData } from "./metric-card";
import { ProxyMode } from "./proxy-mode";
import { ProxyStatus } from "./proxy-status";
import type { PreviewState } from "./state-hook";
import type { PreviewIcons, PreviewLabels } from "./types";

export function Dashboard({
  labels,
  icons,
  state,
  metrics = DEMO_METRICS,
  core = DEMO_CORE_PREVIEW_DATA,
}: {
  labels: PreviewLabels;
  icons: PreviewIcons;
  state: PreviewState;
  metrics?: MetricPreviewData[];
  core?: CorePreviewData;
}) {
  return (
    <div className="cp-dashboard">
      <div className="cp-metrics-grid">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            index={index}
            frame={state.frame}
            icons={icons}
            reduceMotion={state.reduceMotion}
            totalLabel={labels.total}
            labels={labels}
          />
        ))}
      </div>
      <div className="cp-feature-grid">
        <ProxyStatus
          labels={labels}
          icons={icons}
          systemProxy={state.systemProxy}
          tunMode={state.tunMode}
          onSystemProxyChange={state.setSystemProxy}
          onTunModeChange={state.setTunMode}
          reduceMotion={state.reduceMotion}
        />
        <ProxyMode
          labels={labels}
          icons={icons}
          value={state.proxyMode}
          onChange={state.setProxyMode}
          reduceMotion={state.reduceMotion}
        />
        <CoreStatus labels={labels} icons={icons} core={core} />
      </div>
      <div className="cp-feature-grid">
        <ActiveConnections labels={labels} icons={icons} frame={state.frame} />
        <SubscriptionQuota labels={labels} icons={icons} />
      </div>
    </div>
  );
}
