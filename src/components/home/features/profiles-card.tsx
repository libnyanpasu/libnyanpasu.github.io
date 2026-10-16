import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";
import { PillTabs, Switch } from "./app-ui";
import { Autoplay, type Cue } from "./frame";
import { Icon, type Icons } from "./ui";

/**
 * The client's Profile Inspect page (pages/(main)/main/profiles/inspect): every step of the
 * processing chain as a list or a chain, and for the selected one its changed fields and its
 * output as YAML, as a diff against the step before, or as the step's logs.
 * The steps and what they change follow the backend executor (nyanpasu-config runtime).
 */

export interface ProfilesLabels {
  /** `{core}`, `{revision}` */
  applied: string;
  stepsLabel: string;
  list: string;
  chain: string;
  showAll: string;
  changedFields: string;
  noBaseline: string;
  noChanges: string;
  yaml: string;
  diff: string;
  logs: string;
  noLogs: string;
  /** `{step}` */
  relative: string;
  independent: string;
  steps: {
    file: string;
    scoped: string;
    filter: string;
    overrides: string;
    includeAll: string;
    builtin: string;
    finalize: string;
    core: string;
  };
  profile: string;
}

type Kind = keyof ProfilesLabels["steps"];
type DiffLine = [old: number | null, next: number | null, text: string];

interface Step {
  kind: Kind;
  /** Profile chips after the label: the script, then the profile it is scoped to. */
  chips?: string[];
  fields: string[];
  more?: number;
  yaml: string[];
  hunk?: string;
  diff?: DiffLine[];
  logs?: string[];
}

const STEPS: Step[] = [
  {
    kind: "file",
    chips: ["profile"],
    fields: [],
    yaml: [
      "mixed-port: 7890",
      "allow-lan: true",
      "mode: rule",
      "log-level: debug",
      "external-controller: 127.0.0.1:9090",
      "proxy-groups:",
      "  - name: Proxies",
      "    type: select",
    ],
  },
  {
    kind: "scoped",
    chips: ["useself", "profile"],
    fields: [
      "proxy-groups.0.name",
      "proxy-groups.0.proxies.0",
      "proxy-groups.0.proxies.1",
      "proxy-groups.0.proxies.2",
    ],
    more: 2012,
    yaml: [
      "proxy-groups:",
      "  - name: Selected",
      "    type: select",
      "    proxies:",
      "      - Auto",
      "      - HK IEPL 01",
      "      - JP IEPL 01",
    ],
    hunk: "@@ -847,9 +847,8 @@",
    diff: [
      [847, 847, "   udp: true"],
      [848, 848, " proxy-groups:"],
      [849, null, "-  - name: Proxies"],
      [null, 849, "+  - name: Selected"],
      [850, 850, "     type: select"],
      [851, 851, "     proxies:"],
      [852, null, "-      - HK"],
      [853, null, "-      - JP"],
      [null, 852, "+      - Auto"],
      [null, 853, "+      - HK IEPL 01"],
    ],
    logs: [
      "[log] renamed group Proxies -> Selected",
      "[log] 2014 nodes regrouped by region",
      "[info] script finished in 18 ms",
    ],
  },
  {
    kind: "filter",
    fields: ["external-controller-tls", "experimental"],
    yaml: ["mixed-port: 7890", "allow-lan: true", "mode: rule", "log-level: debug"],
    hunk: "@@ -4,7 +4,4 @@",
    diff: [
      [4, 4, " log-level: debug"],
      [5, 5, " external-controller: 127.0.0.1:9090"],
      [6, null, "-external-controller-tls: 127.0.0.1:9443"],
      [7, null, "-experimental:"],
      [8, null, "-  quic-go-disable-gso: true"],
      [9, 6, " proxies:"],
    ],
  },
  {
    kind: "overrides",
    fields: ["allow-lan", "log-level", "external-controller"],
    yaml: ["mixed-port: 7890", "allow-lan: false", "mode: rule", "log-level: info"],
    hunk: "@@ -1,5 +1,5 @@",
    diff: [
      [1, 1, " mixed-port: 7890"],
      [2, null, "-allow-lan: true"],
      [null, 2, "+allow-lan: false"],
      [3, 3, " mode: rule"],
      [4, null, "-log-level: debug"],
      [null, 4, "+log-level: info"],
      [5, null, "-external-controller: 127.0.0.1:9090"],
      [null, 5, "+external-controller: 127.0.0.1:17650"],
    ],
  },
  { kind: "includeAll", fields: [], yaml: [] },
  { kind: "builtin", fields: [], yaml: [] },
  { kind: "builtin", fields: [], yaml: [] },
  { kind: "builtin", fields: [], yaml: [] },
  {
    kind: "finalize",
    fields: ["profile", "profile.store-selected", "profile.store-fake-ip"],
    yaml: ["profile:", "  store-selected: true", "  store-fake-ip: false"],
    hunk: "@@ -2291,3 +2291,6 @@",
    diff: [
      [2291, 2291, "   - GEOIP,CN,DIRECT"],
      [2292, 2292, "   - MATCH,Selected"],
      [null, 2293, "+profile:"],
      [null, 2294, "+  store-selected: true"],
      [null, 2295, "+  store-fake-ip: false"],
    ],
  },
  {
    kind: "core",
    fields: ["external-controller-unix"],
    yaml: ["external-controller-unix: mihomo.sock"],
    hunk: "@@ -5,1 +5,2 @@",
    diff: [
      [5, 5, " external-controller: 127.0.0.1:17650"],
      [null, 6, "+external-controller-unix: mihomo.sock"],
    ],
  },
];

const changed = (step: Step) => step.fields.length > 0 || !!step.logs;

