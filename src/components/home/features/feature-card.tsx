import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { Frame } from "./frame";
import { ShapeBadge, type ShapeName } from "./m3-shape";
import TonalShader from "./tonal-shader";
import type { IconData } from "./ui";

/** M3 emphasized-decelerate: what the spec uses for elements entering the screen. */
export const EMPHASIZED_DECELERATE = [0.05, 0.7, 0.1, 1] as const;

export interface StageShader {
  roles?: string[];
  colors?: string[];
  shapes?: boolean;
  seed?: number;
}

interface Props {
  name: string;
  tone: "primary" | "secondary" | "tertiary";
  icon?: IconData;
  shape: [rest: ShapeName, hover: ShapeName];
  title: string;
  description: string;
  /** Full-width card: copy on the left, a raised demo on a tonal stage on the right. */
  wide?: boolean;
  /** Under the copy on wide cards, below the demo on regular ones. */
  extra?: ReactNode;
  /** A tonal stage behind the demo; with `colors` or `roles` it is lit by a shader. */
  stage?: StageShader;
  /** Stagger within a row, in seconds. */
  delay?: number;
  style?: CSSProperties;
  children: ReactNode;
}

export default function FeatureCard({
  name,
  tone,
  icon,
  shape,
  title,
  description,
  wide = false,
  extra,
  stage,
  delay = 0,
  style,
  children,
}: Props) {
  const card: Variants = {
    hidden: { opacity: 0, y: 64, scale: 0.96 },
    shown: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.9,
        delay,
        ease: EMPHASIZED_DECELERATE,
        delayChildren: delay + 0.12,
        staggerChildren: 0.06,
      },
    },
  };
  const rise: Variants = {
    hidden: { opacity: 0, y: 20 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EMPHASIZED_DECELERATE } },
  };
  const titleId = `m3f-${name}-title`;
  const lit = stage?.colors || stage?.roles ? stage : null;

  // Pointer feedback: a tonal spotlight that trails the cursor, and on wide cards the raised
  // demo leans towards it a few degrees.
  const reduced = useReducedMotion();
  const glowX = useMotionValue(-1000);
  const glowY = useMotionValue(-1000);
  const glow = useMotionTemplate`radial-gradient(520px circle at ${glowX}px ${glowY}px, color-mix(in oklab, var(--tone) 12%, transparent), transparent 70%)`;
  const tilt = { stiffness: 160, damping: 22, mass: 0.6 };
  const rotateX = useSpring(0, tilt);
  const rotateY = useSpring(0, tilt);

  const track = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    glowX.set(event.clientX - box.left);
    glowY.set(event.clientY - box.top);
    if (wide && !reduced) {
      rotateY.set(((event.clientX - box.left) / box.width - 0.5) * 7);
      rotateX.set(-((event.clientY - box.top) / box.height - 0.5) * 7);
    }
  };
  const release = () => {
    glowX.set(-1000);
    glowY.set(-1000);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      className={`m3f-card m3f-${name}`}
      data-tone={tone}
      data-wide={wide || undefined}
      aria-labelledby={titleId}
      style={style}
      variants={card}
      initial="hidden"
      whileInView="shown"
      whileHover="hover"
      viewport={{ once: true, amount: 0.2 }}
      onPointerMove={track}
      onPointerLeave={release}
    >
      <motion.span className="m3f-glow" aria-hidden="true" style={{ background: glow }} />
      <div className="m3f-copy">
        <ShapeBadge icon={icon} shape={shape[0]} hoverShape={shape[1]} />
        <motion.h3 id={titleId} variants={rise}>
          {title}
        </motion.h3>
        <motion.p variants={rise}>{description}</motion.p>
        {wide && extra && (
          <motion.div className="m3f-extra" variants={rise}>
            {extra}
          </motion.div>
        )}
      </div>

      <motion.div
        className="m3f-stage"
        data-shader={stage ? "" : undefined}
        variants={{
          hidden: { opacity: 0, y: 32 },
          shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EMPHASIZED_DECELERATE } },
        }}
      >
        {lit && (
          <TonalShader
            className="m3f-stage-shader"
            roles={lit.roles}
            colors={lit.colors}
            shapes={lit.shapes}
            seed={lit.seed}
          />
        )}
        <motion.div className="m3f-demo" style={wide ? { rotateX, rotateY } : undefined}>
          <Frame>{children}</Frame>
        </motion.div>
      </motion.div>

      {!wide && extra && (
        <motion.div className="m3f-extra" variants={rise}>
          {extra}
        </motion.div>
      )}
    </motion.article>
  );
}
