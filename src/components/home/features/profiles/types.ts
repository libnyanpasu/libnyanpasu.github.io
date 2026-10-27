/** The order of the stages in the rail, as in the client's inspect-steps.ts. */
export type Stage = "source" | "profile" | "global" | "nyanpasu" | "result";

export type Status = "start" | "changed" | "unchanged" | "final" | "core";

export type Kind =
  | "file"
  | "scoped"
  | "filter"
  | "keep"
  | "overrides"
  | "defaults"
  | "builtin"
  | "finalize"
  | "core";

export interface ProfilesLabels {
  stepsLabel: string;
  snapshotLabel: string;
  latest: string;
  appliedToCore: string;
  viewLabel: string;
  list: string;
  graph: string;
  /** Status chip: `{status} · {core} · {revision} {n}` */
  statusApplied: string;
  revision: string;
  findPlaceholder: string;
  onlyChanged: string;
  stages: Record<Stage, string>;
  /** `{stage}`, `{n}`, `{total}` */
  position: string;
  stepStart: string;
  stepUnchanged: string;
  stepMatches: string;
  /** `{count}`; the one form and the other form of the plural. */
  fieldsOne: string;
  fieldsMany: string;
  summaryOne: string;
  summaryMany: string;
  /** `{type}`, `{n}`, `{total}` */
  subPosition: string;
  changes: string;
  output: string;
  logs: string;
  /** `{count}` */
  logsCount: string;
  noLogs: string;
  /** `{step}` */
  diffDescription: string;
  diffIndependent: string;
  noteUnchanged: string;
  noteFinal: string;
  noteCore: string;
  /** Each kind's headline (when the step has no name of its own) and its line below. */
  steps: Record<Kind, { title: string; sub: string }>;
  /** The profile's name: the file step is headed by it. */
  profile: string;
  /** What kind a script is, such as `JavaScript`. */
  scriptType: string;
}

export interface Log {
  level: "log" | "info" | "warn";
  message: string;
}

export type DiffLine = [old: number | null, next: number | null, text: string];

export interface Step {
  kind: Kind;
  stage: Stage;
  status: Status;
  /** A script or transform's own name, shown instead of the translated title. */
  name?: string;
  /** Position among steps of the same kind, for the line under the title. */
  position?: [n: number, total: number];
  fields: string[];
  /** The number of changed fields when it exceeds what `fields` lists. */
  count?: number;
  /** Empty when the output is the same as the step before. */
  yaml: string[];
  hunk?: string;
  diff?: DiffLine[];
  logs?: Log[];
}
