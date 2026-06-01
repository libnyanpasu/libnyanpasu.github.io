import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useWindowScroll } from "react-use";
import { Button } from "../ui/button";
import ShinyText from "../ui/shiny-text";

interface NavItem {
  label: string;
  href: string;
}

export default function HomeHeader({
  logoHref,
  navItems,
  children,
}: {
  logoHref: string;
  navItems: NavItem[];
  children?: ReactNode;
}) {
  const { y } = useWindowScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const isTop = y < 10;
  const isScrolled = !isTop;

  const glassSpring = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 28, mass: 0.82 };
  const ambientTransition = shouldReduceMotion
    ? { duration: 0 }
    : {
        duration: 5.6,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
      };
  const sweepTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 2.8, repeat: Infinity, ease: "easeInOut" as const };

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
      className="sticky top-0 z-30 isolate flex h-16 items-center px-3 sm:px-4"
      data-top={String(Boolean(isTop))}
    >
      <motion.div
        className="relative mx-auto flex h-14 w-full max-w-295 items-center gap-3 px-3 sm:px-4"
        initial={false}
        animate={{
          y: isScrolled ? 6 : 0,
          scale: isScrolled ? 0.992 : 1,
        }}
        transition={glassSpring}
      >
        <motion.div
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[1.75rem]",
            "border border-white/30 bg-mixed-background/60 shadow-[0_18px_60px_rgb(0_0_0/14%)]",
            "dark:border-white/10 dark:bg-mixed-background/50 dark:shadow-[0_18px_70px_rgb(0_0_0/38%)]",
          )}
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: isScrolled || menuOpen ? 1 : 0,
            scaleX: isScrolled || menuOpen ? 1 : 1.035,
            backdropFilter:
              isScrolled || menuOpen
                ? "blur(28px) saturate(1.45) brightness(1.04)"
                : "blur(0px) saturate(1) brightness(1)",
          }}
          transition={glassSpring}
        >
          <motion.span
            className="absolute -left-12 -top-8 size-32 rounded-full bg-primary/20 blur-2xl dark:bg-primary/30"
            animate={
              isScrolled || menuOpen
                ? { opacity: [0.25, 0.58], x: [-14, 22], y: [0, 6] }
                : { opacity: 0, x: -14, y: 0 }
            }
            transition={ambientTransition}
          />
          <motion.span
            className="absolute -right-10 -top-10 size-36 rounded-full bg-tertiary/20 blur-2xl dark:bg-secondary/20"
            animate={
              isScrolled || menuOpen
                ? { opacity: [0.18, 0.52], x: [18, -18], y: [4, -2] }
                : { opacity: 0, x: 18, y: 4 }
            }
            transition={ambientTransition}
          />
          <motion.span
            className={cn(
              "absolute inset-y-0 w-28 rotate-12",
              "bg-gradient-to-r from-transparent via-white/40 to-transparent",
              "dark:via-white/20",
            )}
            animate={
              isScrolled || menuOpen
                ? { opacity: [0, 0.85, 0], x: ["-45%", "118%"] }
                : { opacity: 0, x: "-45%" }
            }
            transition={sweepTransition}
          />
        </motion.div>

        <motion.span
          className="pointer-events-none absolute inset-x-5 bottom-0 -z-10 h-px overflow-hidden rounded-full bg-outline-variant/60"
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: isScrolled || menuOpen ? 1 : 0,
            scaleX: isScrolled || menuOpen ? 1 : 0.72,
          }}
          transition={glassSpring}
        >
          <motion.span
            className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-transparent via-primary to-transparent"
            animate={
              isScrolled || menuOpen
                ? { x: ["-120%", "420%"], opacity: [0, 1, 0] }
                : { x: "-120%", opacity: 0 }
            }
            transition={sweepTransition}
          />
        </motion.span>

        <a
          className="inline-flex min-w-0 flex-1 items-center gap-3 font-semibold text-on-background no-underline md:flex-none"
          href={logoHref}
        >
          <motion.img
            className="block size-8 max-w-full"
            src="/images/logo.png"
            alt="Clash Nyanpasu Logo"
            initial={false}
            animate={{ rotate: isScrolled && !shouldReduceMotion ? [0, -3, 3, 0] : 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : isScrolled
                  ? { duration: 4.4, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.2 }
            }
          />

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
        </a>

        <nav className="ml-auto hidden gap-1 md:flex" aria-label="Primary">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={false}
              animate={{
                y: isScrolled ? 0 : 1,
                opacity: 1,
                transition: shouldReduceMotion
                  ? { duration: 0 }
                  : { delay: isScrolled ? index * 0.035 : 0, duration: 0.22, ease: "easeOut" },
              }}
              whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.035 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
            >
              <Button asChild>
                <a
                  className={cn(
                    "grid shrink-0 place-items-center no-underline",
                    "transition-[background-color,box-shadow,color] duration-300",
                    "hover:bg-primary-container/30 dark:hover:bg-surface-variant/30",
                    "hover:shadow-[0_8px_28px_rgb(0_0_0/10%)]",
                    "hover:backdrop-blur-md",
                  )}
                  href={item.href}
                >
                  {item.label}
                </a>
              </Button>
            </motion.div>
          ))}
        </nav>

        {children && (
          <motion.div
            className="ml-auto flex shrink-0 items-center gap-2 md:ml-0"
            initial={false}
            animate={{ y: isScrolled ? 0 : 1 }}
            transition={glassSpring}
          >
            {children}
          </motion.div>
        )}

        <Button
          className={cn(
            "grid place-items-center md:hidden",
            "transition-[background-color,box-shadow] duration-300",
            "data-[scrolled=true]:bg-primary-container/40 data-[scrolled=true]:shadow-[0_8px_28px_rgb(0_0_0/12%)]",
          )}
          data-scrolled={String(Boolean(isScrolled || menuOpen))}
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
                className="fixed inset-x-0 bottom-0 top-16 z-0 bg-black/20 backdrop-blur-[3px] md:hidden"
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
                  "absolute left-0 right-0 top-[calc(100%+0.75rem)] z-10 md:hidden",
                  "overflow-hidden rounded-[1.75rem] border border-white/30 dark:border-white/10",
                  "bg-surface/80 shadow-[0_22px_64px_rgb(0_0_0/22%)] backdrop-blur-[28px]",
                  "dark:bg-mixed-background/70 dark:shadow-[0_22px_70px_rgb(0_0_0/42%)]",
                )}
                aria-label="Primary"
                initial={{ opacity: 0, y: -10, scale: 0.96, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, scale: 0.98, filter: "blur(8px)" }}
                transition={glassSpring}
              >
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { delay: index * 0.035, duration: 0.18, ease: "easeOut" }
                    }
                  >
                    <Button className="h-12 w-full justify-start rounded-none" asChild>
                      <a
                        className="flex items-center px-4 text-base no-underline"
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    </Button>
                  </motion.div>
                ))}
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </header>
  );
}
