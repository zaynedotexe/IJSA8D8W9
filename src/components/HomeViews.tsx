"use client";

import { useEffect, useRef, useState } from "react";

export default function HomeViews() {
  const [count, setCount] = useState<number | null>(null);
  const sent = useRef(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/views/home", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive && typeof d.count === "number") setCount(d.count);
      })
      .catch(() => {});
    if (!sent.current) {
      sent.current = true;
      fetch("/api/views/home", { method: "POST", cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (alive && typeof d.count === "number") setCount(d.count);
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, []);

  return (
    <span className="mono text-[11px] tracking-[0.25em] text-fog">
      PAGE VIEWS — {count === null ? "······" : count.toLocaleString()}
    </span>
  );
}