function Chips({ step, labels }: { step: Step; labels: ProfilesLabels }) {
  if (!step.chips) return null;
  return (
    <>
      {" · "}
      {step.chips.map((chip, i) => (
        <span key={chip} className="pi-chip-wrap">
          {i > 0 && <span className="pi-arrow">→</span>}
          <span className="pi-chip">{chip === "profile" ? labels.profile : chip}</span>
        </span>
      ))}
    </>
  );
}

export default function ProfilesCard({ labels, icons }: { labels: ProfilesLabels; icons: Icons }) {
  const [mode, setMode] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(1);
  const [view, setView] = useState(1);

  // The pretend mouse: read a script's logs and diff, open the finalize step's YAML, follow the
  // chain view back to the source file, then expand the full process chain.
  const script: Cue[] = [
    { at: '[data-cue="out-2"]', run: () => setView(2), hold: 2000 },
    { at: '[data-cue="out-1"]', run: () => setView(1), hold: 2200 },
    { at: '[data-cue="step-3"]', run: () => setSelected(3), hold: 2200 },
    { at: '[data-cue="step-8"]', run: () => setSelected(8), hold: 1800 },
    { at: '[data-cue="out-0"]', run: () => setView(0), hold: 1800 },
    { at: '[data-cue="steps-1"]', run: () => setMode(1), hold: 1400 },
    { at: '[data-cue="step-0"]', run: () => setSelected(0), hold: 2000 },
    { at: '[data-cue="steps-0"]', run: () => setMode(0), hold: 1000 },
    { at: '[data-cue="show-all"]', run: () => setShowAll(true), hold: 2200 },
    { at: '[data-cue="show-all"]', run: () => setShowAll(false), hold: 1000 },
  ];
  const reset = () => {
    setMode(0);
    setShowAll(false);
    setSelected(1);
    setView(1);
  };

  // The list keeps steps that changed something or logged; the chain keeps every step.
  const visible = STEPS.map((step, index) => ({ step, index })).filter(
    ({ step }) => showAll || mode === 1 || changed(step),
  );
  const step = STEPS[selected];
  let previous = selected - 1;
  while (previous > 0 && !changed(STEPS[previous])) previous--;
  const name = (s: Step) => labels.steps[s.kind];

  return (
    <MotionConfig reducedMotion="user">
      <div className="pi">
        <p className="pi-meta">
          {labels.applied.replace("{core}", "mihomo").replace("{revision}", "8")}
        </p>
        <div className="pi-grid">
          <div className="pi-steps">
            <PillTabs
              cue="steps"
              label={labels.stepsLabel}
              options={[labels.list, labels.chain]}
              value={mode}
              onChange={setMode}
            />
            {mode === 0 && (
              <label className="pi-toggle">
                {labels.showAll}
                <Switch
                  checked={showAll}
                  onChange={setShowAll}
                  label={labels.showAll}
                  check={icons.check}
                  cue="show-all"
                />
              </label>
            )}
            <nav
              className="pi-list"
              data-mode={mode === 1 ? "chain" : "list"}
              aria-label={labels.stepsLabel}
            >
              <AnimatePresence initial={false}>
                {visible.map(({ step: s, index }) => (
                  <motion.button
                    key={index}
                    type="button"
                    layout="position"
                    className="pi-step"
                    aria-current={selected === index ? "step" : undefined}
                    data-quiet={!changed(s) || undefined}
                    data-cue={`step-${index}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", stiffness: 460, damping: 40 }}
                    onClick={() => setSelected(index)}
                  >
                    <span className="pi-step-index">
                      {mode === 1 ? index + 1 : `#${index + 1}`}
                    </span>
                    <span className="pi-step-label">
                      {name(s)}
                      <Chips step={s} labels={labels} />
                    </span>
                    {s.logs && mode === 0 && <Icon icon={icons.article} className="pi-step-log" />}
                  </motion.button>
                ))}
              </AnimatePresence>
            </nav>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected}
              className="pi-detail"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            >
              <h4>
                #{selected + 1} {name(step)}
                <Chips step={step} labels={labels} />
              </h4>
              <div className="pi-fields">
                <span>{labels.changedFields}</span>
                {step.fields.length === 0 ? (
                  <span className="pi-none">
                    {step.kind === "file" ? labels.noBaseline : labels.noChanges}
                  </span>
                ) : (
                  <>
                    {step.fields.map((field) => (
                      <code key={field}>{field}</code>
                    ))}
                    {step.more && <span className="pi-more">+{step.more}</span>}
                  </>
                )}
              </div>

              <PillTabs
                cue="out"
                label={labels.stepsLabel}
                options={[labels.yaml, labels.diff, labels.logs]}
                value={view}
                onChange={setView}
              />

              <div className="pi-output">
                {view === 0 && (
                  <pre className="pi-code">
                    {(step.yaml.length ? step.yaml : ["{}"]).map((line, i) => (
                      <span key={i}>
                        <i>{i + 1}</i>
                        {line}
                      </span>
                    ))}
                  </pre>
                )}
                {view === 1 &&
                  (step.diff ? (
                    <>
                      <p className="pi-note">
                        {labels.relative.replace("{step}", String(previous + 1))}
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
                      {step.kind === "file" ? labels.independent : labels.noChanges}
                    </p>
                  ))}
                {view === 2 &&
                  (step.logs ? (
                    <pre className="pi-code pi-logs">
                      {step.logs.map((line, i) => (
                        <span key={i}>{line}</span>
                      ))}
                    </pre>
                  ) : (
                    <p className="pi-note">{labels.noLogs}</p>
                  ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Autoplay script={script} reset={reset} />
    </MotionConfig>
  );
}
