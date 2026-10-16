import { useEffect, useRef } from "react";
import ClientPreview from "../client-preview";
import type { PreviewIcons, PreviewLabels } from "../client-preview/types";
import { Autoplay, useFramePlaying, type Cue } from "./frame";

/**
 * The client preview that plays itself inside a `Frame`: a pretend mouse presses the preview's own
 * proxy and routing tiles, so it switches exactly as if clicked. `onCycle` fires every few seconds
 * while it plays, for hosts that want to restyle it as they go.
 */
export default function PlayingPreview({
  preview,
  scheme,
  onCycle,
}: {
  preview: { labels: PreviewLabels; icons: PreviewIcons };
  scheme?: "material";
  onCycle?: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const playing = useFramePlaying();
  const cycle = useRef(onCycle);
  cycle.current = onCycle;

  const cycling = !!onCycle;
  useEffect(() => {
    if (!playing || !cycling) return;
    const timer = window.setInterval(() => cycle.current?.(), 3400);
    return () => window.clearInterval(timer);
  }, [playing, cycling]);

  const press = (selector: string) => () =>
    root.current?.querySelector<HTMLElement>(selector)?.click();
  const mode = (index: number) => `.cp-mode-card .cp-tile:nth-child(${index})`;
  const toggle = (index: number) => `.cp-proxy-card .cp-tile:nth-child(${index})`;
  const script: Cue[] = [
    { at: mode(2), run: press(mode(2)), hold: 2000 },
    { at: toggle(2), run: press(toggle(2)), hold: 1800 },
    { at: mode(3), run: press(mode(3)), hold: 2000 },
    { at: toggle(2), run: press(toggle(2)), hold: 1400 },
    { at: mode(1), run: press(mode(1)), hold: 2200 },
  ];

  return (
    <div ref={root}>
      <ClientPreview labels={preview.labels} icons={preview.icons} scheme={scheme} />
      <Autoplay script={script} />
    </div>
  );
}
