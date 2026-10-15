"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TypewriterBio from "@/components/TypewriterBio";
import MusicPlayer from "@/components/MusicPlayer";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import LoadingScreen from "@/components/LoadingScreen";

type Profile = {
  id: string;
  identity: string;
  bio: string;
  backgroundUrl: string | null;
  musicUrl: string | null;
  location: string | null;
  timezone: string | null;
  views: number;
  username: string | null;
  globalName: string | null;
  avatar: string | null;
  nickname: string | null;
  affiliation: { name: string; description: string; logoUrl?: string | null; externalUrl?: string | null } | null;
};

function localTime(tz: string | null): string {
  if (!tz) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(new Date());
  } catch {
    return "";
  }
}

function localDate(tz: string | null): string {
  if (!tz) return "";
  try {
    const d = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: tz }).format(new Date());
    const off = new Intl.DateTimeFormat("en-US", { timeZoneName: "shortOffset", timeZone: tz }).formatToParts(new Date()).find((p) => p.type === "timeZoneName")?.value || "";
    return d + (off ? " " + off.toLowerCase().replace("gmt", "gmt") : "");
  } catch {
    return "";
  }
}

export default function MemberPage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<{ roleId: string; name: string }[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [missing, setMissing] = useState(false);
  const [bgOk, setBgOk] = useState(true);
  const [clock, setClock] = useState("");
  const [today, setToday] = useState("");

  useEffect(() => {
    fetch("/api/profiles/" + params.id, { cache: "no-store" })
      .then((r) => {
        if (r.status === 404) {
          setMissing(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setProfile(d.profile);
        setRoles(d.roles || []);
        setCount(d.profile.views);
      })
      .catch(() => setMissing(true));
    fetch("/api/views/profile/" + params.id, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.count === "number") setCount(d.count);
      })
      .catch(() => {});
  }, [params.id]);

  useEffect(() => {
    if (!profile?.timezone) return;
    const update = () => {
      setClock(localTime(profile.timezone));
      setToday(localDate(profile.timezone));
    };
    update();
    const t = window.setInterval(update, 10000);
    return () => window.clearInterval(t);
  }, [profile?.timezone]);

  if (missing) {
    return (
      <div className="px-5 py-24 text-center max-w-3xl mx-auto">
        <div className="font-display text-4xl text-outline-faint">SIGNAL LOST</div>
        <div className="mono text-xs tracking-[0.3em] text-mist mt-3">404 — PROFILE NOT FOUND</div>
        <Link href="/members" className="mono text-xs tracking-widest text-white border border-line rounded-full px-6 py-3 inline-block mt-8 hover:border-white">BACK TO MEMBERS</Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <LoadingScreen label="LOADING PROFILE" />
        <div className="px-5 py-24 mono text-xs tracking-widest text-mist max-w-3xl mx-auto">ESTABLISHING CONNECTION...</div>
      </div>
    );
  }

  const display = profile.nickname || profile.globalName || profile.username || "UNKNOWN";
  const showBg = profile.backgroundUrl && bgOk;

  return (
    <div className="relative isolate overflow-hidden">
      <ProfileViewTracker id={profile.id} />
      {showBg ? (
        <div className="fixed inset-0 z-0">
          <img src={profile.backgroundUrl!} alt="" loading="eager" referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={() => setBgOk(false)} />
          <div className="absolute inset-0 bg-black/80" />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 bg-[#050505] bg-grid" />
      )}
      <img src="/lonestar-emblem.png" alt="" aria-hidden="true" className="pointer-events-none fixed -right-10 top-16 w-56 opacity-[0.07] rotate-12 z-0 hidden md:block" />
      <img src="/lonestar-emblem.png" alt="" aria-hidden="true" className="pointer-events-none fixed -left-12 bottom-24 w-64 opacity-[0.07] -rotate-12 z-0 hidden md:block" />

      <div className="relative z-10 px-4 md:px-8 pt-6 pb-14 max-w-6xl mx-auto min-h-[88vh] flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <Link href="/members" className="mono text-[11px] tracking-widest text-mist hover:text-white">← DIRECTORY</Link>
          <span className="mono text-[10px] tracking-[0.3em] text-mist hidden sm:inline">lonestar@network:~<span className="caret-blink">█</span></span>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr_280px] gap-5 mt-8 items-center">
          <aside className="rounded-3xl border border-line bg-black/90 backdrop-blur p-6 text-center lg:-rotate-2 lg:hover:rotate-0 transition-transform duration-300 order-2 lg:order-1">
            <div className="mono text-[10px] tracking-[0.35em] text-mist">♪ NOW PLAYING</div>
            <div className="mt-4 text-left">
              <MusicPlayer url={profile.musicUrl} />
            </div>
            <div className="border-t border-line mt-5 pt-5">
              <div className="mono text-[11px] tracking-[0.2em] text-fog">{profile.location ? "◉ " + profile.location.toLowerCase() : "◉ undisclosed"}</div>
              {profile.timezone ? (
                <div className="font-display text-4xl mt-2 tabular-nums">{clock || "--:--"}</div>
              ) : null}
              {today ? <div className="mono text-[11px] tracking-[0.2em] text-mist mt-2">◷ {today}</div> : null}
            </div>
          </aside>

          <section className="text-center px-2 order-1 lg:order-2">
            <div className="relative inline-block">
              {profile.avatar ? (
                <img src={profile.avatar} alt={display} className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover ring-2 ring-white/80 ring-offset-8 ring-offset-black mx-auto" />
              ) : (
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-full grid place-items-center border border-line font-display text-6xl bg-[#0b0b0b] mx-auto">{display.slice(0, 1).toUpperCase()}</div>
              )}
              <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white border-4 border-black" aria-label="online" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl tracking-wide mt-6 break-words leading-none">{display}</h1>
            <div className="mono text-xs tracking-[0.25em] text-mist mt-3">@{profile.username}</div>
            <div className="mono text-[11px] tracking-[0.2em] text-fog mt-1">{profile.identity}</div>
            <div className="mono text-sm leading-relaxed mt-5 min-h-[2.5rem] whitespace-pre-wrap break-words max-w-md mx-auto">
              <TypewriterBio bio={profile.bio} />
            </div>
            <div className="mono text-[11px] tracking-[0.25em] text-fog mt-4">
              ◉ {count === null ? "—" : count.toLocaleString()} VIEWS
            </div>
            {roles.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-1.5 mt-5">
                {roles.map((r) => (
                  <span key={r.roleId} className="mono text-[10px] tracking-[0.2em] bg-white text-black rounded-full px-3.5 py-1.5">{r.name}</span>
                ))}
              </div>
            ) : null}
          </section>

          <aside className="rounded-3xl border border-line bg-black/90 backdrop-blur p-5 lg:rotate-2 lg:hover:rotate-0 transition-transform duration-300 order-3">
            {profile.affiliation ? (
              <Link href="/affiliations" className="group block rounded-2xl overflow-hidden border border-line hover:border-white transition-colors">
                {profile.affiliation.logoUrl ? (
                  <img src={profile.affiliation.logoUrl} alt={profile.affiliation.name} loading="lazy" className="w-full h-36 object-cover grayscale" />
                ) : (
                  <div className="w-full h-36 grid place-items-center bg-[#0b0b0b] font-display text-4xl">{profile.affiliation.name.slice(0, 1)}</div>
                )}
                <div className="p-4 text-left">
                  <div className="font-display tracking-wide leading-tight">{profile.affiliation.name}</div>
                  <div className="text-fog text-xs mt-1 line-clamp-2">{profile.affiliation.description}</div>
                  <div className="mono text-[10px] tracking-[0.25em] text-mist mt-2">AFFILIATED →</div>
                </div>
              </Link>
            ) : null}
            <Link href="/" className="group block rounded-2xl overflow-hidden border border-line hover:border-white transition-colors mt-4">
              <img src="/lonestar-wordmark.png" alt="Lonestar" loading="lazy" className="w-full h-28 object-contain bg-[#0b0b0b] p-4" />
              <div className="p-4 text-left">
                <div className="font-display tracking-wide leading-tight">LONESTAR</div>
                <div className="text-fog text-xs mt-1">Underground digital collective.</div>
                <div className="mono text-[10px] tracking-[0.25em] text-mist mt-2">HOME →</div>
              </div>
            </Link>
          </aside>
        </div>

        <div className="mono text-[10px] tracking-[0.35em] text-mist mt-10 text-center">LONESTAR ON TOP — MADE BY EGO</div>
      </div>
    </div>
  );
}
