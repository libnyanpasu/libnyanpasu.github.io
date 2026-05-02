import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useWindowScroll } from "react-use";
import LocalizeLink from "../localize-link";
import { Button } from "../ui/button";
import ShinyText from "../ui/shiny-text";

export default function HomeHeader({ children }: { children?: ReactNode }) {
  const { y } = useWindowScroll();
  const [menuOpen, setMenuOpen] = useState(false);

  const isTop = y < 10;

  const nav = [
    { label: m.home_nav_introduction(), href: `/introduction/` },
    { label: m.home_nav_tutorial(), href: `/tutorial/install/` },
    { label: m.home_nav_faq(), href: `/others/faq/` },
  ];

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-10 isolate flex h-16 items-center gap-3",
        "px-4 py-3",
        "transition-all duration-300",
        "data-[top=false]:bg-mixed-background/50",
        "data-[top=false]:backdrop-blur-xl",
        "lg:px-12",
      )}
      data-top={String(Boolean(isTop))}
    >
      <LocalizeLink
        className="inline-flex min-w-0 flex-1 items-center gap-3 font-semibold text-on-background no-underline md:flex-none"
        href="/"
      >
        <img className="block size-8 max-w-full" src="/images/logo.png" alt="Clash Nyanpasu Logo" />

        <ShinyText
          text={m.home_eyebrow()}
          className="hidden text-base sm:inline-block sm:text-lg"
          speed={2}
          delay={0}
          color="#b5b5b5"
          shineColor="#ffffff"
          spread={120}
          direction="left"
          yoyo={false}
          pauseOnHover={false}
          disabled={false}
        />
      </LocalizeLink>

      <nav className="ml-auto hidden gap-1 md:flex" aria-label="Primary">
        {nav.map((item) => (
          <Button key={item.href} asChild>
            <LocalizeLink
              className={cn(
                "no-underline grid shrink-0 place-items-center",
                "hover:bg-primary-container/30 dark:hover:bg-surface-variant/30",
                "hover:backdrop-blur",
              )}
              href={item.href}
            >
              {item.label}
            </LocalizeLink>
          </Button>
        ))}
      </nav>

      {children && (
        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">{children}</div>
      )}

      <Button
        className="grid place-items-center md:hidden"
        icon
        type="button"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="home-mobile-nav"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="relative block size-5" aria-hidden="true">
          <motion.span
            className="absolute left-0 top-1.25 block h-0.5 w-5 rounded-full bg-current"
            animate={menuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />
          <motion.span
            className="absolute left-0 top-3.25 block h-0.5 w-5 rounded-full bg-current"
            animate={menuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />
        </span>
      </Button>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              className="fixed inset-x-0 bottom-0 top-16 z-0 bg-black/20 backdrop-blur-[2px] md:hidden"
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.nav
              id="home-mobile-nav"
              className={cn(
                "absolute left-4 right-4 top-[calc(100%+0.5rem)] z-10 md:hidden",
                "overflow-hidden rounded-2xl border border-outline-variant",
                "bg-surface/95 shadow-[0_18px_48px_rgb(0_0_0/18%)] backdrop-blur-xl",
              )}
              aria-label="Primary"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {nav.map((item) => (
                <Button className="h-12 w-full justify-start rounded-none" key={item.href} asChild>
                  <LocalizeLink
                    className="flex items-center px-4 text-base no-underline"
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </LocalizeLink>
                </Button>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
