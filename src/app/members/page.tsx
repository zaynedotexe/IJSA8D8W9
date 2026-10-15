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
  const display = m.nickname || m.globalName || m.username;
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
    <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-center">
      <Link
          href={"/" + encodeURIComponent(m.username || m.id)}
        className={"group flex items-center gap-4 md:col-span-4 " + (artFirst ? "md:order-2" : "md:order-1")}
      >
        {m.avatar ? (
          <img
            src={m.avatar}
            alt={display}
            loading="lazy"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border border-line shrink-0 transition-transform duration-500 group-hover:scale-105"
            style={glow(m.glowColor, 0.9) ? { boxShadow: "0 0 18px 4px " + glow(m.glowColor, 0.9) } : undefined}
          />
        ) : (
          <span className="w-16 h-16 md:w-20 md:h-20 rounded-full grid place-items-center border border-line bg-[#0b0b0b] font-display text-3xl shrink-0">
            {display.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 text-left">
          <span className="font-display text-2xl md:text-4xl tracking-wide block truncate">{display}</span>
          <span className="mono text-[10px] md:text-[11px] tracking-[0.2em] text-mist mt-1 block truncate">@{m.username}</span>
          <span className="mono text-[10px] tracking-[0.2em] text-fog mt-1 hidden md:flex flex-wrap gap-1.5">
            {m.roles.slice(0, 3).map((r) => (
              <span key={r.roleId} className="border border-line rounded-full px-2.5 py-0.5 flex items-center gap-1">
                <RoleIcon roleId={r.roleId} icon={r.icon} emoji={r.unicodeEmoji} size={11} />
                {r.name}
              </span>
            ))}
          </span>
        </span>
      </Link>
      <div ref={cardRef} className={"md:col-span-8 md:[perspective:1400px] " + (artFirst ? "md:order-1" : "md:order-2")}>
        <Link
        href={"/" + encodeURIComponent(m.username || m.id)}
          aria-label={"Open " + display + "'s profile"}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className={
            "group relative block w-full h-64 md:h-[380px] rounded-[28px] border border-white/10 overflow-hidden transition-transform duration-500 ease-out " +
            "md:hover:[transform:rotateY(0deg)_rotateX(0deg)_translateY(-6px)] " +
            (artFirst ? "md:[transform:rotateY(5deg)_rotateX(1deg)]" : "md:[transform:rotateY(-5deg)_rotateX(1deg)]")
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

  useEffect(() => {
    setLoading(true);
    fetch("/api/members?page=1&limit=100", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members || []);
        setTotal(d.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden">
        <CodeTexture lines={["$ enum index", "> resolving identities", "[ok] hierarchy loaded", "0xMEMBERS"]} />
        <div className="relative px-5 md:px-10 pt-14 md:pt-20 pb-8 max-w-6xl">
          <div className="mono text-[11px] tracking-[0.45em] text-fog">DIRECTORY — {loading ? "···" : total + " SIGNAL" + (total === 1 ? "" : "S")}</div>
          <h1 className="font-display text-6xl md:text-8xl mt-3 leading-[0.9]">
            MEM<span className="text-outline">BERS</span>
          </h1>
        </div>
      </section>

      <section className="px-5 md:px-10 pb-20 max-w-6xl">
        <div className="border-t border-line pt-10 flex flex-col gap-10 md:gap-14">
          {loading ? (
            [0, 1].map((i) => (
              <div key={i} className="w-full md:w-[68%] rounded-[28px] border border-line overflow-hidden animate-pulse">
                <div className="h-64 md:h-80 bg-[#101010]" />
                <div className="p-6 bg-black flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#141414]" />
                  <div className="flex-1">
                    <div className="h-7 w-48 bg-[#141414] rounded-full" />
                    <div className="h-3 w-28 bg-[#101010] rounded-full mt-2" />
                  </div>
                </div>
              </div>
            ))
          ) : members.length === 0 ? (
            <div className="py-20 text-center">
              <div className="font-display text-3xl text-outline-faint">NO SIGNAL</div>
              <div className="text-fog text-sm mt-3">The index is empty — check back soon.</div>
            </div>
          ) : (
            members.map((m, i) => <StackCard key={m.id} m={m} index={i} total={total} />)
          )}
        </div>
      </section>
    </div>
  );
}
