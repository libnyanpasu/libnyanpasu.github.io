export interface TrafficLabels {
  rail: string;
  views: [overview: string, paths: string, geography: string, device: string, process: string];
  total: string;
  connections: string;
  processes: string;
  hosts: string;
  topProcesses: string;
  topHosts: string;
  topRegions: string;
  topDevices: string;
  viewAll: string;
  /** `{count}` */
  others: string;
  /** `{count}` */
  connectionCount: string;
  scopeLabel: string;
  scopes: [string, string, string];
  metric: string;
  rangeLabel: string;
  ranges: [string, string, string];
  layers: string;
  limit: string;
  caption: string;
  /** `{filter}` */
  removeFilter: string;
}
