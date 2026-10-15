"use client";

import { useEffect, useState } from "react";
import { LOOP_PHRASE } from "@/lib/site";

export default function TypewriterBio({ bio }: { bio: string }) {
  const [text, setText] = useState("");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) {
      setText(bio || LOOP_PHRASE);
      return;
    }
    const safeBio = bio || "No transmission yet.";
    let phase: number = 0;
    let idx = 0;
    let timer: number | undefined;
    const typeSpeed = 42;
    const holdMs = 2600;
    const clearPause = 500;

    function step() {
      const target = phase === 0 ? safeBio : LOOP_PHRASE;
      if (idx <= target.length) {
        setText(target.slice(0, idx));
        idx += 1;
        timer = window.setTimeout(step, typeSpeed);
      } else {
        timer = window.setTimeout(() => {
          if (phase === 0) {
            phase = 1;
            idx = 0;
            timer = window.setTimeout(step, clearPause);
          } else {
            phase = 0;
            idx = 0;
            timer = window.setTimeout(step, clearPause);
          }
        }, holdMs);
      }
    }
    step();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [bio, reduced]);

  return (
    <span>
      {text}
      <span className="caret-blink" aria-hidden="true">▌</span>
    </span>
  );
}
