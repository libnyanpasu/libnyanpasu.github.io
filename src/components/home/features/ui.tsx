import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useId, type KeyboardEvent } from "react";

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

/** Number that counts to its new value with the M3 emphasized curve. */
export function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const motionValue = useMotionValue(value);
  const text = useTransform(motionValue, (v) => v.toFixed(decimals));
  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.8, ease: [0.2, 0, 0, 1] });
    return () => controls.stop();
  }, [motionValue, value]);
  return <motion.span>{text}</motion.span>;
}

/** M3 single-select segmented button; the selected container glides between segments. */
export function Segmented({
  label,
  options,
  value,
  onChange,
  check,
}: {
  label: string;
  options: string[];
  value: number;
  onChange: (index: number) => void;
  check?: IconData;
}) {
  const id = useId();
  return (
    <div className="m3f-segmented" role="radiogroup" aria-label={label} data-m3f-group>
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === index}
          tabIndex={value === index ? 0 : -1}
          data-m3f-item
          onClick={() => onChange(index)}
          onKeyDown={arrowNav(options.length, index, onChange)}
        >
          {value === index && (
            <motion.span
              className="m3f-segmented-pill"
              layoutId={`${id}-pill`}
              transition={{ type: "spring", stiffness: 520, damping: 42 }}
            />
          )}
          <Icon icon={check} className="m3f-segmented-check" />
          <span className="m3f-segmented-label">{option}</span>
        </button>
      ))}
    </div>
  );
}
