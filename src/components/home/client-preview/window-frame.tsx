import type { ReactNode } from "react";
import { PreviewIcon } from "./icon";
import type { PreviewIcons } from "./types";

const navigation = [
  ["layout-dashboard", "dashboard"],
  ["globe", "proxies"],
  ["layout-grid", "profiles"],
  ["unplug", "connections"],
  ["traffic", "traffic"],
  ["wrench", "rules"],
  ["square-terminal", "logs"],
  ["settings", "settings"],
  ["grip", "providers"],
] as const;

export function WindowFrame({
  children,
  labels,
  icons,
}: {
  children: ReactNode;
  labels: Record<string, string>;
  icons: PreviewIcons;
}) {
  return (
    <section className="cp-window" aria-label={labels.clientLabel}>
      <header className="cp-titlebar">
        <div className="cp-traffic-lights" aria-hidden="true">
          <i data-color="close" />
          <i data-color="minimize" />
          <i data-color="zoom" />
        </div>
        <div className="cp-menus" aria-hidden="true">
          <span>{labels.file}</span>
          <span>{labels.settings}</span>
          <span>{labels.help}</span>
        </div>
        <div className="cp-brand">
          <img src="/images/logo.png" alt="" />
          <strong>Clash Nyanpasu</strong>
        </div>
      </header>
      <nav className="cp-nav" aria-label={labels.navLabel}>
        {navigation.map(([icon, key], index) => (
          <button
            type="button"
            key={key}
            className="cp-nav-item"
            data-active={index === 0}
            disabled={index !== 0}
            aria-current={index === 0 ? "page" : undefined}
            title={index === 0 ? undefined : labels.comingSoon}
          >
            <PreviewIcon icons={icons} name={icon} />
            <span>{labels[key]}</span>
          </button>
        ))}
      </nav>
      {children}
      <span className="cp-drawer-tab" aria-hidden="true">
        <PreviewIcon icons={icons} name="chevron" />
      </span>
    </section>
  );
}
