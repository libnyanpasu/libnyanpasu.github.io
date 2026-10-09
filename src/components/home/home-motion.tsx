import { scroll } from "motion/react";
import { useEffect } from "react";

const STACK_QUERY =
  "(min-width: 960px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)";
const STACK_TOP = 120;
const MAX_SCALE_REDUCTION = 0.04;
const MAX_SHADE_OPACITY = 0.24;

type InlineStyleSnapshot = {
  transform: string;
  transformPriority: string;
  transformOrigin: string;
  transformOriginPriority: string;
};

type ShadeStyleSnapshot = {
  opacity: string;
  opacityPriority: string;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function restoreProperty(
  style: CSSStyleDeclaration,
  property: string,
  value: string,
  priority: string,
) {
  if (value) {
    style.setProperty(property, value, priority);
  } else {
    style.removeProperty(property);
  }
}

export default function HomeMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".home-site");
    if (!root) return;

    const media = window.matchMedia(STACK_QUERY);
    let stopAnimations: (() => void) | undefined;
    let stackActive = false;

    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-home-stack-card]"));
    const snapshots = cards.map((card) => {
      const surface = card.querySelector<HTMLElement>("[data-home-stack-surface]");
      const shade = card.querySelector<HTMLElement>("[data-home-stack-shade]");

      return {
        surface,
        shade,
        surfaceStyle: surface
          ? ({
              transform: surface.style.getPropertyValue("transform"),
              transformPriority: surface.style.getPropertyPriority("transform"),
              transformOrigin: surface.style.getPropertyValue("transform-origin"),
              transformOriginPriority: surface.style.getPropertyPriority("transform-origin"),
            } satisfies InlineStyleSnapshot)
          : undefined,
        shadeStyle: shade
          ? ({
              opacity: shade.style.getPropertyValue("opacity"),
              opacityPriority: shade.style.getPropertyPriority("opacity"),
            } satisfies ShadeStyleSnapshot)
          : undefined,
      };
    });

    const clearAnimations = () => {
      stopAnimations?.();
      stopAnimations = undefined;
    };

    const startAnimations = () => {
      const stopScrolls = snapshots.slice(0, -1).flatMap((snapshot, index) => {
        const surface = snapshot.surface;
        if (!surface) return [];

        const shade = snapshot.shade;
        const upcomingCard = cards[index + 1];
        const update = (progress: number) => {
          const amount = clamp01(progress);
          surface.style.transformOrigin = "center top";
          surface.style.transform = `scale(${1 - MAX_SCALE_REDUCTION * amount})`;
          if (shade) {
            shade.style.opacity = String(MAX_SHADE_OPACITY * amount);
          }
        };

        // Apply the current scroll position before the first scroll event so
        // restored scroll positions don't flash the unstacked card state.
        const rect = upcomingCard.getBoundingClientRect();
        const viewportHeight = document.documentElement.clientHeight;
        update((viewportHeight - rect.top) / (viewportHeight - STACK_TOP));

        return [
          scroll(update, {
            target: upcomingCard,
            offset: ["start end", `start ${STACK_TOP}px`],
          }),
        ];
      });

      stopAnimations = () => {
        stopScrolls.forEach((stop) => stop());
        snapshots.forEach(({ surface, shade, surfaceStyle, shadeStyle }) => {
          if (surface && surfaceStyle) {
            restoreProperty(
              surface.style,
              "transform",
              surfaceStyle.transform,
              surfaceStyle.transformPriority,
            );
            restoreProperty(
              surface.style,
              "transform-origin",
              surfaceStyle.transformOrigin,
              surfaceStyle.transformOriginPriority,
            );
          }
          if (shade && shadeStyle) {
            restoreProperty(shade.style, "opacity", shadeStyle.opacity, shadeStyle.opacityPriority);
          }
        });
      };
    };

    const updateStackEligibility = () => {
      const allCardsFit =
        cards.length >= 2 &&
        snapshots.every(
          ({ surface }) => surface && surface.offsetHeight <= window.innerHeight - 150,
        );
      const shouldActivate = media.matches && allCardsFit;

      if (shouldActivate === stackActive) return;
      stackActive = shouldActivate;

      if (stackActive) {
        root.setAttribute("data-home-stack-active", "true");
        startAnimations();
      } else {
        root.removeAttribute("data-home-stack-active");
        clearAnimations();
      }
    };

    const resizeObserver = new ResizeObserver(updateStackEligibility);
    snapshots.forEach(({ surface }) => {
      if (surface) resizeObserver.observe(surface);
    });

    updateStackEligibility();
    media.addEventListener("change", updateStackEligibility);
    window.addEventListener("resize", updateStackEligibility);

    return () => {
      media.removeEventListener("change", updateStackEligibility);
      window.removeEventListener("resize", updateStackEligibility);
      resizeObserver.disconnect();
      root.removeAttribute("data-home-stack-active");
      clearAnimations();
    };
  }, []);

  return null;
}
