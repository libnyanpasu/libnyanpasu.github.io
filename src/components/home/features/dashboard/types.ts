export type WidgetId =
  | "down"
  | "up"
  | "memory"
  | "connections"
  | "proxy"
  | "core"
  | "mode"
  | "quota"
  | "schedule"
  | "recent"
  | "process"
  | "exit"
  | "target"
  | "rule"
  | "active"
  | "providers";

export interface DashboardLabels {
  widgets: Record<WidgetId, string>;
  addWidget: string;
  save: string;
  edit: string;
  search: string;
  closeLibrary: string;
  remove: string;
  noResults: string;
  /** `{value}` */
  total: string;
  systemProxy: string;
  tunMode: string;
  modes: [rule: string, global: string, direct: string];
  running: string;
  profile: string;
}

export type Visual =
  | "rate"
  | "spark"
  | "count"
  | "proxy"
  | "core"
  | "mode"
  | "quota"
  | "bars"
  | "rows";
