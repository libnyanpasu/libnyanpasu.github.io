import type { PreviewIcons, PreviewLabels } from "../client-preview/types";
import { Frame } from "./frame";
import PlayingPreview from "./playing-preview";

/** The hero's client window, played by the same pretend mouse as the Material You card. */
export default function HeroPreview({
  labels,
  icons,
}: {
  labels: PreviewLabels;
  icons: PreviewIcons;
}) {
  return (
    <Frame>
      <PlayingPreview preview={{ labels, icons }} />
    </Frame>
  );
}
