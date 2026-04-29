import { cn } from "@/lib/utils";
import { m } from "@/paraglide/messages";
import { useWindowScroll } from "react-use";
import LocalizeLink from "../localize-link";
import { Button } from "../ui/button";
import ShinyText from "../ui/shiny-text";

export default function HomeHeader() {
  const { y } = useWindowScroll();

  const isTop = y < 10;

  const nav = [
    { label: m.home_nav_introduction(), href: `/introduction/` },
    { label: m.home_nav_tutorial(), href: `/tutorial/install/` },
    { label: m.home_nav_faq(), href: `/others/faq/` },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-16",
        "flex-wrap items-start gap-4 px-4 py-3",
        "transition-all duration-300",
        "data-[top=false]:bg-mixed-background/50",
        "data-[top=false]:backdrop-blur-xl",
        "md:flex-nowrap md:items-center lg:px-12",
      )}
      data-top={String(Boolean(isTop))}
    >
      <LocalizeLink
        className="inline-flex min-w-0 items-center gap-3 font-semibold text-on-background no-underline"
        href="/"
      >
        <img className="block size-8 max-w-full" src="/images/logo.png" alt="Clash Nyanpasu Logo" />

        <ShinyText
          text={m.home_eyebrow()}
          className="text-base sm:text-lg"
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

      <nav
        className="order-3 flex w-full gap-1 overflow-x-auto md:order-0 md:ml-auto md:w-auto"
        aria-label="Primary"
      >
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
    </header>
  );
}
