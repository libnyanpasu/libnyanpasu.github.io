import { ThemeProvider } from "@/components/theme";
import ThemeToggle from "@/components/ui/theme-toggle";
import HomePage from "@/components/home/home-page";
import type { Locale } from "@/paraglide/runtime";

export default function HomeApp({ locale }: { locale: Locale }) {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <HomePage locale={locale} />
    </ThemeProvider>
  );
}
