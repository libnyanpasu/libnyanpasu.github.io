import { motion } from "motion/react";
import { useId, useState } from "react";
import { Icon, arrowNav, type Icons } from "./ui";

export interface ProfilesLabels {
  steps: string;
  input: string;
  transform: string;
  runtime: string;
  diff: string;
  result: string;
}

type Token = [kind: "c" | "k" | "s" | "n" | "p", text: string];
interface Line {
  mark?: "add" | "del";
  tokens: Token[];
}

const yaml: Line[] = [
  { tokens: [["c", "# profile.yaml"]] },
  {
    tokens: [
      ["k", "mixed-port"],
      ["p", ": "],
      ["n", "7890"],
    ],
  },
  {
    tokens: [
      ["k", "mode"],
      ["p", ": "],
      ["s", "rule"],
    ],
  },
  {
    tokens: [
      ["k", "rules"],
      ["p", ":"],
    ],
  },
  {
    tokens: [
      ["p", "  - "],
      ["s", "MATCH,DIRECT"],
    ],
  },
];

const script: Line[] = [
  { tokens: [["c", "// transform.js"]] },
  {
    tokens: [
      ["n", "function"],
      ["p", " main(config) {"],
    ],
  },
  { tokens: [["p", "  config.rules = ["]] },
  {
    tokens: [
      ["p", "    "],
      ["s", '"DOMAIN-SUFFIX,example.org,PROXY"'],
      ["p", ","],
    ],
  },
  {
    tokens: [
      ["p", "    "],
      ["s", '"MATCH,PROXY"'],
      ["p", ","],
    ],
  },
  { tokens: [["p", "  ];"]] },
  {
    tokens: [
      ["n", "  return"],
      ["p", " config;"],
    ],
  },
  { tokens: [["p", "}"]] },
];

const result: Line[] = [
  { tokens: [["c", "# runtime.yaml"]] },
  {
    tokens: [
      ["k", "rules"],
      ["p", ":"],
    ],
  },
  {
    mark: "del",
    tokens: [
      ["p", "  - "],
      ["s", "MATCH,DIRECT"],
    ],
  },
  {
    mark: "add",
    tokens: [
      ["p", "  - "],
      ["s", "DOMAIN-SUFFIX,example.org,PROXY"],
    ],
  },
  {
    mark: "add",
    tokens: [
      ["p", "  - "],
      ["s", "MATCH,PROXY"],
    ],
  },
];

const sources = [yaml, script, result];
const sublabels = ["YAML", "JS / Lua", "Inspect"];

export default function ProfilesCard({ labels, icons }: { labels: ProfilesLabels; icons: Icons }) {
  const [step, setStep] = useState(2);
  const id = useId();
  const names = [labels.input, labels.transform, labels.runtime];
  const lines = sources[step];

  return (
    <div className="m3f-profiles-body">
      <div className="m3f-steps" role="tablist" aria-label={labels.steps} data-m3f-group>
        {names.map((name, index) => (
          <div className="m3f-step-slot" key={name}>
            {index > 0 && <Icon icon={icons.arrow} className="m3f-step-arrow" />}
            <button
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={step === index}
              aria-controls={`${id}-panel`}
              tabIndex={step === index ? 0 : -1}
              data-m3f-item
              data-changed={index === 1 ? "" : undefined}
              onClick={() => setStep(index)}
              onKeyDown={arrowNav(3, index, setStep)}
            >
              {step === index && (
                <motion.span
                  className="m3f-step-pill"
                  layoutId={`${id}-step`}
                  transition={{ type: "spring", stiffness: 480, damping: 38 }}
                />
              )}
              <span className="m3f-step-index">{index + 1}</span>
              <span className="m3f-step-text">
                <b>{name}</b>
                <small>{sublabels[index]}</small>
              </span>
            </button>
          </div>
        ))}
      </div>

      <div
        className="m3f-code"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${step}`}
        key={step}
      >
        <div className="m3f-code-head">
          <span className="m3f-label">{step === 2 ? labels.diff : labels.result}</span>
          <span className="m3f-code-badge">
            <Icon icon={icons.check} />
            {names[step]}
          </span>
        </div>
        <pre>
          <code>
            {lines.map((line, i) => (
              <motion.span
                className="m3f-code-line"
                data-mark={line.mark}
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.32, ease: [0.2, 0, 0, 1] }}
              >
                <span className="m3f-code-sign" aria-hidden="true">
                  {line.mark === "add" ? "+" : line.mark === "del" ? "−" : ""}
                </span>
                {line.tokens.map(([kind, text], j) => (
                  <span className={`m3f-tok-${kind}`} key={j}>
                    {text}
                  </span>
                ))}
              </motion.span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
