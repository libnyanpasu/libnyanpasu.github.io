import { useEffect, useId, useRef, useState } from "react";
import { Icon, arrowNav, type Icons } from "./ui";

export interface CoresLabels {
  label: string;
  autoUpdate: string;
  use: string;
  current: string;
  running: string;
  update: string;
}

const CORES = [
  { name: "Mihomo", version: "v1.19.12", image: "/images/core/mihomo.png" },
  { name: "Mihomo Alpha", version: "alpha-5f3c1a2", image: "/images/core/mihomo.png" },
  { name: "Clash Rust", version: "v0.9.3" },
  { name: "Meow", version: "v0.4.0" },
];

export default function CoresCard({ labels, icons }: { labels: CoresLabels; icons: Icons }) {
  const [active, setActive] = useState(0);
  const [pending, setPending] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);
  const [auto, setAuto] = useState(true);
  const switchId = useId();
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const switchTo = (index: number) => {
    if (index === active || pending !== null) return;
    setPending(index);
    later(() => {
      setActive(index);
      setPending(null);
    }, 900);
  };

  const update = () => {
    if (updating) return;
    setUpdating(true);
    later(() => setUpdating(false), 1600);
  };

  return (
    <div className="m3f-cores-body">
      <ul className="m3f-core-list" role="radiogroup" aria-label={labels.label} data-m3f-group>
        {CORES.map((core, index) => {
          const selected = active === index;
          const starting = pending === index;
          return (
            <li
              key={core.name}
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              data-m3f-item
              data-selected={selected ? "" : undefined}
              data-busy={starting || (selected && updating) ? "" : undefined}
              onClick={() => switchTo(index)}
              onKeyDown={(event) => {
                if (event.key === " " || event.key === "Enter") {
                  event.preventDefault();
                  switchTo(index);
                } else arrowNav(CORES.length, index, switchTo)(event);
              }}
            >
              <span className="m3f-core-avatar">
                {core.image ? (
                  <img src={core.image} alt="" width="40" height="40" loading="lazy" />
                ) : (
                  core.name[0]
                )}
              </span>
              <span className="m3f-core-text">
                <b>{core.name}</b>
                <small>{core.version}</small>
              </span>
              {selected ? (
                <>
                  <span className="m3f-chip m3f-chip-assist m3f-chip-status">
                    <i aria-hidden="true" />
                    {labels.running}
                  </span>
                  <button
                    type="button"
                    className="m3f-icon-button"
                    aria-label={labels.update}
                    title={labels.update}
                    onClick={(event) => {
                      event.stopPropagation();
                      update();
                    }}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <Icon icon={icons.sync} className={updating ? "m3f-spin" : undefined} />
                  </button>
                </>
              ) : (
                <span className="m3f-button m3f-button-tonal" aria-hidden="true">
                  {starting ? "…" : labels.use}
                </span>
              )}
              <span className="m3f-linear m3f-linear-indeterminate" aria-hidden="true">
                <i />
              </span>
            </li>
          );
        })}
      </ul>
      <div className="m3f-switch-row">
        <label htmlFor={switchId}>{labels.autoUpdate}</label>
        <button
          id={switchId}
          type="button"
          role="switch"
          className="m3f-switch"
          aria-checked={auto}
          onClick={() => setAuto((value) => !value)}
        >
          <span className="m3f-switch-handle">
            <Icon icon={icons.check} />
          </span>
        </button>
      </div>
    </div>
  );
}
