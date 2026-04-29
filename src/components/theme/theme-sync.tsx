import { ThemeProvider } from "@/components/theme/theme-context";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function ThemeSync() {
  return (
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}
