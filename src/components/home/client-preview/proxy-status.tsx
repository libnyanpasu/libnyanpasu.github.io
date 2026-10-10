import { motion } from "motion/react";
import { PreviewIcon } from "./icon";
import { ShapeIcon } from "./shape-icon";
import type { PreviewIcons, PreviewLabels } from "./types";

export function ProxyStatus({
  labels,
  icons,
  systemProxy,
  tunMode,
  onSystemProxyChange,
  onTunModeChange,
  reduceMotion = false,
}: {
  labels: PreviewLabels;
  icons: PreviewIcons;
  systemProxy: boolean;
  tunMode: boolean;
  onSystemProxyChange: (enabled: boolean) => void;
  onTunModeChange: (enabled: boolean) => void;
  reduceMotion?: boolean;
}) {
  const status = tunMode ? labels.tunMode : systemProxy ? labels.systemProxy : labels.proxyDisabled;
  const toggles = [
    {
      key: "system",
      label: labels.systemProxy,
      icon: "system-proxy",
      plainIcon: "network",
      active: systemProxy,
      onChange: onSystemProxyChange,
    },
    {
      key: "tun",
      label: labels.tunMode,
      icon: "unplug",
      plainIcon: "unplug",
      active: tunMode,
      onChange: onTunModeChange,
    },
  ];

  return (
    <section className="cp-card cp-feature-card cp-proxy-card">
      <div className="cp-feature-heading">
        <h2>
          <PreviewIcon icons={icons} name="unplug" />
          {labels.proxyStatus}
        </h2>
        <span
          className="cp-status-chip cp-proxy-state"
          data-state={tunMode ? "tun" : systemProxy ? "system" : "off"}
        >
          {status}
        </span>
      </div>
      <div className="cp-tiles">
        {toggles.map((toggle) => (
          <motion.button
            key={toggle.key}
            type="button"
            className="cp-tile"
            data-active={toggle.active}
            role="switch"
            aria-checked={toggle.active}
            onClick={() => toggle.onChange(!toggle.active)}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            {toggle.active && <PreviewIcon icons={icons} name="check" className="cp-tile-check" />}
            <ShapeIcon icons={icons} name={toggle.icon} active={toggle.active} />
            <span className="cp-tile-label">{toggle.label}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
