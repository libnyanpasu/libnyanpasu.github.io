import { ThemeProvider } from "@/components/theme";
import ThemeToggle from "@/components/ui/theme-toggle";
import HomePage from "@/components/home/home-page";
import type { Locale } from "@/paraglide/runtime";
import type { ReactNode } from "react";

export default function HomeApp({ locale, children }: { locale: Locale; children?: ReactNode }) {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <HomePage locale={locale} headerControls={children} />
    </ThemeProvider>
  );
}
