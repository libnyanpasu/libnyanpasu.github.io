import { useEffect, useRef, useState } from "react";
import { FilmGrain, MeshGradient, Shader } from "shaders/react";

/**
 * Tonal colour field drawn with the `shaders` WebGPU library (shader-effects-inc/shaders).
 *
 * Colours are never hard-coded: they are resolved from the Material 3 roles that
 * `createMd3ThemeOptionsCss` publishes on the page, so the field follows the seed colour and
 * the light/dark scheme. Where WebGPU is missing the component draws no canvas and the CSS
 * gradient behind it (see `.home-backdrop`) remains.
 */

type Variant = "hero" | "download";

const ROLES: Record<Variant, string[]> = {
  hero: [
    "--md-sys-color-primary-container",
    "--md-sys-color-tertiary-container",
    "--md-sys-color-surface",
    "--md-sys-color-secondary-container",
    "--md-sys-color-surface",
  ],
  download: [
    "--md-sys-color-primary-container",
    "--md-sys-color-secondary-container",
    "--md-sys-color-surface-container",
    "--md-sys-color-tertiary-container",
    "--md-sys-color-surface-container",
  ],
};

/** Resolve any CSS colour (hex, oklch(), color-mix()…) to `#rrggbb` through a 2D canvas. */
function toHex(ctx: CanvasRenderingContext2D, value: string, fallback: string) {
  ctx.fillStyle = "#000";
  ctx.fillStyle = value || fallback;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function readPalette(variant: Variant) {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.canvas.width = ctx.canvas.height = 1;
  const style = getComputedStyle(document.documentElement);
  return ROLES[variant].map((role) => toHex(ctx, style.getPropertyValue(role).trim(), "#808080"));
}

function useSchemeKey() {
  const [key, setKey] = useState(0);
  useEffect(() => {
    // Starlight flips `data-theme` on <html>; the palette variables change with it.
    const observer = new MutationObserver(() => setKey((value) => value + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return key;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Mount (and later unmount) the canvas only while its host is near the viewport. */
function useNearViewport(enabled: boolean, host: React.RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(!enabled);
  useEffect(() => {
    const element = host.current;
    if (!enabled || !element) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "320px 0px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, host]);
  return near;
}

export default function ShaderBackdrop({
  variant = "hero",
  seed = 0,
  lazy = false,
}: {
  variant?: Variant;
  seed?: number;
  lazy?: boolean;
}) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const near = useNearViewport(lazy, hostRef);
  const schemeKey = useSchemeKey();
  const reduced = useReducedMotion();
  const [palette, setPalette] = useState<string[] | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("gpu" in navigator);
  }, []);

  useEffect(() => {
    // Wait one frame so the new scheme's variables are applied before reading them.
    const frame = requestAnimationFrame(() => setPalette(readPalette(variant)));
    return () => cancelAnimationFrame(frame);
  }, [variant, schemeKey]);

  if (!supported || !palette) return <span ref={hostRef} className="home-backdrop-host" />;

  const [first, ...rest] = palette;
  const stops = [first, ...rest].map((color, index, all) => ({
    color,
    position: index / (all.length - 1),
  }));

  return (
    <span ref={hostRef} className="home-backdrop-host">
      {near && (
        <Shader className="home-backdrop-canvas" aria-hidden="true">
          <MeshGradient
            key={schemeKey}
            stops={stops}
            colorSpace="oklab"
            count={5}
            smoothness={2.4}
            swirl={0.25}
            drift={0.45}
            seed={seed}
            speed={reduced ? 0 : 0.35}
          />
          <FilmGrain strength={0.04} bias={1} />
        </Shader>
      )}
    </span>
  );
}
