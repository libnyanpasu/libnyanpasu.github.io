import type { IconProps } from "./types";

export function PreviewIcon({ icons, name, className }: IconProps) {
  const icon = icons[name];
  if (!icon) return null;

  return (
    <svg
      className={className}
      viewBox={icon.viewBox}
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
