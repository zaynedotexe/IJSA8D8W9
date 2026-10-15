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
  affiliation: { name: string; description: string; logoUrl?: string | null } | null;
};

function localTime(tz: string | null): string {
  if (!tz) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date());
  } catch {
    return "";
  }
}

function localDate(tz: string | null): string {
  if (!tz) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: tz }).format(new Date());
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
    <div className="relative isolate">
      <ProfileViewTracker id={profile.id} />
      {showBg ? (
        <div className="fixed inset-0 z-0">
          <img src={profile.backgroundUrl!} alt="" loading="eager" referrerPolicy="no-referrer" className="w-full h-full object-cover" onError={() => setBgOk(false)} />
          <div className="absolute inset-0 bg-black/75" />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 bg-[#050505] bg-grid" />
      )}
      <div className="relative z-10 px-4 md:px-10 py-8 md:py-12 max-w-3xl mx-auto">
        <Link href="/members" className="mono text-[11px] tracking-widest text-mist hover:text-white">← DIRECTORY</Link>

        <div className="mt-5 rounded-3xl border border-line bg-black/90 backdrop-blur overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-line">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" aria-hidden="true" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" aria-hidden="true" />
            <span className="w-2.5 h-2.5 rounded-full bg-white" aria-hidden="true" />
            <span className="mono text-[11px] tracking-[0.2em] text-fog ml-3 truncate">
              lonestar@network:~<span className="caret-blink">█</span>
            </span>
            <span className="mono text-[10px] tracking-[0.25em] text-mist ml-auto shrink-0 hidden sm:inline">
              {count === null ? "—" : count.toLocaleString()} VIEWS
            </span>
          </div>

          <div className="p-6 md:p-9">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative shrink-0">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={display} className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-2 ring-white/80 ring-offset-4 ring-offset-black" />
                ) : (
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full grid place-items-center border border-line font-display text-4xl bg-[#0b0b0b]">{display.slice(0, 1).toUpperCase()}</div>
                )}
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-white border-2 border-black" aria-label="online" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="mono text-[10px] tracking-[0.35em] text-mist">$ whoami</div>
                <h1 className="font-display text-3xl md:text-5xl tracking-wide break-words leading-none mt-1">{display}</h1>
                <div className="mono text-[11px] tracking-[0.2em] text-mist mt-2">@{profile.username} — {profile.identity}</div>
                <div className="mono text-[11px] tracking-[0.15em] text-fog mt-3">
                  {profile.location || "UNDISCLOSED"}
                  {profile.timezone ? " · " + (clock || "--:--") + (today ? " · " + today : "") : ""}
                </div>
              </div>
            </div>

            {roles.length > 0 ? (
              <div className="mt-7">
                <div className="mono text-[10px] tracking-[0.35em] text-mist">$ roles --show</div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {roles.map((r) => (
                    <span key={r.roleId} className="mono text-[10px] tracking-[0.2em] bg-white text-black rounded-full px-3.5 py-1.5">{r.name}</span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-7 rounded-2xl bg-[#0b0b0b] border border-line p-5">
              <div className="mono text-[10px] tracking-[0.35em] text-mist">$ cat transmission.txt</div>
              <div className="mono text-sm leading-relaxed mt-3 min-h-[3rem] whitespace-pre-wrap break-words">
                <TypewriterBio bio={profile.bio} />
              </div>
            </div>

            <div className="mt-5">
              <div className="mono text-[10px] tracking-[0.35em] text-mist mb-3">$ now-playing</div>
              <MusicPlayer url={profile.musicUrl} />
            </div>

            {profile.affiliation ? (
              <Link href="/affiliations" className="group flex items-center gap-4 mt-5 rounded-2xl border border-line p-4 hover:border-white transition-colors">
                {profile.affiliation.logoUrl ? (
                  <img src={profile.affiliation.logoUrl} alt={profile.affiliation.name} loading="lazy" className="w-12 h-12 rounded-xl object-cover border border-line grayscale shrink-0" />
                ) : (
                  <span className="w-12 h-12 rounded-xl grid place-items-center border border-line font-display text-xl bg-[#0b0b0b] shrink-0">{profile.affiliation.name.slice(0, 1)}</span>
                )}
                <span className="flex-1 min-w-0">
                  <span className="mono text-[10px] tracking-[0.3em] text-mist block">SERVER BANNER — AFFILIATED</span>
                  <span className="font-display tracking-wide block truncate">{profile.affiliation.name}</span>
                </span>
                <span className="mono group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
              </Link>
            ) : null}

            <div className="mono text-[10px] tracking-[0.35em] text-mist mt-8 text-center">LONESTAR ON TOP — MADE BY EGO</div>
          </div>
        </div>
      </div>
    </div>
  );
}
