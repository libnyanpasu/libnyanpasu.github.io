import { ThemeProvider, useThemeContext } from "@/components/theme";
import ThemeToggle from "@/components/ui/theme-toggle";
import { hexFromArgb } from "@material/material-color-utilities";
import { NeuroNoise } from "@paper-design/shaders-react";

function NeuroNoiseBackground() {
  const { themePalette, currentThemeMode } = useThemeContext();

  return (
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
  );
}

export default function HomeBackground() {
  return (
    <ThemeProvider>
      <ThemeToggle />
      <NeuroNoiseBackground />
    </ThemeProvider>
  );
}
