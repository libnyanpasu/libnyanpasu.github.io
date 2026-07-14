import { NeuroNoise } from "@paper-design/shaders-react";

export default function HomeBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 block h-dvh w-dvw bg-mixed-background dark:bg-black"
      data-slot="background"
    >
      <NeuroNoise
        className="size-full opacity-30 dark:opacity-80"
        colorFront="#ffffff"
        colorMid="#1867C0"
        colorBack="#00000000"
        brightness={0.01}
        contrast={0.3}
        speed={0.18}
      />
    </div>
  );
}
