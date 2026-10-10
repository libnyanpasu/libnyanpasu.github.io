import { Dashboard } from "./dashboard";
import { DEMO_CORE_PREVIEW_DATA, type CorePreviewData } from "./core-status";
import { DEMO_METRICS, type MetricPreviewData } from "./metric-card";
import { usePreviewState } from "./state-hook";
import { WindowFrame } from "./window-frame";
import type { PreviewIcons, PreviewLabels } from "./types";
import "./client-preview.css";

export type ClientPreviewProps = {
  labels: PreviewLabels;
  icons: PreviewIcons;
  metrics?: MetricPreviewData[];
  core?: CorePreviewData;
};

export function ClientPreview({
  labels,
  icons,
  metrics = DEMO_METRICS,
  core = DEMO_CORE_PREVIEW_DATA,
}: ClientPreviewProps) {
  const state = usePreviewState();
  return (
    <div className="client-preview" ref={state.rootRef}>
      <WindowFrame labels={labels} icons={icons}>
        <Dashboard labels={labels} icons={icons} state={state} metrics={metrics} core={core} />
      </WindowFrame>
    </div>
  );
}

export { DEMO_CORE_PREVIEW_DATA, DEMO_METRICS };
export type { CorePreviewData, MetricPreviewData };
export { WindowFrame, Dashboard };
export { MetricCard } from "./metric-card";
export { Sparkline } from "./sparkline";
export { ProxyStatus } from "./proxy-status";
export { CoreStatus } from "./core-status";
export { ProxyMode } from "./proxy-mode";
export type { PreviewLabels, PreviewIcons } from "./types";
export default ClientPreview;
