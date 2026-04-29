import { m } from "@/paraglide/messages.js";
import type { Locale } from "@/paraglide/runtime";
import { NeuroNoise } from "@paper-design/shaders-react";
import HomeHeader from "./home-header";
import { useThemeContext } from "../theme";
import { hexFromArgb } from "@material/material-color-utilities";
import { cn } from "@/lib/utils";
import RotatingText from "../ui/rotating-text";
import { Button } from "../ui/button";
import LocalizeLink from "../localize-link";

interface Link {
  label: string;
  href: string;
}

interface Feature {
  title: string;
  text: string;
}

interface Platform {
  name: string;
  image: string;
}

const platforms: Platform[] = [
  { name: "macOS", image: "/images/banner/macos.jpg" },
  { name: "Windows", image: "/images/banner/windows.webp" },
  { name: "Linux", image: "/images/banner/linux.jpg" },
];

const githubUrl = "https://github.com/libnyanpasu";

export default function HomePage({ locale }: { locale: Locale }) {
  const isZh = locale === "zh-cn";
  const base = isZh ? "/zh-cn" : "";

  const nav: Link[] = [
    { label: m.home_nav_introduction(), href: `${base}/introduction/` },
    { label: m.home_nav_tutorial(), href: `${base}/tutorial/install/` },
    { label: m.home_nav_faq(), href: `${base}/others/faq/` },
  ];

  const stats = [
    [m.home_stat_tauri_value(), m.home_stat_tauri_label()],
    [m.home_stat_md3_value(), m.home_stat_md3_label()],
    [m.home_stat_core_value(), m.home_stat_core_label()],
  ];

  const { themePalette, currentThemeMode } = useThemeContext();

  return (
    <div className="min-h-screen overflow-x-clip">
      <div
        className="fixed inset-0 -z-10 block h-dvh w-dvw bg-mixed-background dark:bg-black"
        data-slot="background"
      >
        <NeuroNoise
          className="size-full opacity-30 dark:opacity-80"
          colorFront="#ffffff"
          colorMid={hexFromArgb(themePalette.schemes[currentThemeMode].primary)}
          colorBack="#00000000"
          brightness={0.01}
          contrast={0.3}
          speed={0.18}
        />
      </div>

      <HomeHeader />

      <main className="overflow-clip">
        <section
          className={cn(
            "min-h-[min(760px,calc(100vh-4rem))] w-[min(1180px,calc(100%-2rem))]",
            "mx-auto grid",
            "grid-cols-1 items-center gap-8 py-12",
            "md:grid-cols-[minmax(0,0.88fr)_minmax(22rem,1.12fr)]",
            "md:py-16 lg:gap-20 lg:py-24",
          )}
        >
          <div>
            <h1 className="mb-5 mt-0 max-w-[12ch] text-[clamp(3.2rem,8vw,6.8rem)] font-semibold leading-[0.94] tracking-normal text-on-background md:max-w-[11ch]">
              {m.home_title()}
            </h1>

            <p className="mt-0 max-w-152 text-[clamp(1.08rem,2vw,1.32rem)] leading-[1.7] text-on-surface-variant">
              {m.home_lead()}{" "}
              <RotatingText
                className="inline-block align-baseline"
                mainClassName="inline-flex"
                splitLevelClassName="inline-flex"
                elementLevelClassName="font-semibold text-on-background"
                texts={[
                  m.home_feature_dashboard_title(),
                  m.home_feature_profiles_title(),
                  m.home_feature_rules_title(),
                ]}
                staggerDuration={0.015}
              />
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                className="no-underline flex items-center text-base h-14 px-12"
                variant="flat"
                asChild
              >
                <LocalizeLink href="/introduction/">{m.home_primary_action()}</LocalizeLink>
              </Button>

              <Button
                className="no-underline flex items-center text-base h-14 px-12 backdrop-blur-xl"
                asChild
              >
                <LocalizeLink href={githubUrl} target="_blank" rel="noopener">
                  {m.home_secondary_action()}
                </LocalizeLink>
              </Button>
            </div>

            <dl className="mt-10 grid max-w-148 grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map(([value, label]) => (
                <div className="border-t border-outline-variant pt-4" key={value}>
                  <dt className="text-base font-extrabold text-on-surface">{value}</dt>

                  <dd className="m-0 mt-1 text-sm leading-normal text-on-surface-variant">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className={cn(
              "relative rounded-2xl border border-outline-variant bg-surface overflow-clip",
              "shadow-[0_24px_80px_rgb(0_0_0/16%)] md:rotate-[-1.5deg]",
            )}
            aria-label="Application preview"
          >
            <img
              className="block aspect-video w-full rounded-2xl object-cover object-top-left dark:hidden"
              src="/images/screenshot/app-dashboard-light.png"
              alt="Clash Nyanpasu dashboard"
            />
            <img
              className="hidden aspect-video w-full rounded-2xl object-cover object-top-left dark:block"
              src="/images/screenshot/app-dashboard-dark.png"
              alt="Clash Nyanpasu dashboard"
            />
          </div>
        </section>

        <section className="mx-auto w-[min(1180px,calc(100%-2rem))] border-t border-outline-variant py-12 md:py-18">
          <div className="mb-6 max-w-176">
            <h2 className="mb-3 mt-0 text-[clamp(1.45rem,3vw,2.1rem)] font-bold leading-[1.12] tracking-normal text-on-surface">
              {m.home_platforms_title()}
            </h2>

            <p className="m-0 leading-relaxed text-on-surface-variant">{m.home_platforms_lead()}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {platforms.map((platform) => (
              <figure
                className="relative m-0 overflow-hidden rounded-lg bg-surface-variant"
                key={platform.name}
              >
                <img
                  className="block aspect-4/3 w-full object-cover"
                  src={platform.image}
                  alt={`${platform.name} banner`}
                  loading="lazy"
                />

                <figcaption className="absolute bottom-3 left-3 rounded-md bg-black/60 px-3 py-2 text-sm font-[780] text-white">
                  {platform.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mx-auto w-[min(1180px,calc(100%-2rem))] border-t border-outline-variant py-12 md:py-18 flex items-start justify-between">
          <div>
            <h2 className="mb-3 mt-0 text-[clamp(1.45rem,3vw,2.1rem)] font-bold leading-[1.12] tracking-normal text-on-surface">
              {m.home_docs_title()}
            </h2>

            <p className="m-0 leading-relaxed text-on-surface-variant">{m.home_docs_lead()}</p>
          </div>

          <Button
            className="no-underline flex items-center justify-center text-base font-bold"
            variant="fab"
            asChild
          >
            <LocalizeLink href="/tutorial/install/">{nav[1].label}</LocalizeLink>
          </Button>
        </section>
      </main>

      <footer className="border-t border-outline-variant p-6 text-center text-on-surface-variant">
        {m.footer_message()}
      </footer>
    </div>
  );
}
