import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function usePreviewState() {
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useInView(rootRef, { amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const [systemProxy, setSystemProxy] = useState(true);
  const [tunMode, setTunMode] = useState(false);
  const [proxyMode, setProxyMode] = useState<"rule" | "global" | "direct">("rule");

  useEffect(() => {
    if (!visible || reducedMotion) return;
    const timer = window.setInterval(() => setFrame((value) => value + 1), 1400);
    return () => window.clearInterval(timer);
  }, [reducedMotion, visible]);

  return {
    rootRef,
    frame,
    systemProxy,
    setSystemProxy,
    tunMode,
    setTunMode,
    proxyMode,
    setProxyMode,
    reduceMotion: Boolean(reducedMotion),
  };
}

export type PreviewState = ReturnType<typeof usePreviewState>;
