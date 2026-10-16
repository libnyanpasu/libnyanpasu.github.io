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

export type Kind = keyof ProfilesLabels["steps"];
export type DiffLine = [old: number | null, next: number | null, text: string];

export interface Step {
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
