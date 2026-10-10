import { PreviewIcon } from "./icon";
import type { PreviewIcons } from "./types";

const LOBES = 8;
const STEPS = 96;

// Scalloped "cookie" outline used by the Material 3 Expressive shape toggles.
const BLOB_PATH = `${Array.from({ length: STEPS }, (_, index) => {
  const angle = (index / STEPS) * Math.PI * 2;
  const radius = 43 + 5 * Math.cos(angle * LOBES);
  const x = (50 + radius * Math.cos(angle)).toFixed(2);
  const y = (50 + radius * Math.sin(angle)).toFixed(2);
  return `${index === 0 ? "M" : "L"}${x} ${y}`;
}).join("")}Z`;

export function ShapeIcon({
  icons,
  name,
  active,
}: {
  icons: PreviewIcons;
  name: string;
  active: boolean;
}) {
  return (
    <span className="cp-shape-icon" data-active={active}>
      {active && (
        <svg className="cp-shape-blob" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
          <path d={BLOB_PATH} />
        </svg>
      )}
      <PreviewIcon icons={icons} name={name} />
    </span>
  );
}
