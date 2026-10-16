import { useMemo, useState } from "react";

// ── Sankey ─────────────────────────────────────────────────────────────────
const FLOWS: [origin: string, rule: string, chain: string, value: number][] = [
  ["steam", "RuleSet(steam)", "Steam", 52],
  ["Google Chrome", "Match", "Selected", 31],
  ["Google Chrome", "RuleSet(developer)", "Developer", 24],
  ["Telegram", "RuleSet(telegramcidr)", "Telegram", 9],
  ["curl", "RuleSet(developer)", "Developer", 7],
  ["Telegram", "Match", "Selected", 2],
  ["curl", "Match", "Selected", 1.5],
];

const SW = 400;
const SH = 168;
const NODE = 8;
const GAP = 8;
const COLS = [0, SW / 2 - NODE / 2, SW - NODE];

interface SNode {
  key: string;
  col: number;
  name: string;
  value: number;
  y: number;
  h: number;
}

function layoutSankey() {
  const columns: Map<string, SNode>[] = [new Map(), new Map(), new Map()];
  for (const flow of FLOWS) {
    flow.slice(0, 3).forEach((name, col) => {
      const key = `${col}:${name}`;
      const node = columns[col].get(key) ?? {
        key,
        col,
        name: name as string,
        value: 0,
        y: 0,
        h: 0,
      };
      node.value += flow[3];
      columns[col].set(key, node);
    });
  }
  const total = FLOWS.reduce((sum, flow) => sum + flow[3], 0);
  const nodes = new Map<string, SNode>();
  columns.forEach((column) => {
    const list = [...column.values()].sort((a, b) => b.value - a.value);
    const scale = (SH - GAP * (list.length - 1)) / total;
    let y = 0;
    for (const node of list) {
      node.y = y;
      node.h = node.value * scale;
      y += node.h + GAP;
      nodes.set(node.key, node);
    }
  });

  // Bands: each flow crosses two gaps; stack them within each node in node order.
  const outOffset = new Map<string, number>();
  const inOffset = new Map<string, number>();
  const bands: { d: string; nodes: string[]; value: number }[] = [];
  const ordered = [...FLOWS].sort((a, b) => {
    const ay = nodes.get(`1:${a[1]}`)!.y + nodes.get(`2:${a[2]}`)!.y / 1000;
    const by = nodes.get(`1:${b[1]}`)!.y + nodes.get(`2:${b[2]}`)!.y / 1000;
    return ay - by;
  });
  for (const flow of ordered) {
    const keys = flow.slice(0, 3).map((name, col) => `${col}:${name}`);
    for (let col = 0; col < 2; col++) {
      const a = nodes.get(keys[col])!;
      const b = nodes.get(keys[col + 1])!;
      const scale = a.h / a.value;
      const h = flow[3] * scale;
      const y0 = a.y + (outOffset.get(a.key) ?? 0);
      const y1 = b.y + (inOffset.get(b.key) ?? 0);
      outOffset.set(a.key, (outOffset.get(a.key) ?? 0) + h);
      inOffset.set(b.key, (inOffset.get(b.key) ?? 0) + h);
      const x0 = COLS[col] + NODE;
      const x1 = COLS[col + 1];
      const xm = (x0 + x1) / 2;
      bands.push({
        d: `M${x0} ${y0}C${xm} ${y0} ${xm} ${y1} ${x1} ${y1}V${y1 + h}C${xm} ${y1 + h} ${xm} ${y0 + h} ${x0} ${y0 + h}Z`,
        nodes: keys,
        value: flow[3],
      });
    }
  }
  return { nodes: [...nodes.values()], bands };
}

export function Sankey({
  caption,
  focus,
  setFocus,
}: {
  caption: string;
  focus: string | null;
  setFocus: (key: string | null) => void;
}) {
  const { nodes, bands } = useMemo(layoutSankey, []);
  const [hover, setHover] = useState<string | null>(null);
  const active = hover ?? focus;

  return (
    <div className="tr-sankey">
      <svg viewBox={`-2 -2 ${SW + 4} ${SH + 4}`} role="img" aria-label={caption}>
        <g className="tr-bands">
          {bands.map((band, i) => (
            <path
              key={i}
              d={band.d}
              data-dim={active && !band.nodes.includes(active) ? "" : undefined}
            />
          ))}
        </g>
        {nodes.map((node) => (
          <g
            key={node.key}
            className="tr-node"
            data-col={node.col}
            data-active={active === node.key || undefined}
            data-dim={active && active !== node.key ? "" : undefined}
            tabIndex={0}
            role="button"
            aria-pressed={focus === node.key}
            aria-label={node.name}
            data-cue={`node-${node.key}`}
            onPointerEnter={() => setHover(node.key)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(node.key)}
            onBlur={() => setHover(null)}
            onClick={() => setFocus(focus === node.key ? null : node.key)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              setFocus(focus === node.key ? null : node.key);
            }}
          >
            <rect x={COLS[node.col]} y={node.y} width={NODE} height={Math.max(node.h, 2)} rx={3} />
            <text
              x={node.col === 2 ? COLS[2] - 8 : COLS[node.col] + NODE + 8}
              y={node.y + Math.max(node.h, 2) / 2}
              textAnchor={node.col === 2 ? "end" : "start"}
              dominantBaseline="central"
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>
      <p className="tr-caption">{caption}</p>
    </div>
  );
}
