import { animate } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { FilmGrain, Flower, MeshGradient, Shader } from "shaders/react";

/**
 * A `shaders` (WebGPU) mesh gradient painted with Material 3 colours.
 *
 * `colors` are hex values (the Material You card feeds its generated scheme); `roles` are CSS
 * variables resolved from the page's M3 theme and re-read when Starlight flips `data-theme`.
 * The first five colours paint the mesh. With `shapes`, two more paint a pair of slowly turning
 * M3 Expressive shapes (a scalloped cookie and a clover) in opposite corners.
 * Colour changes are tweened with motion rather than snapped. Without WebGPU, or while the
 * host is far off-screen, no canvas exists and the CSS behind it shows instead.
 */

interface Props {
  colors?: string[];
  roles?: string[];
  shapes?: boolean;
  seed?: number;
  className?: string;
}

function toRgb(ctx: CanvasRenderingContext2D, value: string) {
  ctx.fillStyle = "#000";
  ctx.fillStyle = value || "#808080";
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbToHex = (rgb: number[]) =>
  `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;

function readRoles(roles: string[]) {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.canvas.width = ctx.canvas.height = 1;
  const style = getComputedStyle(document.documentElement);
  return roles.map((role) => rgbToHex(toRgb(ctx, style.getPropertyValue(role).trim())));
}

export default function TonalShader({ colors, roles, shapes = false, seed = 0, className }: Props) {
  const host = useRef<HTMLSpanElement>(null);
  const [supported, setSupported] = useState(false);
  const [near, setNear] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [scheme, setScheme] = useState(0);
  const [target, setTarget] = useState<string[] | null>(null);
  const [shown, setShown] = useState<string[] | null>(null);
  const shownRef = useRef<string[] | null>(null);

  useEffect(() => {
    setSupported("gpu" in navigator);
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    const observer = new MutationObserver(() => setScheme((v) => v + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      query.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "240px 0px",
    });
    io.observe(element);
    return () => io.disconnect();
  }, []);

  const key = (colors ?? roles)?.join();
  useEffect(() => {
    // One frame later so a freshly flipped theme's variables are already applied.
    const frame = requestAnimationFrame(() => {
      setTarget(colors ?? (roles ? readRoles(roles) : null));
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, scheme]);

  useEffect(() => {
    if (!target) return;
    const from = shownRef.current;
    if (!from || reduced || from.length !== target.length) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const a = from.map(hexToRgb);
    const b = target.map(hexToRgb);
    const controls = animate(0, 1, {
      duration: 0.7,
      ease: [0.2, 0, 0, 1],
      onUpdate: (t) => {
        const next = a.map((rgb, i) => rgbToHex(rgb.map((c, k) => c + (b[i][k] - c) * t)));
        shownRef.current = next;
        setShown(next);
      },
    });
    return () => controls.stop();
  }, [target, reduced]);

  const canvas = supported && near && shown;
  const mesh = shown?.slice(0, 5) ?? [];
  // The runtime takes an auto-animate driver on any numeric prop, so the shapes turn on the GPU
  // without React renders; the generated typings only declare drivers on `center`.
  const turn = (speed: number) =>
    (reduced
      ? 0
      : { type: "auto-animate", mode: "loop", outputMin: 0, outputMax: 360, speed }) as number;

  return (
    <span
      ref={host}
      className={className ? `m3f-shader ${className}` : "m3f-shader"}
      aria-hidden="true"
    >
      {canvas && (
        <Shader className="m3f-shader-canvas">
          <MeshGradient
            stops={mesh.map((color, index) => ({ color, position: index / (mesh.length - 1) }))}
            colorSpace="oklab"
            count={5}
            smoothness={2.2}
            swirl={0.3}
            drift={0.5}
            seed={seed}
            speed={reduced ? 0 : 0.35}
          />
          {shapes && shown[5] && (
            <Flower
              color={shown[5]}
              center={{ x: 0.9, y: 0.2 }}
              radius={0.26}
              sides={9}
              innerRatio={0.84}
              softness={0.004}
              rotation={turn(0.025)}
            />
          )}
          {shapes && shown[6] && (
            <Flower
              color={shown[6]}
              center={{ x: 0.08, y: 0.88 }}
              radius={0.18}
              sides={4}
              innerRatio={0.62}
              softness={0.004}
              rotation={turn(-0.035)}
            />
          )}
          <FilmGrain strength={0.035} bias={1} />
        </Shader>
      )}
    </span>
  );
}
