import type { Visual, WidgetId } from "./types";

export const WIDGETS: Record<WidgetId, { w: number; h: number; icon: string; visual: Visual }> = {
  down: { w: 2, h: 2, icon: "down", visual: "rate" },
  up: { w: 2, h: 2, icon: "up", visual: "rate" },
  memory: { w: 2, h: 2, icon: "memory", visual: "spark" },
  connections: { w: 2, h: 2, icon: "code", visual: "count" },
  proxy: { w: 4, h: 2, icon: "code", visual: "proxy" },
  core: { w: 4, h: 2, icon: "memory", visual: "core" },
  mode: { w: 4, h: 2, icon: "route", visual: "mode" },
  quota: { w: 4, h: 2, icon: "cloud", visual: "quota" },
  schedule: { w: 4, h: 2, icon: "schedule", visual: "rows" },
  recent: { w: 4, h: 2, icon: "traffic", visual: "bars" },
  process: { w: 4, h: 3, icon: "apps", visual: "rows" },
  exit: { w: 4, h: 3, icon: "split", visual: "rows" },
  target: { w: 4, h: 3, icon: "dns", visual: "rows" },
  rule: { w: 4, h: 3, icon: "rule", visual: "rows" },
  active: { w: 8, h: 2, icon: "cable", visual: "rows" },
  providers: { w: 4, h: 2, icon: "grid", visual: "rows" },
};

export const ORDER = Object.keys(WIDGETS) as WidgetId[];
export const INITIAL: WidgetId[] = ["down", "up", "memory", "connections", "proxy", "core"];

export const ROWS: Partial<Record<WidgetId, [string, string][]>> = {
  schedule: [
    ["profile", "6 h"],
    ["Local", "—"],
  ],
  process: [
    ["Google Chrome", "5.37 GiB"],
    ["steam", "4.97 GiB"],
    ["Telegram", "910 MiB"],
  ],
  exit: [
    ["JP IEPL 01", "6.12 GiB"],
    ["HK IEPL 02", "2.40 GiB"],
    ["DIRECT", "1.08 GiB"],
  ],
  target: [
    ["store.steampowered.com", "4.95 GiB"],
    ["www.youtube.com", "2.30 GiB"],
    ["api.github.com", "412 MiB"],
  ],
  rule: [
    ["RuleSet(steam)", "5.06 GiB"],
    ["Match", "3.14 GiB"],
    ["RuleSet(developer)", "2.21 GiB"],
  ],
  active: [
    ["objects.githubusercontent.com", "↓ 12.4 MiB/s"],
    ["api.telegram.org", "↓ 96 KiB/s"],
  ],
  providers: [
    ["steam", "2 h"],
    ["developer", "2 h"],
  ],
};

export const SERIES: Partial<Record<WidgetId, number[]>> = {
  down: [3, 5, 4, 8, 6, 11, 9, 14, 10, 16, 12, 18],
  up: [2, 2, 3, 2, 4, 3, 3, 5, 4, 3, 5, 4],
  memory: [30, 31, 31, 34, 33, 32, 30, 31, 31, 30, 31, 30],
};
