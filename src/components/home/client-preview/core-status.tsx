import { PreviewIcon } from "./icon";
import type { PreviewIcons, PreviewLabels } from "./types";

export type CorePreviewData = {
  name: string;
  version: string;
  iconSrc: string;
  running: boolean;
  execution: "service" | "child-process";
  serviceStatus: "running" | "stopped" | "not-installed";
  channel: string;
};

export const DEMO_CORE_PREVIEW_DATA: CorePreviewData = {
  name: "Mihomo",
  version: "v1.19.32",
  iconSrc: "/images/core/mihomo.png",
  running: true,
  execution: "child-process",
  serviceStatus: "running",
  channel: "IPC · Unix Socket",
};

export function CoreStatus({
  labels,
  icons,
  core = DEMO_CORE_PREVIEW_DATA,
}: {
  labels: PreviewLabels;
  icons: PreviewIcons;
  core?: CorePreviewData;
}) {
  const executionLabel =
    core.execution === "service" ? labels.runningByService : labels.runningByChildProcess;
  return (
    <section className="cp-card cp-feature-card cp-core-card">
      <div className="cp-feature-heading">
        <h2>
          <PreviewIcon icons={icons} name="cpu" />
          {labels.coreStatus}
        </h2>
        <span className="cp-status-chip cp-core-state" data-running={core.running}>
          {core.running ? executionLabel : labels.stopped}
        </span>
      </div>
      <article
        className="cp-core-panel"
        aria-label={`${labels.coreStatus}: ${core.name}, ${core.running ? labels.running : labels.stopped}, ${core.serviceStatus === "running" ? labels.serviceRunning : core.serviceStatus === "stopped" ? labels.serviceStopped : labels.serviceNotInstalled}`}
      >
        <span className="cp-core-mark">
          <img src={core.iconSrc} alt="" />
        </span>
        <span className="cp-core-info">
          <strong>{core.name}</strong>
          <span>{core.version}</span>
        </span>
        <span className="cp-core-running" data-running={core.running}>
          <i aria-hidden="true" />
          {core.running ? labels.running : labels.stopped}
        </span>
        <span className="cp-core-channel">
          <span>{labels.controlChannel}</span>
          <strong>{core.channel}</strong>
          <PreviewIcon icons={icons} name="chevron" />
        </span>
      </article>
    </section>
  );
}
