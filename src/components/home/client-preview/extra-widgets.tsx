import { motion } from "motion/react";
import { PreviewIcon } from "./icon";
import { revealMotion } from "./reveal";
import type { PreviewIcons, PreviewLabels } from "./types";

/**
 * The third dashboard row: two more of the client's widgets, Active connections
 * (widget-active-connections.tsx) and Service status & quota (widget-subscription-quota.tsx).
 * Connection rates move with the preview's frame counter, like the sparklines above.
 */

const CONNECTIONS = [
  { host: "objects.githubusercontent.com", chain: "Developer · JP IEPL 01", down: 12.4, up: 0.3 },
  { host: "store.steampowered.com", chain: "Steam · DIRECT", down: 6.8, up: 0.1 },
];

function rate(value: number) {
  return value >= 1 ? `${value.toFixed(1)} MiB/s` : `${Math.round(value * 1024)} KiB/s`;
}

export function ActiveConnections({
  labels,
  icons,
  frame,
  reduceMotion = false,
  revealIndex = 0,
}: {
  labels: PreviewLabels;
  icons: PreviewIcons;
  frame: number;
  reduceMotion?: boolean;
  revealIndex?: number;
}) {
  return (
    <motion.section
      className="cp-card cp-feature-card cp-connections-card"
      {...revealMotion(revealIndex, reduceMotion)}
    >
      <div className="cp-feature-heading">
        <h2>
          <PreviewIcon icons={icons} name="network" />
          {labels.activeConnections}
        </h2>
        <span className="cp-count">27</span>
      </div>
      <ul className="cp-connection-list">
        {CONNECTIONS.map((item, index) => {
          const wobble = 0.75 + 0.25 * Math.abs(Math.sin(frame * 0.9 + index * 1.7));
          return (
            <li key={item.host}>
              <span className="cp-connection-mark">
                <PreviewIcon icons={icons} name="global" />
              </span>
              <span className="cp-connection-text">
                <strong>{item.host}</strong>
                <span>{item.chain}</span>
              </span>
              <span className="cp-connection-rate">
                <span>↓ {rate(item.down * wobble)}</span>
                <span>↑ {rate(item.up * wobble)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}

export function SubscriptionQuota({
  labels,
  icons,
  reduceMotion = false,
  revealIndex = 0,
}: {
  labels: PreviewLabels;
  icons: PreviewIcons;
  reduceMotion?: boolean;
  revealIndex?: number;
}) {
  return (
    <motion.section
      className="cp-card cp-feature-card cp-quota-card"
      {...revealMotion(revealIndex, reduceMotion)}
    >
      <svg
        className="cp-quota-wave"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 40 Q25 34 50 40 T100 40 T150 40 T200 40 T250 40 T300 40 T350 40 T400 40 V100 H0Z" />
        <path d="M0 44 Q25 50 50 44 T100 44 T150 44 T200 44 T250 44 T300 44 T350 44 T400 44 V100 H0Z" />
      </svg>
      <div className="cp-feature-heading">
        <h2>
          <PreviewIcon icons={icons} name="quota" />
          {labels.quotaTitle}
        </h2>
      </div>
      <strong className="cp-quota-percent">60%</strong>
      <span className="cp-quota-summary">
        240.28 GiB {labels.quotaRemaining.replace("{total}", "400 GiB")}
      </span>
    </motion.section>
  );
}
