import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Locale } from "@/paraglide/runtime";
import "./home-header.css";

interface NavItem {
  label: string;
  href: string;
  icon?: { body: string; viewBox: string };
}

export default function HomeHeader({
  logoHref,
  navItems,
  children,
  locale = "en",
}: {
  logoHref: string;
  navItems: NavItem[];
  children?: ReactNode;
  locale?: Locale;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isChinese = locale === "zh-cn";
  const navLabel = isChinese ? "主导航" : "Primary navigation";
  const closeLabel = isChinese ? "关闭导航菜单" : "Close navigation menu";
  const openLabel = isChinese ? "打开导航菜单" : "Open navigation menu";
  const motionTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.7 };

  useEffect(() => {
    setEnhanced(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuTriggerRef.current?.focus({ preventScroll: true });
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        const target = event.target;
        const targetIsFocusable =
          target instanceof Element &&
          target.closest("a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])");
        if (!targetIsFocusable) {
          menuTriggerRef.current?.focus({ preventScroll: true });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 64rem)");
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;

      const focusWasInMenu = mobileMenuRef.current?.contains(document.activeElement);
      setMenuOpen(false);
      if (focusWasInMenu) {
        requestAnimationFrame(() => {
          desktopNavRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
        });
      }
    };

    desktopQuery.addEventListener("change", handleBreakpointChange);
    return () => desktopQuery.removeEventListener("change", handleBreakpointChange);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const frame = requestAnimationFrame(() => {
      headerRef.current
        ?.querySelector<HTMLElement>(".home-header__mobile-menu a")
        ?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [menuOpen]);

  const closeAfterNavigation = () => {
    setMenuOpen(false);
  };

  const renderLinks = (className: string, closeOnClick = false) =>
    navItems.map((item) => (
      <a
        className={className}
        data-download={String(item.href === "#download")}
        href={item.href}
        key={item.href}
        onClick={closeOnClick ? closeAfterNavigation : undefined}
      >
        {item.icon && (
          <svg
            width="1em"
            height="1em"
            viewBox={item.icon.viewBox}
            aria-hidden="true"
            focusable="false"
            dangerouslySetInnerHTML={{ __html: item.icon.body }}
          />
        )}
        {item.label}
      </a>
    ));

  return (
    <header
      className="home-header"
      data-enhanced={String(enhanced)}
      data-menu-open={String(menuOpen)}
      ref={headerRef}
    >
      <div className="home-header__inner">
        <a className="home-header__brand" href={logoHref}>
          <img src="/images/logo.png" alt="" width="34" height="34" />
          <span className="home-header__brand-full">Clash Nyanpasu</span>
          <span className="home-header__brand-short">Nyanpasu</span>
        </a>

        <nav className="home-header__desktop-nav" aria-label={navLabel} ref={desktopNavRef}>
          {renderLinks("home-header__link")}
        </nav>

        {children && <div className="home-header__controls">{children}</div>}

        <button
          aria-controls="home-mobile-nav"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? closeLabel : openLabel}
          className="home-header__menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          ref={menuTriggerRef}
          type="button"
        >
          <span className="home-header__menu-icon" aria-hidden="true">
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="home-header__menu-line"
              transition={motionTransition}
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="home-header__menu-line"
              transition={motionTransition}
            />
          </span>
        </button>
      </div>

      <nav className="home-header__mobile-fallback" aria-label={navLabel}>
        {renderLinks("home-header__link")}
      </nav>

      <AnimatePresence initial={false}>
        {enhanced && menuOpen && (
          <motion.nav
            animate={{ opacity: 1, y: 0 }}
            aria-label={navLabel}
            className="home-header__mobile-menu"
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            id="home-mobile-nav"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            key="mobile-menu"
            transition={motionTransition}
            ref={mobileMenuRef}
          >
            {renderLinks("home-header__mobile-link", true)}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
