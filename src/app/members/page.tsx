"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CodeTexture from "@/components/CodeTexture";
import RoleIcon from "@/components/RoleIcon";
import { glow } from "@/lib/glow";
import type { RowMember } from "@/components/MemberRow";

function ytThumb(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1).split("?")[0] || null;
    else if (u.hostname.includes("youtube.com")) id = u.searchParams.get("v");
    return id ? "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg" : null;
  } catch {
    return null;
  }
}

function ytId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0] || null;
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
  } catch {}
  return null;
}

function StackCard({ m, index, total }: { m: RowMember; index: number; total: number }) {
  const display = m.displayName || m.nickname || m.globalName || m.username;
  const artFirst = index % 2 === 1;
  const isVideo = Boolean(m.backgroundUrl && /\.(mp4|webm)(\?.*)?$/i.test(m.backgroundUrl));
  const ytid = m.backgroundUrl && !isVideo ? ytId(m.backgroundUrl) : null;
  const thumb = ytid ? "https://i.ytimg.com/vi/" + ytid + "/hqdefault.jpg" : null;
  const [hovering, setHovering] = useState(false);
  const [mounted, setMounted] = useState(false);
  const vidRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !m.backgroundUrl) return;
    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [m.backgroundUrl]);

  function onEnter() {
    setHovering(true);
    const v = vidRef.current;
    if (v) v.play().catch(() => {});
  }

  function onLeave() {
    setHovering(false);
  }
  return (
    <div className="grid md:grid-cols-12 gap-5 md:gap-0 items-center">
      <Link
          href={"/" + encodeURIComponent(m.username || m.id)}
        className={"group flex items-center gap-4 md:col-span-5 " + (artFirst ? "md:order-2 md:justify-end md:text-right" : "md:order-1")}
      >
        {m.avatar ? (
          <img
            src={m.avatar}
            alt={display}
            loading="lazy"
            className={"w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border border-line shrink-0 transition-transform duration-500 group-hover:scale-105 " + (artFirst ? "md:order-2" : "")}
            style={glow(m.glowColor, 0.9) ? { boxShadow: "0 0 18px 4px " + glow(m.glowColor, 0.9) } : undefined}
          />
        ) : (
          <span className={"w-16 h-16 md:w-20 md:h-20 rounded-full grid place-items-center border border-line bg-[#0b0b0b] font-display text-3xl shrink-0 " + (artFirst ? "md:order-2" : "")}>
            {display.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className={"min-w-0 text-left " + (artFirst ? "md:order-1 md:text-right" : "")}>
          <span className="font-display text-2xl md:text-3xl tracking-wide block break-words" aria-label={display}>
            {display.split("").map((c, i) => (
              <span key={index + "-" + i} className="letter-rise" style={{ animationDelay: Math.min(i, 24) * 28 + "ms" }} aria-hidden="true">
                {c === " " ? " " : c}
              </span>
            ))}
          </span>
          <span className="mono text-[10px] md:text-[11px] tracking-[0.2em] text-mist mt-1 block">@{m.username}</span>
          <span className={"mono text-[10px] tracking-[0.2em] text-fog mt-1 hidden md:flex flex-wrap gap-1.5 " + (artFirst ? "md:justify-end" : "")}>
            {m.roles.slice(0, 3).map((r) => (
              <span key={r.roleId} className="border border-line rounded-full px-2.5 py-0.5 flex items-center gap-1">
                <RoleIcon roleId={r.roleId} icon={r.icon} emoji={r.unicodeEmoji} size={11} />
                {r.name}
              </span>
            ))}
          </span>
        </span>
      </Link>
      <div ref={cardRef} className={"md:col-span-7 md:[perspective:1400px] " + (artFirst ? "md:order-1 md:-mr-12 md:z-10" : "md:order-2 md:-ml-12 md:z-10")}>
        <Link
        href={"/" + encodeURIComponent(m.username || m.id)}
          aria-label={"Open " + display + "'s profile"}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className={
            "group relative block w-full h-64 md:h-[360px] rounded-[28px] border-[6px] border-black overflow-hidden transition-transform duration-500 ease-out " +
            "md:hover:[transform:rotateY(0deg)_rotateX(0deg)_translateY(-6px)] " +
            (artFirst ? "md:[transform:rotateY(8deg)_rotateX(2deg)]" : "md:[transform:rotateY(-8deg)_rotateX(2deg)]")
          }
          style={glow(m.glowColor, 0.35) ? { boxShadow: "0 30px 90px -20px " + glow(m.glowColor, 0.35) } : undefined}
        >
          {m.backgroundUrl ? (
            isVideo ? (
              <video ref={vidRef} src={mounted ? m.backgroundUrl : undefined} muted loop playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <span className="absolute inset-0 block">
                <img src={thumb || m.backgroundUrl} alt="" aria-hidden="true" loading="lazy" referrerPolicy="no-referrer" className={"absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 " + (ytid && mounted && hovering ? "opacity-0" : "opacity-100")} />
                {ytid && mounted ? (
                  <iframe
                    src={"https://www.youtube-nocookie.com/embed/" + ytid + "?autoplay=1&mute=1&loop=1&playlist=" + ytid + "&controls=0&rel=0&playsinline=1"}
                    title=""
                    aria-hidden="true"
                    tabIndex={-1}
                    allow="autoplay; encrypted-media"
                    className={"absolute pointer-events-none transition-opacity duration-500 " + (hovering ? "opacity-100" : "opacity-0")}
                    style={{ width: "130%", height: "130%", left: "-15%", top: "-15%" }}
                  />
                ) : null}
              </span>
            )
          ) : (
            <div className="absolute inset-0 bg-grid opacity-70" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute top-4 right-5 mono text-[10px] tracking-[0.3em] text-white/70">
            MEMBER / {String(index + 1).padStart(2, "0")}
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<RowMember[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [spot, setSpot] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const coolRef = useRef(0);
  const touchRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/members?page=1&limit=100", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members || []);
        setTotal(d.total || 0);
        setSpot(0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (members.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setSpot((s) => (s + 1) % members.length), 8000);
    return () => window.clearInterval(t);
  }, [members, paused]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (members.length < 2) return;
      if (Math.abs(e.deltaY) < 12) return;
      e.preventDefault();
      step(e.deltaY > 0 ? 1 : -1);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [members.length]);

  function step(d: number) {
    if (members.length < 2) return;
    const now = Date.now();
    if (now - coolRef.current < 900) return;
    coolRef.current = now;
    setDir(d >= 0 ? 1 : -1);
    setSpot((s) => (s + d + members.length) % members.length);
  }

  function jump(i: number) {
    if (members.length < 2) return;
    setDir(i >= spot % members.length ? 1 : -1);
    setSpot(i);
  }

  const current = members.length ? members[spot % members.length] : null;

  return (
    <div className="h-[100svh] min-h-[600px] overflow-hidden flex flex-col">
      <section className="relative overflow-hidden shrink-0">
        <CodeTexture lines={["$ enum index", "> resolving identities", "[ok] hierarchy loaded", "0xMEMBERS"]} />
        <div className="relative px-5 md:px-10 pt-6 md:pt-8 pb-3 max-w-6xl flex items-end justify-between gap-4">
          <div>
            <div className="mono text-[11px] tracking-[0.45em] text-fog">DIRECTORY — {loading ? "···" : total + " SIGNAL" + (total === 1 ? "" : "S")}</div>
            <h1 className="font-display text-5xl md:text-7xl mt-2 leading-[0.9]">
              MEM<span className="text-outline">BERS</span>
            </h1>
          </div>
          {current ? (
            <div className="mono text-[11px] tracking-[0.35em] text-mist shrink-0">
              {String((spot % members.length) + 1).padStart(2, "0")} / {String(members.length).padStart(2, "0")}
            </div>
          ) : null}
        </div>
      </section>

      <section
        ref={stageRef}
        className="relative flex-1 flex flex-col justify-center px-5 md:px-10 max-w-6xl w-full mx-auto min-h-0"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          touchRef.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          if (touchRef.current === null) return;
          const dy = touchRef.current - e.changedTouches[0].clientY;
          touchRef.current = null;
          if (Math.abs(dy) < 50) return;
          step(dy > 0 ? 1 : -1);
        }}
      >
        {loading ? (
          <div className="w-full animate-pulse">
            <div className="h-64 md:h-[320px] rounded-[28px] bg-[#101010]" />
          </div>
        ) : !current ? (
          <div className="py-16 text-center">
            <div className="font-display text-3xl text-outline-faint">NO SIGNAL</div>
            <div className="text-fog text-sm mt-3">The index is empty — check back soon.</div>
          </div>
        ) : (
          <div key={current.id} className={dir >= 0 ? "rise" : "fall"}>
            <StackCard m={current} index={spot % members.length} total={total} />
          </div>
        )}
      </section>

      {members.length > 1 ? (
        <div className="shrink-0 flex items-center justify-center pb-6 pt-2 md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2 md:pb-0 md:pt-0">
          <div className="flex items-center gap-2 max-w-[70vw] overflow-x-auto no-scrollbar py-2 md:flex-col md:max-h-[46vh] md:max-w-none md:overflow-y-auto md:overflow-x-hidden md:py-0" role="tablist" aria-label="Members">
            {members.slice(0, 40).map((m, i) => (
              <button
                key={m.id}
                role="tab"
                aria-selected={i === spot % members.length}
                aria-label={(m.nickname || m.username) ?? "member"}
                onClick={() => jump(i)}
                className={
                  "rounded-full shrink-0 transition-all " +
                  (i === spot % members.length
                    ? "w-8 h-2.5 md:w-2.5 md:h-8 bg-white"
                    : "w-2.5 h-2.5 bg-[#2e2e2e] hover:bg-fog")
                }
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
