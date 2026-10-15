import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useId, useState } from "react";
import { Icon, type Icons } from "./ui";

export interface DashboardLabels {
  hint: string;
  empty: string;
  traffic: string;
  connections: string;
  core: string;
  running: string;
  upload: string;
  download: string;
}

const spring = { type: "spring", stiffness: 420, damping: 36, mass: 0.9 } as const;

function Sparkline() {
  return (
    <svg className="m3f-spark" viewBox="0 0 160 48" preserveAspectRatio="none" aria-hidden="true">
      <path
        className="m3f-spark-fill"
        d="M0 38C14 36 20 20 36 24S60 42 76 30 100 6 118 14 146 26 160 10V48H0Z"
      />
      <path
        className="m3f-spark-line"
        d="M0 38C14 36 20 20 36 24S60 42 76 30 100 6 118 14 146 26 160 10"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function DashboardCard({
  labels,
  icons,
}: {
  labels: DashboardLabels;
  icons: Icons;
}) {
  const ids = ["traffic", "connections", "core"] as const;
  const names = { traffic: labels.traffic, connections: labels.connections, core: labels.core };
  const [selected, setSelected] = useState<string[]>([...ids]);
  const hintId = useId();

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <MotionConfig reducedMotion="user" transition={spring}>
      <div className="m3f-dash-body">
        <div
          className="m3f-chip-row"
          role="group"
          aria-label={labels.hint}
          aria-describedby={hintId}
        >
          {ids.map((id) => (
            <button
              key={id}
              type="button"
              className="m3f-chip m3f-chip-filter"
              aria-pressed={selected.includes(id)}
              onClick={() => toggle(id)}
            >
              <Icon icon={icons.check} className="m3f-chip-check" />
              {names[id]}
            </button>
          ))}
        </div>
        <p id={hintId} className="m3f-hint">
          {labels.hint}
        </p>

        <motion.div layout className="m3f-dash-canvas">
          <AnimatePresence mode="popLayout" initial={false}>
            {ids
              .filter((id) => selected.includes(id))
              .map((id) => (
                <motion.div
                  layout
                  key={id}
                  className={`m3f-tile m3f-tile-${id}`}
                  initial={{ opacity: 0, scale: 0.86 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.86 }}
                >
                  <span className="m3f-tile-label">{names[id]}</span>
                  {id === "traffic" && (
                    <>
                      <div className="m3f-tile-rates">
                        <span>
                          <Icon icon={icons.up} />
                          2.4 <small>MB/s</small>
                        </span>
                        <span>
                          <Icon icon={icons.down} />
                          18.7 <small>MB/s</small>
                        </span>
                      </div>
                      <Sparkline />
                    </>
                  )}
                  {id === "connections" && (
                    <>
                      <strong className="m3f-tile-value">128</strong>
                      <span className="m3f-bars" aria-hidden="true">
                        {[40, 64, 52, 82, 70, 96, 58].map((h, i) => (
                          <i key={i} style={{ blockSize: `${h}%` }} />
                        ))}
                      </span>
                    </>
                  )}
                  {id === "core" && (
                    <>
                      <strong className="m3f-tile-value">Mihomo</strong>
                      <span className="m3f-status">
                        <i />
                        {labels.running}
                      </span>
                    </>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>
          {selected.length === 0 && <p className="m3f-empty">{labels.empty}</p>}
        </motion.div>
      </div>
    </MotionConfig>
  );
}
