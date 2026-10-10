import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useId, useState } from "react";

interface Widget {
  id: string;
  label: string;
}

export default function HomeWidgetPreview({
  widgets,
  hint,
  emptyLabel,
}: {
  widgets: Widget[];
  hint: string;
  emptyLabel: string;
}) {
  const [selected, setSelected] = useState(widgets.map((widget) => widget.id));
  const hintId = useId();
  return (
    <MotionConfig reducedMotion="user">
      <div className="widget-preview">
        <div className="widget-toolbar" role="group" aria-label={hint} aria-describedby={hintId}>
          {widgets.map((widget) => (
            <button
              key={widget.id}
              type="button"
              aria-pressed={selected.includes(widget.id)}
              onClick={() =>
                setSelected((current) =>
                  current.includes(widget.id)
                    ? current.filter((id) => id !== widget.id)
                    : [...current, widget.id],
                )
              }
            >
              <span aria-hidden="true">{selected.includes(widget.id) ? "−" : "+"}</span>
              {widget.label}
            </button>
          ))}
        </div>
        <div className="widget-canvas">
          <AnimatePresence initial={false} mode="popLayout">
            {selected.map((id) => {
              const widget = widgets.find((item) => item.id === id)!;
              return (
                <motion.div
                  layout
                  key={id}
                  className={`preview-widget preview-widget-${id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  <span className="preview-widget-label">{widget.label}</span>
                  {id === "traffic" ? (
                    <>
                      <span className="preview-widget-value">
                        24.8 <small>MB/s</small>
                      </span>
                      <svg viewBox="0 0 320 80" fill="none" aria-hidden="true">
                        <path d="M0 68L20 60L40 65L60 24L80 37L100 16L120 40L140 32L160 56L180 12L200 28L220 20L240 45L260 38L280 8L300 24L320 18" />
                      </svg>
                    </>
                  ) : id === "connections" ? (
                    <>
                      <span className="preview-widget-value">42</span>
                      <div className="connection-dots" aria-hidden="true">
                        {Array.from({ length: 24 }, (_, i) => (
                          <span key={i} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="preview-widget-value">Mihomo</span>
                      <span className="preview-core-symbol" aria-hidden="true">
                        ✳
                      </span>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {selected.length === 0 && <p className="widget-empty">{emptyLabel}</p>}
        </div>
        <p className="widget-hint" id={hintId}>
          {hint}
        </p>
      </div>
    </MotionConfig>
  );
}
