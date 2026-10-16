import { useCallback, useEffect, useState, type RefObject } from "react";

/**
 * When a `shaders` canvas may exist, and when it may be seen.
 *
 * Creating the WebGPU renderer and compiling its pipeline is the expensive part, and doing it
 * while the page is scrolling or a card is animating in is what made the stages hitch. So the
 * canvas is created once, in an idle callback, the first time its host comes near the viewport,
 * and is then kept: the runtime already pauses its animation loop while the canvas is off-screen,
 * so unmounting it only meant paying for initialisation again on the way back.
 *
 * The canvas stays transparent until the renderer reports its first frame, then fades in over
 * the CSS gradient underneath, so there is never a blank or half-drawn frame to pop in.
 */
export function useShaderGate(host: RefObject<HTMLElement | null>, margin = "400px 0px") {
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element || !("gpu" in navigator)) return;

    let cancelled = false;
    const arm = () => {
      const ready = () => !cancelled && setArmed(true);
      if ("requestIdleCallback" in window) window.requestIdleCallback(ready, { timeout: 800 });
      else setTimeout(ready, 200);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        arm();
      },
      { rootMargin: margin },
    );
    observer.observe(element);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [host, margin]);

  // Two frames after `onReady`, so the first drawn frame is on screen before the fade starts.
  const onReady = useCallback(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }, []);

  return { armed, shown, onReady };
}

/** Follow `prefers-reduced-motion`. */
export function useReducedMotionQuery() {
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

/** Bumps whenever Starlight flips `data-theme`, so palettes read from CSS can be re-read. */
export function useSchemeKey() {
  const [key, setKey] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver(() => setKey((value) => value + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return key;
}

/** Resolve CSS colour roles (any syntax: hex, oklch(), color-mix()…) to `#rrggbb`. */
export function readRoles(roles: string[]) {
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.canvas.width = ctx.canvas.height = 1;
  const style = getComputedStyle(document.documentElement);
  return roles.map((role) => {
    ctx.fillStyle = "#000";
    ctx.fillStyle = style.getPropertyValue(role).trim() || "#808080";
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
  });
}
