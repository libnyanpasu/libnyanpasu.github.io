import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";
import { Autoplay, type Cue } from "./frame";
import { Icon, type Icons } from "./ui";
import { INITIAL, ORDER, WIDGETS } from "./dashboard/data";
import { Tile } from "./dashboard/tile";
import type { DashboardLabels, WidgetId } from "./dashboard/types";

export type { DashboardLabels, WidgetId } from "./dashboard/types";

/**
 * The dashboard in edit mode (pages/(main)/main/dashboard): widgets on the grid get a close
 * control, a floating pill offers "Add Widget" and "Save", and the widget library opens as a
 * sheet with search. The sixteen widgets and their sizes follow components/widgets/consts.ts on
 * an eight-column grid.
 */

export default function DashboardCard({
  labels,
  icons,
}: {
  labels: DashboardLabels;
  icons: Icons;
}) {
  const [items, setItems] = useState<WidgetId[]>(INITIAL);
  const [editing, setEditing] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [query, setQuery] = useState("");
  const [proxy, setProxy] = useState<[boolean, boolean]>([true, false]);
  const [mode, setMode] = useState(0);

  const q = query.trim().toLowerCase();
  const library = ORDER.filter((id) => !q || labels.widgets[id].toLowerCase().includes(q));
  const add = (id: WidgetId) => {
    setItems((list) => (list.includes(id) ? list : [...list, id]));
    setSheet(false);
    setQuery("");
  };

  // The pretend mouse: flip a proxy toggle, add two widgets from the library (one found by
  // search), use the new one, drop another, then save the layout.
  const script: Cue[] = [
    { at: '[data-cue="toggle-1"]', run: () => setProxy([true, true]), hold: 1200 },
    { at: '[data-cue="add"]', run: () => setSheet(true), hold: 800 },
    {
      at: '[data-cue="search"]',
      type: { text: labels.widgets.recent, set: setQuery },
      hold: 900,
    },
    { at: '[data-cue="add-recent"]', run: () => add("recent"), hold: 1600 },
    { at: '[data-cue="add"]', run: () => setSheet(true), hold: 700 },
    { at: '[data-cue="add-mode"]', run: () => add("mode"), hold: 1600 },
    { at: '[data-cue="mode-1"]', run: () => setMode(1), hold: 1400 },
    {
      at: '[data-cue="close-connections"]',
      run: () => setItems((list) => list.filter((item) => item !== "connections")),
      hold: 1400,
    },
    { at: '[data-cue="save"]', run: () => setEditing(false), hold: 2600 },
    { at: '[data-cue="edit"]', run: () => setEditing(true), hold: 1000 },
  ];
  const reset = () => {
    setItems(INITIAL);
    setEditing(true);
    setSheet(false);
    setQuery("");
    setProxy([true, false]);
    setMode(0);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="db" data-editing={editing || undefined}>
        <motion.div layout className="db-grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((id) => (
              <motion.div
                layout
                key={id}
                className="db-tile"
                data-visual={WIDGETS[id].visual}
                style={{
                  gridColumn: `span ${WIDGETS[id].w}`,
                  gridRow: `span ${WIDGETS[id].h}`,
                }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              >
                <Tile
                  id={id}
                  labels={labels}
                  icons={icons}
                  proxy={proxy}
                  setProxy={setProxy}
                  mode={mode}
                  setMode={setMode}
                />
                <AnimatePresence>
                  {editing && (
                    <motion.button
                      type="button"
                      className="db-close"
                      data-cue={`close-${id}`}
                      aria-label={`${labels.remove}: ${labels.widgets[id]}`}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      onClick={() => setItems((list) => list.filter((item) => item !== id))}
                    >
                      <Icon icon={icons.close} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {editing ? (
            <motion.div
              key="edit"
              className="db-pill"
              initial={{ opacity: 0, scale: 0.8, y: 48 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 48 }}
              transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            >
              <button
                type="button"
                className="db-pill-raised"
                data-cue="add"
                onClick={() => setSheet(true)}
              >
                <Icon icon={icons.add} />
                {labels.addWidget}
              </button>
              <button
                type="button"
                className="db-pill-flat"
                data-cue="save"
                onClick={() => setEditing(false)}
              >
                <Icon icon={icons.check} />
                {labels.save}
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="view"
              type="button"
              className="db-pill db-pill-edit"
              data-cue="edit"
              initial={{ opacity: 0, scale: 0.8, y: 48 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 48 }}
              transition={{ type: "spring", bounce: 0, duration: 0.45 }}
              onClick={() => setEditing(true)}
            >
              <Icon icon={icons.edit} />
              {labels.edit}
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {sheet && (
            <motion.div
              className="db-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheet(false)}
            >
              <motion.div
                className="db-sheet"
                role="dialog"
                aria-label={labels.addWidget}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 40 }}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.key === "Escape" && setSheet(false)}
              >
                <span className="db-handle" aria-hidden="true" />
                <div className="db-sheet-head">
                  <b>{labels.addWidget}</b>
                  <button
                    type="button"
                    className="db-icon"
                    aria-label={labels.closeLibrary}
                    onClick={() => setSheet(false)}
                  >
                    <Icon icon={icons.close} />
                  </button>
                </div>
                <label className="app-search">
                  <Icon icon={icons.search} />
                  <input
                    type="search"
                    data-cue="search"
                    value={query}
                    placeholder={labels.search}
                    aria-label={labels.search}
                    autoComplete="off"
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <div className="db-library">
                  {library.map((id) => {
                    const added = items.includes(id);
                    return (
                      <div key={id} className="db-entry" data-added={added || undefined}>
                        <Icon icon={icons[WIDGETS[id].icon]} />
                        <span>{labels.widgets[id]}</span>
                        <small>
                          {WIDGETS[id].w}×{WIDGETS[id].h}
                        </small>
                        <button
                          type="button"
                          className="db-icon db-add"
                          data-cue={`add-${id}`}
                          disabled={added}
                          aria-label={`${labels.addWidget}: ${labels.widgets[id]}`}
                          onClick={() => add(id)}
                        >
                          <Icon icon={added ? icons.check : icons.add} />
                        </button>
                      </div>
                    );
                  })}
                  {library.length === 0 && <p className="db-empty">{labels.noResults}</p>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <Autoplay script={script} reset={reset} />
      </div>
    </MotionConfig>
  );
}
