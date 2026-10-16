import type { KeyboardEvent } from "react";

export interface IconData {
  body: string;
  viewBox: string;
}

export type Icons = Record<string, IconData>;

/** Material Symbols glyph, precomputed in the Astro frontmatter and drawn in currentColor. */
export function Icon({ icon, className }: { icon?: IconData; className?: string }) {
  if (!icon) return null;
  return (
    <svg
      className={className ? `m3f-svg ${className}` : "m3f-svg"}
      viewBox={icon.viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}

/** Roving-tabindex arrow-key handling shared by every radio / tab group in the bento. */
export function arrowNav(count: number, current: number, select: (index: number) => void) {
  return (event: KeyboardEvent<HTMLElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };
    let next = current;
    if (event.key in keys) next = (current + keys[event.key] + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;
    event.preventDefault();
    select(next);
    const group = event.currentTarget.closest<HTMLElement>("[data-m3f-group]");
    requestAnimationFrame(() => {
      group?.querySelectorAll<HTMLElement>("[data-m3f-item]")[next]?.focus();
    });
  };
}
