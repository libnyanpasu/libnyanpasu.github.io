import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Fragment, useState } from "react";
import { PillTabs, Switch } from "./app-ui";
import { Autoplay, type Cue } from "./frame";
import { Icon, arrowNav, type Icons } from "./ui";
import { FINAL, STEPS, changedCount, outputOf, worthListing } from "./profiles/steps";
import type { ProfilesLabels, Stage, Status, Step } from "./profiles/types";

export type { ProfilesLabels } from "./profiles/types";

/**
 * The client's Profile Inspect page (pages/(main)/main/profiles/inspect): the toolbar with the
 * snapshot, the list or graph of steps and a search over the changed fields; the step rail with
 * its branch gutter (lane-gutter.tsx), grouped by stage; and for the chosen step its changes
 * against the step before, its output as YAML, or its logs. The final configuration opens in
 * Output, every other step in Changes, as in step-detail.tsx. The steps and what they change
 * follow the backend executor (nyanpasu-config runtime).
 */

const STAGES: Stage[] = ["source", "profile", "global", "nyanpasu", "result"];
const STATUS_ICON: Record<Status, string> = {
  start: "statusStart",
  changed: "statusChanged",
  unchanged: "statusUnchanged",
  final: "star",
  core: "statusCore",
};

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, key) => String(values[key] ?? match));

