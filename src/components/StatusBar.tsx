"use client";

import { useEffect, useRef, useState } from "react";

function useClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => {
      try {
        setNow(
          new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date())
        );
      } catch {
        setNow("");
      }
    };
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

export default function StatusBar() {
  const [views, setViews] = useState<number | null>(null);
  const sent = useRef(false);
  const clock = useClock();

  useEffect(() => {
    let alive = true;
    fetch("/api/views/home", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive && typeof d.count === "number") setViews(d.count);
      })
      .catch(() => {});
    if (!sent.current) {
      sent.current = true;
      fetch("/api/views/home", { method: "POST", cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (alive && typeof d.count === "number") setViews(d.count);
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur border-t border-line">
      <div className="md:pl-20">
        <div className="px-5 h-9 flex items-center justify-between gap-4 mono text-[10px] tracking-[0.25em] text-mist">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
            LONESTAR ON TOP
          </span>
          <span className="hidden sm:inline">VIEWS — {views === null ? "···" : views.toLocaleString()}</span>
          <span>{clock} UTC{clock ? "" : ""}</span>
        </div>
      </div>
    </div>
  );
}
