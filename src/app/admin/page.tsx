"use client";

import { useEffect, useState } from "react";

type Stats = {
  homeViews: number;
  profileCount: number;
  memberCount: number;
  sync: { status: string; lastRunAt: string | null } | null;
  topProfiles: { id: string; views: number; identity: string; discordIdentity: { username: string } | null }[];
};

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [denied, setDenied] = useState(false);
  const [profiles, setProfiles] = useState<never[]>([]);
  const [form, setForm] = useState({ discordId: "", identity: "MEMBER", bio: "" });
  const [msg, setMsg] = useState("");
  const [musicOpen, setMusicOpen] = useState<string | null>(null);
  const [musicDraft, setMusicDraft] = useState({ musicUrl: "", trackTitle: "", trackArtist: "", trackCover: "" });
  const [musicMsg, setMusicMsg] = useState("");
  const [editOpen, setEditOpen] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ identity: "", displayName: "" });
  const [editMsg, setEditMsg] = useState("");
  const [bgOpen, setBgOpen] = useState<string | null>(null);
  const [bgDraft, setBgDraft] = useState({ backgroundUrl: "" });
  const [bgMsg, setBgMsg] = useState("");

  async function refreshProfiles() {
    const refreshed = await fetch("/api/admin/profiles", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
    if (refreshed) setProfiles(refreshed.profiles || []);
  }

  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => {
        if (r.status === 403) {
          setDenied(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d && !d.degraded) setStats(d);
      })
      .catch(() => {});
    fetch("/api/admin/profiles", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setProfiles(d.profiles || []);
      })
      .catch(() => {});
  }, []);

  async function createProfile() {
    setMsg("");
    const res = await fetch("/api/admin/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordId: form.discordId.trim(), identity: form.identity, bio: form.bio })
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Failed");
      return;
    }
    setMsg("CREATED " + data.profile.id);
    setForm({ discordId: "", identity: "MEMBER", bio: "" });
    const refreshed = await fetch("/api/admin/profiles", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
    if (refreshed) setProfiles(refreshed.profiles || []);
  }

  async function toggle(p: { id: string; approved: boolean; visible: boolean }) {
    await fetch("/api/admin/profiles/" + p.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !p.approved })
    }).catch(() => {});
    const refreshed = await fetch("/api/admin/profiles", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
    if (refreshed) setProfiles(refreshed.profiles || []);
  }

  if (denied) {
    return <div className="max-w-3xl mx-auto px-5 py-24 mono text-xs tracking-widest text-mist">ADMIN ONLY. YOUR DISCORD ID IS NOT ALLOWLISTED.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <div className="mono text-[11px] tracking-[0.4em] text-mist">RESTRICTED</div>
      <h1 className="font-display text-5xl mt-3">ADMIN</h1>

      <div className="grid md:grid-cols-4 gap-px bg-line border border-line mt-8">
        {[
          { k: "HOME VIEWS", v: stats ? String(stats.homeViews) : "—" },
          { k: "PROFILES", v: stats ? String(stats.profileCount) : "—" },
          { k: "DISCORD MEMBERS", v: stats ? String(stats.memberCount) : "—" },
          { k: "SYNC", v: stats?.sync ? stats.sync.status.toUpperCase() : "—" }
        ].map((s) => (
          <div key={s.k} className="bg-black p-5">
            <div className="mono text-[10px] tracking-[0.3em] text-mist">{s.k}</div>
            <div className="mono text-2xl mt-1">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-line bg-[#0b0b0b] p-6 mt-8">
        <div className="mono text-[11px] tracking-[0.3em] text-fog">CREATE PROFILE — LINK DISCORD ID</div>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <input
            value={form.discordId}
            onChange={(e) => setForm({ ...form, discordId: e.target.value })}
            placeholder="DISCORD USER ID"
            className="bg-black border border-line px-4 py-3 mono text-xs text-white"
          />
          <input
            value={form.identity}
            onChange={(e) => setForm({ ...form, identity: e.target.value.slice(0, 60) })}
            placeholder="IDENTITY"
            className="bg-black border border-line px-4 py-3 mono text-xs text-white"
          />
          <input
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 500) })}
            placeholder="BIO (OPTIONAL)"
            className="bg-black border border-line px-4 py-3 mono text-xs text-white"
          />
        </div>
        <button onClick={createProfile} className="mono text-xs tracking-[0.25em] bg-white text-black px-6 py-3 mt-4">CREATE</button>
        {msg ? <div className="mono text-[11px] tracking-widest text-fog mt-3">{msg}</div> : null}
      </div>

      <div className="mt-8">
        <div className="mono text-[11px] tracking-[0.3em] text-mist mb-3">PROFILES — {(profiles as unknown[]).length}</div>
        <div className="border border-line divide-y divide-[#1a1a1a]">
          {(profiles as { id: string; discordId: string; identity: string; displayName: string | null; approved: boolean; visible: boolean; backgroundUrl: string | null; musicUrl: string | null; trackTitle: string | null; trackArtist: string | null; trackCover: string | null; discordIdentity: { username: string } | null }[]).slice(0, 60).map((p) => (
            <div key={p.id} className="p-4 bg-black">
              <div className="flex flex-wrap items-center gap-3">
                <span className="mono text-xs text-white">{p.displayName || p.discordIdentity?.username || p.discordId}</span>
                <span className="mono text-[10px] tracking-widest text-mist">{p.identity} · {p.approved ? "APPROVED" : "HIDDEN"}{p.musicUrl ? " · ♪" : ""}</span>
                <button
                  onClick={() => {
                    if (editOpen === p.id) {
                      setEditOpen(null);
                    } else {
                      setEditOpen(p.id);
                      setEditDraft({ identity: p.identity || "", displayName: p.displayName || "" });
                      setEditMsg("");
                    }
                  }}
                  className="mono text-[10px] tracking-widest border border-line px-3 py-1.5 text-fog hover:text-white ml-auto"
                >
                  EDIT
                </button>
                <button
                  onClick={() => {
                    if (musicOpen === p.id) {
                      setMusicOpen(null);
                    } else {
                      setMusicOpen(p.id);
                      setMusicDraft({
                        musicUrl: p.musicUrl || "",
                        trackTitle: p.trackTitle || "",
                        trackArtist: p.trackArtist || "",
                        trackCover: p.trackCover || ""
                      });
                      setMusicMsg("");
                    }
                  }}
                  className="mono text-[10px] tracking-widest border border-line px-3 py-1.5 text-fog hover:text-white ml-auto"
                >
                  MUSIC
                </button>
                <button
                  onClick={() => {
                    if (bgOpen === p.id) {
                      setBgOpen(null);
                    } else {
                      setBgOpen(p.id);
                      setBgDraft({ backgroundUrl: p.backgroundUrl || "" });
                      setBgMsg("");
                    }
                  }}
                  className="mono text-[10px] tracking-widest border border-line px-3 py-1.5 text-fog hover:text-white"
                >
                  BG
                </button>
                <button onClick={() => toggle(p)} className="mono text-[10px] tracking-widest border border-line px-3 py-1.5 text-fog hover:text-white">
                  {p.approved ? "DISABLE" : "APPROVE"}
                </button>
                <a href={"/" + encodeURIComponent(p.discordIdentity?.username || p.id)} target="_blank" rel="noreferrer" className="mono text-[10px] tracking-widest text-mist hover:text-white">OPEN ↗</a>
              </div>
              {editOpen === p.id ? (
                <div className="grid md:grid-cols-2 gap-2.5 mt-4">
                  <input
                    value={editDraft.identity}
                    onChange={(e) => setEditDraft({ ...editDraft, identity: e.target.value.slice(0, 60) })}
                    placeholder="IDENTITY — e.g. SINS"
                    className="bg-[#0b0b0b] border border-line px-4 py-2.5 mono text-xs text-white"
                  />
                  <input
                    value={editDraft.displayName}
                    onChange={(e) => setEditDraft({ ...editDraft, displayName: e.target.value.slice(0, 100) })}
                    placeholder="DISPLAY NAME (OPTIONAL)"
                    className="bg-[#0b0b0b] border border-line px-4 py-2.5 mono text-xs text-white"
                  />
                  <div className="md:col-span-2 flex items-center gap-3">
                    <button
                      onClick={async () => {
                        setEditMsg("");
                        const res = await fetch("/api/admin/profiles/" + p.id, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(editDraft)
                        });
                        const data = await res.json().catch(() => null);
                        if (!res.ok) {
                          setEditMsg(data?.error || "Save failed");
                          return;
                        }
                        setEditMsg("SAVED");
                        await refreshProfiles();
                      }}
                      className="mono text-[11px] tracking-[0.25em] bg-white text-black px-5 py-2.5"
                    >
                      SAVE
                    </button>
                    {editMsg ? <span className="mono text-[10px] tracking-widest text-fog">{editMsg}</span> : null}
                  </div>
                </div>
              ) : null}
              {musicOpen === p.id ? (
                <div className="grid md:grid-cols-2 gap-2.5 mt-4">
                  <input
                    value={musicDraft.musicUrl}
                    onChange={(e) => setMusicDraft({ ...musicDraft, musicUrl: e.target.value.slice(0, 2048) })}
                    placeholder="MUSIC URL — SPOTIFY / YOUTUBE / MP3"
                    className="md:col-span-2 bg-[#0b0b0b] border border-line px-4 py-2.5 mono text-xs text-white"
                    inputMode="url"
                  />
                  <input
                    value={musicDraft.trackTitle}
                    onChange={(e) => setMusicDraft({ ...musicDraft, trackTitle: e.target.value.slice(0, 160) })}
                    placeholder="SONG TITLE (MP3)"
                    className="bg-[#0b0b0b] border border-line px-4 py-2.5 mono text-xs text-white"
                  />
                  <input
                    value={musicDraft.trackArtist}
                    onChange={(e) => setMusicDraft({ ...musicDraft, trackArtist: e.target.value.slice(0, 160) })}
                    placeholder="ARTIST (MP3)"
                    className="bg-[#0b0b0b] border border-line px-4 py-2.5 mono text-xs text-white"
                  />
                  <input
                    value={musicDraft.trackCover}
                    onChange={(e) => setMusicDraft({ ...musicDraft, trackCover: e.target.value.slice(0, 2048) })}
                    placeholder="COVER IMAGE URL (MP3)"
                    className="md:col-span-2 bg-[#0b0b0b] border border-line px-4 py-2.5 mono text-xs text-white"
                    inputMode="url"
                  />
                  <div className="md:col-span-2 flex items-center gap-3">
                    <button
                      onClick={async () => {
                        setMusicMsg("");
                        const res = await fetch("/api/admin/profiles/" + p.id, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(musicDraft)
                        });
                        const data = await res.json().catch(() => null);
                        if (!res.ok) {
                          setMusicMsg(data?.error || "Save failed");
                          return;
                        }
                        setMusicMsg("SAVED");
                        const refreshed = await fetch("/api/admin/profiles", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
                        if (refreshed) setProfiles(refreshed.profiles || []);
                      }}
                      className="mono text-[11px] tracking-[0.25em] bg-white text-black px-5 py-2.5"
                    >
                      SAVE MUSIC
                    </button>
                    {musicMsg ? <span className="mono text-[10px] tracking-widest text-fog">{musicMsg}</span> : null}
                  </div>
                </div>
              ) : null}
              {bgOpen === p.id ? (
                <div className="grid gap-2.5 mt-4">
                  <input
                    value={bgDraft.backgroundUrl}
                    onChange={(e) => setBgDraft({ backgroundUrl: e.target.value.slice(0, 2048) })}
                    placeholder="BACKGROUND URL — IMAGE / VIDEO / YOUTUBE"
                    className="bg-[#0b0b0b] border border-line px-4 py-2.5 mono text-xs text-white"
                    inputMode="url"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        setBgMsg("");
                        const res = await fetch("/api/admin/profiles/" + p.id, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(bgDraft)
                        });
                        const data = await res.json().catch(() => null);
                        if (!res.ok) {
                          setBgMsg(data?.error || "Save failed");
                          return;
                        }
                        setBgMsg("SAVED");
                        await refreshProfiles();
                      }}
                      className="mono text-[11px] tracking-[0.25em] bg-white text-black px-5 py-2.5"
                    >
                      SAVE BACKGROUND
                    </button>
                    {bgMsg ? <span className="mono text-[10px] tracking-widest text-fog">{bgMsg}</span> : null}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {stats?.topProfiles ? (
        <div className="mt-8">
          <div className="mono text-[11px] tracking-[0.3em] text-mist mb-3">TOP PROFILES</div>
          <div className="border border-line divide-y divide-[#1a1a1a]">
            {stats.topProfiles.map((t) => (
              <div key={t.id} className="p-4 mono text-xs text-fog bg-black flex justify-between">
                <span>{t.discordIdentity?.username || t.id} · {t.identity}</span>
                <span>{t.views} VIEWS</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