/** The client's outlined segmented button, without a moving indicator. */
function Segmented({
  label,
  options,
  value,
  onChange,
  cue,
}: {
  label: string;
  options: React.ReactNode[];
  value: number;
  onChange: (index: number) => void;
  cue: string;
}) {
  return (
    <div className="pi-seg" role="radiogroup" aria-label={label} data-m3f-group>
      {options.map((option, index) => (
        <button
          key={index}
          type="button"
          role="radio"
          aria-checked={value === index}
          tabIndex={value === index ? 0 : -1}
          data-m3f-item
          data-cue={`${cue}-${index}`}
          onClick={() => onChange(index)}
          onKeyDown={arrowNav(options.length, index, onChange)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default function ProfilesCard({ labels, icons }: { labels: ProfilesLabels; icons: Icons }) {
  const [source, setSource] = useState(0);
  const [mode, setMode] = useState(0);
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(FINAL);
  const [chosen, setChosen] = useState<{ step: number; tab: number }>();

  // The pretend mouse: read a script's changes and logs, open the final config's output, follow
  // the graph back to the profile file, switch snapshots, then narrow the list to the steps that
  // changed something.
  const script: Cue[] = [
    { at: '[data-cue="step-1"]', run: () => setSelected(1), hold: 2200 },
    { at: '[data-cue="out-2"]', run: () => setChosen({ step: 1, tab: 2 }), hold: 2000 },
    { at: '[data-cue="step-8"]', run: () => setSelected(FINAL), hold: 2200 },
    { at: '[data-cue="mode-1"]', run: () => setMode(1), hold: 1400 },
    { at: '[data-cue="step-0"]', run: () => setSelected(0), hold: 1800 },
    { at: '[data-cue="mode-0"]', run: () => setMode(0), hold: 800 },
    { at: '[data-cue="source-1"]', run: () => chooseSource(1), hold: 1600 },
    { at: '[data-cue="source-0"]', run: () => chooseSource(0), hold: 800 },
    { at: '[data-cue="only-changed"]', run: () => setOnlyChanged(true), hold: 2200 },
    { at: '[data-cue="only-changed"]', run: () => setOnlyChanged(false), hold: 1000 },
  ];
  const reset = () => {
    setSource(0);
    setMode(0);
    setOnlyChanged(false);
    setQuery("");
    setSelected(FINAL);
    setChosen(undefined);
  };

  // Both snapshots are the same build here, so the switch only starts over at the final config.
  const chooseSource = (index: number) => {
    setSource(index);
    setSelected(FINAL);
  };

  const needle = query.trim().toLowerCase();
  const matches = (step: Step) =>
    needle !== "" && step.fields.some((field) => field.toLowerCase().includes(needle));

  const headline = (step: Step) =>
    step.name ?? (step.kind === "file" ? labels.profile : labels.steps[step.kind].title);
  const sub = (step: Step) =>
    step.position
      ? fill(labels.subPosition, {
          type: labels.steps[step.kind].sub,
          n: step.position[0],
          total: step.position[1],
        })
      : step.kind === "scoped"
        ? labels.scriptType
        : labels.steps[step.kind].sub;
  const plural = (count: number, one: string, many: string) =>
    fill(count === 1 ? one : many, { count });
  const meta = (step: Step) =>
    matches(step)
      ? labels.stepMatches
      : step.status === "final"
        ? undefined
        : step.status === "start"
          ? labels.stepStart
          : changedCount(step) > 0
            ? plural(changedCount(step), labels.fieldsOne, labels.fieldsMany)
            : labels.stepUnchanged;

  // The graph keeps every step; the list can narrow to those worth reading.
  const visible = STEPS.map((step, index) => ({ step, index })).filter(
    ({ step }) => !onlyChanged || mode === 1 || worthListing(step, selected),
  );
  const first = visible[0]?.index;
  const last = visible[visible.length - 1]?.index;

  const step = STEPS[selected];
  const tab = chosen?.step === selected ? chosen.tab : selected === FINAL ? 1 : 0;
  const count = changedCount(step);

  const entry = ({ step: s, index }: { step: Step; index: number }) => {
    const rowMeta = meta(s);
    return (
      <motion.button
        key={index}
        type="button"
        layout="position"
        className="pi-step"
        aria-current={selected === index ? "step" : undefined}
        data-status={s.status}
        data-dimmed={needle && !matches(s) ? "" : undefined}
        data-first={index === first || undefined}
        data-last={index === last || undefined}
        data-cue={`step-${index}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ type: "spring", stiffness: 460, damping: 40 }}
        onClick={() => setSelected(index)}
      >
        {mode === 1 ? (
          <span className="pi-step-index" aria-hidden="true">
            {index + 1}
          </span>
        ) : (
          <Icon icon={icons[STATUS_ICON[s.status]]} className="pi-status" />
        )}
        <span className="pi-step-label">
          <strong>{headline(s)}</strong>
          <small>{sub(s)}</small>
        </span>
        {rowMeta && mode === 0 && <span className="pi-step-meta">{rowMeta}</span>}
      </motion.button>
    );
  };

  const diffParent = STEPS[selected - 1] && headline(STEPS[selected - 1]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="pi">
        <div className="pi-bar">
          <Segmented
            cue="source"
            label={labels.snapshotLabel}
            options={[labels.latest, labels.appliedToCore]}
            value={source}
            onChange={chooseSource}
          />
          <Segmented
            cue="mode"
            label={labels.viewLabel}
            options={[
              <span key="list" role="img" aria-label={labels.list} title={labels.list}>
                <Icon icon={icons.list} className="pi-view" />
              </span>,
              <span key="graph" role="img" aria-label={labels.graph} title={labels.graph}>
                <Icon icon={icons.profiles} className="pi-view" />
              </span>,
            ]}
            value={mode}
            onChange={setMode}
          />
          <p className="pi-status-chip">
            <Icon icon={icons.check} className="pi-status-check" />
            <span>
              {labels.statusApplied} · mihomo · {labels.revision} 1
            </span>
          </p>
          <label className="pi-search">
            <Icon icon={icons.search} className="pi-view" />
            <input
              type="search"
              value={query}
              placeholder={labels.findPlaceholder}
              aria-label={labels.findPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="pi-grid">
          <div className="pi-steps">
            <nav
              className="pi-list"
              data-mode={mode === 1 ? "graph" : "list"}
              aria-label={labels.stepsLabel}
            >
              <AnimatePresence initial={false}>
                {mode === 1
                  ? visible.map(entry)
                  : STAGES.map((stage) => {
                      const rows = visible.filter(({ step: s }) => s.stage === stage);
                      return (
                        rows.length > 0 && (
                          <Fragment key={stage}>
                            <h5 className="pi-stage">{labels.stages[stage]}</h5>
                            <div className="pi-group">{rows.map(entry)}</div>
                          </Fragment>
                        )
                      );
                    })}
              </AnimatePresence>
            </nav>
            <label className="pi-toggle">
              {labels.onlyChanged}
              <Switch
                checked={onlyChanged}
                onChange={setOnlyChanged}
                label={labels.onlyChanged}
                check={icons.check}
                cue="only-changed"
              />
            </label>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={selected}
              className="pi-detail"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            >
              <header className="pi-head">
                <p className="pi-eyebrow">
                  {fill(labels.position, {
                    stage: labels.stages[step.stage],
                    n: selected + 1,
                    total: STEPS.length,
                  })}
                </p>
                <h4>{headline(step)}</h4>
                <div className="pi-tabs">
                  <PillTabs
                    cue="out"
                    label={labels.stepsLabel}
                    options={[
                      labels.changes,
                      labels.output,
                      step.logs ? fill(labels.logsCount, { count: step.logs.length }) : labels.logs,
                    ]}
                    value={tab}
                    onChange={(next) => setChosen({ step: selected, tab: next })}
                  />
                  <span className="pi-summary">
                    {count > 0 ? plural(count, labels.summaryOne, labels.summaryMany) : sub(step)}
                  </span>
                </div>
                {tab === 0 && count > 0 && (
                  <div className="pi-fields">
                    {step.fields.map((field) => (
                      <code key={field}>{field}</code>
                    ))}
                    {count > step.fields.length && (
                      <span className="pi-more">+{count - step.fields.length}</span>
                    )}
                  </div>
                )}
              </header>

              <div className="pi-panel" data-tab={tab}>
                {tab === 0 &&
                  (step.diff ? (
                    <>
                      <p className="pi-note">
                        {fill(labels.diffDescription, { step: diffParent ?? "" })}
                      </p>
                      <pre className="pi-code pi-diff">
                        <span className="pi-hunk">{step.hunk}</span>
                        {step.diff.map(([old, next, text], i) => (
                          <span
                            key={i}
                            data-mark={
                              text[0] === "+" ? "add" : text[0] === "-" ? "del" : undefined
                            }
                          >
                            <i>{old ?? ""}</i>
                            <i>{next ?? ""}</i>
                            {text}
                          </span>
                        ))}
                      </pre>
                    </>
                  ) : (
                    <p className="pi-note">
                      {step.status === "final"
                        ? labels.noteFinal
                        : step.status === "core"
                          ? labels.noteCore
                          : step.status === "start"
                            ? labels.diffIndependent
                            : labels.noteUnchanged}
                    </p>
                  ))}
                {tab === 1 && (
                  <pre className="pi-code">
                    {outputOf(selected).map((line, i) => (
                      <span key={i}>
                        <i>{i + 1}</i>
                        {line}
                      </span>
                    ))}
                  </pre>
                )}
                {tab === 2 &&
                  (step.logs ? (
                    <ol className="pi-logs">
                      {step.logs.map((log, i) => (
                        <li key={i}>
                          <b data-level={log.level}>{log.level}</b>
                          <span>{log.message}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="pi-note">{labels.noLogs}</p>
                  ))}
              </div>
            </motion.section>
          </AnimatePresence>
        </div>
      </div>
      <Autoplay script={script} reset={reset} />
    </MotionConfig>
  );
}
