"use client";

import { useEffect, useState } from "react";

const BYPASS_KEY = "lonestar-ego-shield";
const BYPASS_PARAM = "ddtk";

function bypassed(): boolean {
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.get(BYPASS_PARAM) === BYPASS_KEY) {
      try {
        window.sessionStorage.setItem("lonestar-shield-off", "1");
      } catch {}
      return true;
    }
    try {
      return window.sessionStorage.getItem("lonestar-shield-off") === "1";
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

export default function Deterrent() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (bypassed()) return;
    let triggered = false;
    const fine = window.matchMedia("(pointer: fine)").matches;
    function trip() {
      if (triggered || bypassed()) return;
      triggered = true;
      try {
        console.clear();
      } catch {}
      setBlocked(true);
    }
    function onMenu(e: Event) {
      if (!fine) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
    }
    function onKeys(e: KeyboardEvent) {
      const k = (e.key || "").toLowerCase();
      const code = e.keyCode || 0;
      if (
        code === 123 ||
        (e.ctrlKey && e.shiftKey && (k === "i" || k === "j" || k === "c" || k === "k")) ||
        (e.metaKey && e.altKey && (k === "i" || k === "j" || k === "c")) ||
        (e.ctrlKey && (k === "u" || k === "s")) ||
        (e.metaKey && (k === "u" || k === "s"))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    const sizeTimer = window.setInterval(() => {
      if (triggered) return;
      try {
        if (!window.outerWidth || !window.innerWidth) return;
        const w = Math.abs(window.outerWidth - window.innerWidth);
        const h = Math.abs(window.outerHeight - window.innerHeight);
        if (w > 220 || h > 220) trip();
      } catch {}
    }, 900);
    const debugTimer = window.setInterval(() => {
      if (triggered) return;
      try {
        const start = performance.now();
        debugger;
        if (performance.now() - start > 140) trip();
      } catch {}
    }, 1800);
    document.addEventListener("contextmenu", onMenu, { capture: true });
    document.addEventListener("keydown", onKeys, { capture: true });
    return () => {
      window.clearInterval(sizeTimer);
      window.clearInterval(debugTimer);
      document.removeEventListener("contextmenu", onMenu, { capture: true });
      document.removeEventListener("keydown", onKeys, { capture: true });
    };
  }, []);

  if (!blocked) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black grid place-items-center px-6 text-center" role="alert">
      <div className="max-w-md">
        <img src="/lonestar-emblem.png" alt="" aria-hidden="true" className="w-16 h-16 rounded-full object-cover border border-line mx-auto" />
        <div className="mono text-[11px] tracking-[0.45em] text-fog mt-6">LONESTAR — PROTECTED</div>
        <div className="font-display text-3xl mt-3">INSPECTION BLOCKED</div>
        <p className="text-fog text-sm mt-3 leading-relaxed">This space is shielded. Close DevTools and reload to continue.</p>
        <button
          onClick={() => window.location.reload()}
          className="mono text-xs tracking-[0.25em] bg-white text-black rounded-full px-8 py-3.5 mt-7 hover:bg-fog transition-colors"
        >
          RELOAD
        </button>
      </div>
    </div>
  );
}
