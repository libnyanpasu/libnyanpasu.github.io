import type { ReactNode } from "react";
import { Icon, type IconData } from "../ui";

export function Stat({
  icon,
  label,
  value,
  wide,
  children,
}: {
  icon: IconData;
  label: string;
  value: string;
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="tr-stat" data-wide={wide || undefined}>
      <span className="tr-stat-icon">
        <Icon icon={icon} />
      </span>
      <span className="tr-stat-text">
        <small>{label}</small>
        <span className="tr-stat-figure">
          <b>{value}</b>
          {children}
        </span>
      </span>
    </div>
  );
}
