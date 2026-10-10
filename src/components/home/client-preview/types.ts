import type { ReactNode } from "react";

export type PreviewIconData = { body: string; viewBox: string };
export type PreviewIcons = Record<string, PreviewIconData>;

export type PreviewLabels = Record<string, string> & {
  dashboard: string;
  proxies: string;
  profiles: string;
  connections: string;
  traffic: string;
  rules: string;
  logs: string;
  settings: string;
  providers: string;
  file: string;
  help: string;
  update: string;
  download: string;
  upload: string;
  memory: string;
  activeConnections: string;
  total: string;
  proxyStatus: string;
  systemProxy: string;
  tunMode: string;
  proxyDisabled: string;
  proxyOccupied: string;
  proxyMode: string;
  rule: string;
  global: string;
  direct: string;
  coreStatus: string;
  checkingCore: string;
  running: string;
  stopped: string;
  runningByService: string;
  runningByChildProcess: string;
  serviceRunning: string;
  serviceStopped: string;
  serviceNotInstalled: string;
  coreStoppedUnknown: string;
  controlChannel: string;
  version: string;
  clientLabel: string;
  navLabel: string;
  comingSoon: string;
};

export type IconProps = {
  icons: PreviewIcons;
  name: string;
  className?: string;
  children?: ReactNode;
};
