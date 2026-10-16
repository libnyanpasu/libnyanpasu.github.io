import { motion, useReducedMotion, type Variants } from "motion/react";
import { Icon, type IconData } from "./ui";

/**
 * Material 3 Expressive shapes as polar outlines. Every shape is sampled with the same number
 * of points, so motion can tween one path into another (the "shape morph" from the M3 spec).
 */

const POINTS = 96;
const TOP = -Math.PI / 2;

const RADII = {
  circle: () => 1,
  cookie4: (t: number) => 0.86 + 0.14 * Math.cos(4 * t),
  cookie6: (t: number) => 0.88 + 0.12 * Math.cos(6 * t),
  cookie9: (t: number) => 0.92 + 0.08 * Math.cos(9 * t),
  cookie12: (t: number) => 0.93 + 0.07 * Math.cos(12 * t),
  clover4: (t: number) => 0.8 + 0.2 * Math.cos(4 * t),
  flower8: (t: number) => 0.86 + 0.14 * Math.cos(8 * t),
  burst: (t: number) => 0.84 + 0.16 * Math.cos(10 * t),
  square: (t: number) => {
    // Squircle: rounded square from the M3 shape library.
    const p = 5;
    const r = (Math.abs(Math.cos(t)) ** p + Math.abs(Math.sin(t)) ** p) ** (-1 / p);
    return r * 0.86;
  },
} satisfies Record<string, (t: number) => number>;

export type ShapeName = keyof typeof RADII;

const cache = new Map<ShapeName, string>();

export function shapePath(name: ShapeName) {
  const hit = cache.get(name);
  if (hit) return hit;
  const radius = RADII[name];
  let d = "";
  for (let i = 0; i < POINTS; i++) {
    const t = TOP + (i / POINTS) * Math.PI * 2;
    const r = 48 * radius(t - TOP);
    d += `${i ? "L" : "M"}${(50 + r * Math.cos(t)).toFixed(2)} ${(50 + r * Math.sin(t)).toFixed(2)}`;
  }
  d += "Z";
  cache.set(name, d);
  return d;
}

const spring = { type: "spring", stiffness: 260, damping: 18, mass: 0.8 } as const;

/**
 * Icon set inside an expressive shape. It follows the variants of the card around it:
 * `hidden` → `shown` on reveal, then morphs and turns on `hover`.
 */
export function ShapeBadge({
  icon,
  shape,
  hoverShape,
  className,
}: {
  icon?: IconData;
  shape: ShapeName;
  hoverShape: ShapeName;
  className?: string;
}) {
  const rest = shapePath(shape);
  const svg: Variants = {
    hidden: { rotate: -120, scale: 0.4 },
    shown: { rotate: 0, scale: 1, transition: { ...spring, delay: 0.15 } },
    hover: { rotate: 45, scale: 1.04, transition: spring },
  };
  const path: Variants = {
    hidden: { d: rest },
    shown: { d: rest, transition: spring },
    hover: { d: shapePath(hoverShape), transition: spring },
  };
  const glyph: Variants = {
    hidden: { opacity: 0, scale: 0.6 },
    shown: { opacity: 1, scale: 1, transition: { ...spring, delay: 0.25 } },
    hover: { opacity: 1, scale: 1.08, transition: spring },
  };
  return (
    <span className={className ? `m3f-badge ${className}` : "m3f-badge"} aria-hidden="true">
      <motion.svg className="m3f-badge-shape" viewBox="0 0 100 100" variants={svg}>
        <motion.path d={rest} variants={path} />
      </motion.svg>
      <motion.span className="m3f-badge-icon" variants={glyph}>
        <Icon icon={icon} />
      </motion.span>
    </span>
  );
}

const LOOP: ShapeName[] = ["cookie9", "clover4", "burst", "square", "cookie6", "cookie9"];

/**
 * A sticker that never settles: it walks through the shape library and keeps turning.
 * Decorative only; with reduced motion it rests on the first shape.
 */
export function MorphLoop({ icon, className }: { icon?: IconData; className?: string }) {
  const frames = LOOP.map(shapePath);
  const reduced = useReducedMotion();
  return (
    <span className={className ? `m3f-morph ${className}` : "m3f-morph"} aria-hidden="true">
      <motion.svg
        viewBox="0 0 100 100"
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity }}
      >
        <motion.path
          d={frames[0]}
          animate={reduced ? undefined : { d: frames }}
          transition={{
            duration: 10,
            ease: [0.2, 0, 0, 1],
            times: frames.map((_, i) => i / (frames.length - 1)),
            repeat: Infinity,
          }}
        />
      </motion.svg>
      <Icon icon={icon} />
    </span>
  );
}
