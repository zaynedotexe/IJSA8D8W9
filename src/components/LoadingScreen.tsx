"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen({ label = "LONESTAR" }: { label?: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(false);
      return;
    }
    const t = window.setTimeout(() => setVisible(false), 1100);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black grid place-items-center" aria-hidden="true">
      <div className="text-center animate-enter px-8">
        <img src="/lonestar-wordmark.png" alt={label} className="w-full max-w-md mx-auto" />
        <div className="mono text-[11px] tracking-[0.3em] text-mist mt-6">ENTERING PRIVATE SPACE<span className="caret-blink">_</span></div>
      </div>
    </div>
  );
}
