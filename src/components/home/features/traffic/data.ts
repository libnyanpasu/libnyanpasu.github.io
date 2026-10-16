export interface Row {
  name: string;
  up: number;
  down: number;
  conns: number;
  mono?: boolean;
}

const MiB = 1024 * 1024;
const row = (name: string, up: number, down: number, conns: number, mono = false): Row => ({
  name,
  up: up * MiB,
  down: down * MiB,
  conns,
  mono,
});

// One day of traffic; other ranges and scopes scale it.
export const PROCESSES = [
  row("steam", 96, 5104, 212),
  row("Google Chrome", 412, 5088, 1864),
  row("Telegram", 61, 849, 408),
  row("curl", 18, 742, 96),
  row("Safari", 9, 186, 120),
  row("git-remote-https", 6, 92, 38),
];
export const HOSTS = [
  row("store.steampowered.com", 88, 4980, 164, true),
  row("objects.githubusercontent.com", 12, 1806, 84, true),
  row("www.google.com", 140, 1210, 702, true),
  row("api.telegram.org", 52, 806, 366, true),
  row("cdn.jsdelivr.net", 4, 380, 141, true),
  row("www.youtube.com", 92, 2260, 230, true),
];
export const REGIONS = [
  row("United States", 230, 6540, 1420),
  row("Japan", 196, 3480, 680),
  row("Hong Kong", 84, 1206, 330),
  row("Singapore", 42, 520, 184),
  row("Netherlands", 18, 314, 124),
];
export const DEVICES = [
  row("127.0.0.1", 498, 9840, 2310, true),
  row("192.168.1.20", 72, 1630, 330, true),
  row("192.168.1.35", 32, 591, 98, true),
];

const RANGE_SCALE = [1, 6.3, 24.8];
const SCOPE_SCALE = [1, 0.14, 0.86];

export function scaled(rows: Row[], range: number, scope: number) {
  const k = RANGE_SCALE[range] * SCOPE_SCALE[scope];
  return rows
    .map((r, i) => {
      // A little drift per range, so the ranking reshuffles like real data would.
      const drift = 1 + 0.22 * Math.sin(i * 1.7 + range * 2.1 + scope);
      return {
        ...r,
        up: r.up * k * drift,
        down: r.down * k * drift,
        conns: Math.max(1, Math.round(r.conns * k * drift)),
      };
    })
    .sort((a, b) => b.up + b.down - (a.up + a.down));
}
