"use client";

import { useEffect, useRef } from "react";

interface Props {
  code: string;
}

export default function Mermaid({ code }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, theme: "default" });
      mermaid.render(`mermaid-${Math.random().toString(36).slice(2)}`, code).then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      });
    });
  }, [code]);

  return <div ref={ref} className="flex justify-center my-4" />;
}
