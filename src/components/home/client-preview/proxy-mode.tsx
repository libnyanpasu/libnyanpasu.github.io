import { motion } from "motion/react";
import { PreviewIcon } from "./icon";
import { ShapeIcon } from "./shape-icon";
import type { PreviewIcons, PreviewLabels } from "./types";

const modes = ["rule", "global", "direct"] as const;

export function ProxyMode({
  labels,
  icons,
  value,
  onChange,
  reduceMotion = false,
}: {
  labels: PreviewLabels;
  icons: PreviewIcons;
  value: "rule" | "global" | "direct";
  onChange: (mode: "rule" | "global" | "direct") => void;
  reduceMotion?: boolean;
}) {
  return (
    <section className="cp-card cp-feature-card cp-mode-card">
      <div className="cp-feature-heading">
        <h2>
          <PreviewIcon icons={icons} name="mode" />
          {labels.proxyMode}
        </h2>
      </div>
      <div className="cp-tiles" role="group" aria-label={labels.proxyMode}>
        {modes.map((mode) => (
          <motion.button
            key={mode}
            type="button"
            className="cp-tile cp-mode-tile"
            data-active={value === mode}
            aria-pressed={value === mode}
            onClick={() => onChange(mode)}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            {value === mode && <PreviewIcon icons={icons} name="check" className="cp-tile-check" />}
            <ShapeIcon icons={icons} name={mode} active={value === mode} />
            <span className="cp-tile-label">{labels[mode]}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
