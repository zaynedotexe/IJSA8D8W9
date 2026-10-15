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
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <div className="mono text-xs tracking-[0.35em] text-mist">404 — SIGNAL LOST</div>
        <Link href="/members" className="mono text-xs tracking-widest text-white border border-line px-6 py-3 inline-block mt-8 hover:border-white">BACK TO MEMBERS</Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <LoadingScreen label="LOADING PROFILE" />
        <div className="max-w-3xl mx-auto px-5 py-24 mono text-xs tracking-widest text-mist">ESTABLISHING CONNECTION...</div>
      </div>
    );
  }

  const display = profile.nickname || profile.globalName || profile.username || "UNKNOWN";
  const showBg = profile.backgroundUrl && bgOk;

  return (
    <div className="relative min-h-[80vh]">
      <ProfileViewTracker id={profile.id} />
      {showBg ? (
        <div className="fixed inset-0 -z-10">
          <img src={profile.backgroundUrl!} alt="" className="w-full h-full object-cover" onError={() => setBgOk(false)} />
          <div className="absolute inset-0 bg-black/70" />
        </div>
      ) : (
        <div className="fixed inset-0 -z-10 bg-black" />
      )}
      <div className="max-w-3xl mx-auto px-5 py-12">
        <Link href="/members" className="mono text-[11px] tracking-widest text-mist hover:text-white">← DIRECTORY</Link>
        <div className="border border-line bg-black/85 backdrop-blur mt-6 p-7 md:p-10">
          <div className="mono text-[10px] tracking-[0.35em] text-mist">LONESTAR — PROFILE</div>
          <div className="flex flex-col md:flex-row gap-6 mt-6">
            {profile.avatar ? (
              <img src={profile.avatar} alt={display} className="w-28 h-28 object-cover border border-line" />
            ) : (
              <div className="w-28 h-28 grid place-items-center border border-line mono text-4xl bg-coal">{display.slice(0, 1).toUpperCase()}</div>
            )}
            <div className="flex-1">
              <h1 className="mono text-3xl tracking-widest">{display}</h1>
              <div className="mono text-[11px] tracking-widest text-mist mt-1">@{profile.username} · {profile.identity}</div>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {roles.map((r) => (
                  <span key={r.roleId} className="mono text-[10px] tracking-[0.2em] border border-line text-fog px-2 py-1">{r.name}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-line mt-8 pt-6">
            <div className="mono text-[10px] tracking-[0.3em] text-mist">TRANSMISSION</div>
            <div className="mono text-sm leading-relaxed mt-3 min-h-[3.5rem] whitespace-pre-wrap break-words">
              <TypewriterBio bio={profile.bio} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-line border border-line mt-8">
            <div className="bg-black p-4">
              <div className="mono text-[10px] tracking-[0.3em] text-mist">VIEWS</div>
              <div className="mono text-lg mt-1">{count === null ? "—" : count.toLocaleString()}</div>
            </div>
            <div className="bg-black p-4">
              <div className="mono text-[10px] tracking-[0.3em] text-mist">LOCATION</div>
              <div className="mono text-sm mt-1">{profile.location || "UNDISCLOSED"}</div>
            </div>
            <div className="bg-black p-4">
              <div className="mono text-[10px] tracking-[0.3em] text-mist">LOCAL TIME</div>
              <div className="mono text-sm mt-1">{profile.timezone ? (clock || "—") + " · " + profile.timezone : "—"}</div>
            </div>
          </div>

          {profile.affiliation ? (
            <div className="border border-line mt-6 p-4">
              <div className="mono text-[10px] tracking-[0.3em] text-mist">AFFILIATION</div>
              <div className="mono text-sm tracking-widest mt-1">{profile.affiliation.name}</div>
              <div className="text-fog text-sm mt-1">{profile.affiliation.description}</div>
            </div>
          ) : null}

          <div className="mt-6">
            <div className="mono text-[10px] tracking-[0.3em] text-mist mb-3">SOUND</div>
            <MusicPlayer url={profile.musicUrl} />
          </div>

          <div className="mono text-[10px] tracking-[0.3em] text-mist mt-8 text-center">LONESTAR ON TOP · MADE BY EGO</div>
        </div>
      </div>
    </div>
  );
}
