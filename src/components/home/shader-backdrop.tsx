import { useEffect, useRef, useState } from "react";
import { FilmGrain, MeshGradient, Shader } from "shaders/react";
import { readRoles, useReducedMotionQuery, useSchemeKey, useShaderGate } from "./use-shader-gate";

/**
 * Tonal colour field drawn with the `shaders` WebGPU library (shader-effects-inc/shaders).
 *
 * Colours are never hard-coded: they are resolved from the Material 3 roles that
 * `createMd3ThemeOptionsCss` publishes on the page, so the field follows the seed colour and
 * the light/dark scheme (a theme flip only updates uniforms; the renderer is kept). Where WebGPU
 * is missing no canvas is drawn and the CSS gradient behind it (see `.home-backdrop`) remains.
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

export default function ShaderBackdrop({
  variant = "hero",
  seed = 0,
}: {
  variant?: Variant;
  seed?: number;
}) {
  const host = useRef<HTMLSpanElement>(null);
  const { armed, shown, onReady } = useShaderGate(host);
  const schemeKey = useSchemeKey();
  const reduced = useReducedMotionQuery();
  const [palette, setPalette] = useState<string[] | null>(null);

  useEffect(() => {
    // Wait one frame so the new scheme's variables are applied before reading them.
    const frame = requestAnimationFrame(() => setPalette(readRoles(ROLES[variant])));
    return () => cancelAnimationFrame(frame);
  }, [variant, schemeKey]);

  return (
    <span ref={host} className="home-backdrop-host" data-shown={shown || undefined}>
      {armed && palette && (
        <Shader className="home-backdrop-canvas" disableTelemetry onReady={onReady}>
          <MeshGradient
            stops={palette.map((color, index) => ({
              color,
              position: index / (palette.length - 1),
            }))}
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
