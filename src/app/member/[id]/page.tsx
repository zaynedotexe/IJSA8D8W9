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
  affiliation: { name: string; description: string } | null;
};

function localTime(tz: string | null): string {
  if (!tz) return "";
  try {
    return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date());
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
    setClock(localTime(profile.timezone));
    const t = window.setInterval(() => setClock(localTime(profile.timezone)), 30000);
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
    <div className="relative">
      <ProfileViewTracker id={profile.id} />
      {showBg ? (
        <div className="fixed inset-0 -z-10">
          <img src={profile.backgroundUrl!} alt="" className="w-full h-full object-cover" onError={() => setBgOk(false)} />
          <div className="absolute inset-0 bg-black/75" />
        </div>
      ) : (
        <div className="fixed inset-0 -z-10 bg-[#050505] bg-grid" />
      )}
      <div className="px-5 md:px-10 py-10 md:py-14 max-w-4xl mx-auto">
        <Link href="/members" className="mono text-[11px] tracking-widest text-mist hover:text-white">← DIRECTORY</Link>
        <div className="mt-6 rounded-3xl border border-line bg-black/85 backdrop-blur p-6 md:p-10 overflow-hidden">
          <div className="mono text-[10px] tracking-[0.4em] text-mist">LONESTAR — PROFILE</div>
          <div className="flex flex-col sm:flex-row gap-6 mt-6 items-start">
            {profile.avatar ? (
              <img src={profile.avatar} alt={display} className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border border-line" />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full grid place-items-center border border-line font-display text-4xl bg-[#0b0b0b]">{display.slice(0, 1).toUpperCase()}</div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-3xl md:text-5xl tracking-wide break-words leading-none">{display}</h1>
              <div className="mono text-[11px] tracking-[0.2em] text-mist mt-2">@{profile.username} — {profile.identity}</div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {roles.map((r) => (
                  <span key={r.roleId} className="mono text-[10px] tracking-[0.2em] border border-line text-fog rounded-full px-3 py-1">{r.name}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-line mt-8 pt-6">
            <div className="mono text-[10px] tracking-[0.35em] text-mist">TRANSMISSION</div>
            <div className="mono text-sm leading-relaxed mt-3 min-h-[3.5rem] whitespace-pre-wrap break-words">
              <TypewriterBio bio={profile.bio} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3 mt-8">
            <div className="rounded-2xl bg-[#0b0b0b] border border-line p-4">
              <div className="mono text-[10px] tracking-[0.3em] text-mist">VIEWS</div>
              <div className="font-display text-xl md:text-2xl mt-1">{count === null ? "—" : count.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl bg-[#0b0b0b] border border-line p-4">
              <div className="mono text-[10px] tracking-[0.3em] text-mist">BASE</div>
              <div className="mono text-xs md:text-sm mt-1.5 truncate">{profile.location || "UNDISCLOSED"}</div>
            </div>
            <div className="rounded-2xl bg-[#0b0b0b] border border-line p-4">
              <div className="mono text-[10px] tracking-[0.3em] text-mist">LOCAL</div>
              <div className="mono text-xs md:text-sm mt-1.5 truncate">{profile.timezone ? (clock || "—") : "—"}</div>
            </div>
          </div>

          {profile.affiliation ? (
            <div className="rounded-2xl border border-line mt-3 p-4 flex gap-4 items-center">
              <span className="w-11 h-11 rounded-xl grid place-items-center border border-line font-display text-lg bg-[#0b0b0b] shrink-0">{profile.affiliation.name.slice(0, 1)}</span>
              <div>
                <div className="mono text-[10px] tracking-[0.3em] text-mist">AFFILIATION</div>
                <div className="font-display tracking-wide mt-0.5">{profile.affiliation.name}</div>
              </div>
            </div>
          ) : null}

          <div className="mt-8">
            <div className="mono text-[10px] tracking-[0.35em] text-mist mb-3">SOUND</div>
            <MusicPlayer url={profile.musicUrl} />
          </div>

          <div className="mono text-[10px] tracking-[0.35em] text-mist mt-8 text-center">LONESTAR ON TOP — MADE BY EGO</div>
        </div>
      </div>
    </div>
  );
}
