import type { Step } from "./types";

export const STEPS: Step[] = [
  {
    kind: "file",
    stage: "source",
    status: "start",
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
    stage: "profile",
    status: "changed",
    name: "JavaScript - Regroup nodes",
    fields: [
      "proxy-groups.0.name",
      "proxy-groups.0.proxies.0",
      "proxy-groups.0.proxies.1",
      "proxy-groups.0.proxies.2",
    ],
    count: 2016,
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
      { level: "log", message: "renamed group Proxies -> Selected" },
      { level: "log", message: "2014 nodes regrouped by region" },
      { level: "info", message: "script finished in 18 ms" },
    ],
  },
  {
    kind: "filter",
    stage: "nyanpasu",
    status: "changed",
    fields: ["external-controller-tls", "experimental"],
    count: 14,
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
  { kind: "keep", stage: "nyanpasu", status: "unchanged", fields: [], yaml: [] },
  {
    kind: "overrides",
    stage: "nyanpasu",
    status: "changed",
    fields: ["allow-lan", "log-level", "external-controller"],
    count: 8,
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
  {
    kind: "defaults",
    stage: "nyanpasu",
    status: "changed",
    fields: ["dns.enhanced-mode"],
    yaml: ["dns:", "  enhanced-mode: fake-ip"],
    hunk: "@@ -28,3 +28,4 @@",
    diff: [
      [28, 28, "   ipv6: false"],
      [29, 29, "   listen: 127.0.0.1:7874"],
      [null, 30, "+  enhanced-mode: fake-ip"],
      [30, 31, "   use-hosts: true"],
    ],
  },
  {
    kind: "builtin",
    stage: "nyanpasu",
    status: "unchanged",
    name: "verge_hy_alpn",
    position: [1, 2],
    fields: [],
    yaml: [],
  },
  {
    kind: "builtin",
    stage: "nyanpasu",
    status: "unchanged",
    name: "verge_meta_guard",
    position: [2, 2],
    fields: [],
    yaml: [],
  },
  {
    kind: "finalize",
    stage: "result",
    status: "final",
    fields: [],
    yaml: [
      "unified-delay: true",
      "dns:",
      "  enable: true",
      "  ipv6: false",
      "  listen: 127.0.0.1:7874",
      "  use-hosts: true",
      "  use-system-hosts: false",
      "  nameserver:",
      "    - tls://119.29.29.29",
      "    - tls://223.5.5.5",
      "    - https://dns.pub/dns-query",
      "    - https://dns.alidns.com/dns-query",
      "  proxy-server-nameserver:",
      "    - udp://127.0.0.1:7874",
      "  fake-ip-range: 198.18.0.0/15",
      "  fake-ip-filter:",
      "    - '*.lan'",
      "    - '*.localdomain'",
      "    - '*.local'",
    ],
  },
  {
    kind: "core",
    stage: "result",
    status: "core",
    fields: ["external-controller-unix"],
    yaml: ["external-controller-unix: mihomo.sock"],
    hunk: "@@ -5,1 +5,2 @@",
    diff: [
      [5, 5, " external-controller: 127.0.0.1:17650"],
      [null, 6, "+external-controller-unix: mihomo.sock"],
    ],
  },
];

export const FINAL = STEPS.findIndex((step) => step.kind === "finalize");
export const CORE = STEPS.findIndex((step) => step.kind === "core");

export const changedCount = (step: Step) => step.count ?? step.fields.length;

/** The client's "only steps that changed something": the Source and Result stages stay. */
export const worthListing = (step: Step, selected: number) =>
  step.stage === "source" ||
  step.stage === "result" ||
  STEPS[selected] === step ||
  changedCount(step) > 0;

/** A step that changed nothing outputs what the step before it did. */
export function outputOf(index: number): string[] {
  for (let i = index; i >= 0; i--) if (STEPS[i].yaml.length) return STEPS[i].yaml;
  return [];
}
