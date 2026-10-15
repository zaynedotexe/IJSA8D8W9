"use client";

import { useState } from "react";

export type EditableProfile = {
  id: string;
  bio: string;
  backgroundUrl: string | null;
  musicUrl: string | null;
  location: string | null;
  timezone: string | null;
};

export default function ProfileEditor({ initial, onSaved }: { initial: EditableProfile; onSaved: (p: EditableProfile) => void }) {
  const [form, setForm] = useState({
    bio: initial.bio || "",
    backgroundUrl: initial.backgroundUrl || "",
    musicUrl: initial.musicUrl || "",
    location: initial.location || "",
    timezone: initial.timezone || ""
  });
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bgError, setBgError] = useState(false);

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/profiles/" + initial.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: form.bio.slice(0, 500),
          backgroundUrl: form.backgroundUrl,
          musicUrl: form.musicUrl,
          location: form.location,
          timezone: form.timezone
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Save failed");
      } else {
        setStatus("SAVED");
        onSaved({
          id: initial.id,
          bio: data.profile.bio,
          backgroundUrl: data.profile.backgroundUrl,
          musicUrl: data.profile.musicUrl,
          location: data.profile.location,
          timezone: data.profile.timezone
        });
      }
    } catch {
      setStatus("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-line bg-coal p-5">
      <div className="mono text-[11px] tracking-[0.3em] text-fog mb-5">EDIT PROFILE</div>
      <label className="block mono text-[11px] tracking-widest text-mist mb-2">BIOGRAPHY — {form.bio.length}/500</label>
      <textarea
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 500) })}
        rows={4}
        className="w-full bg-black border border-line p-3 text-sm text-white mono focus:border-white"
        placeholder="Who are you in the dark?"
      />
      <label className="block mono text-[11px] tracking-widest text-mist mt-5 mb-2">BACKGROUND URL — PNG JPG GIF</label>
      <input
        value={form.backgroundUrl}
        onChange={(e) => {
          setBgError(false);
          setForm({ ...form, backgroundUrl: e.target.value.slice(0, 2048) });
        }}
        className="w-full bg-black border border-line p-3 text-sm mono text-white focus:border-white"
        placeholder="https://..."
        inputMode="url"
      />
      {form.backgroundUrl ? (
        <div className="mt-3 border border-line h-32 overflow-hidden bg-black relative">
          {!bgError ? (
            <img src={form.backgroundUrl} alt="Background preview" className="w-full h-full object-cover" onError={() => setBgError(true)} />
          ) : (
            <div className="w-full h-full grid place-items-center mono text-[11px] text-mist tracking-widest">PREVIEW UNAVAILABLE</div>
          )}
        </div>
      ) : null}
      <label className="block mono text-[11px] tracking-widest text-mist mt-5 mb-2">MUSIC URL — SPOTIFY / YOUTUBE / MP3</label>
      <input
        value={form.musicUrl}
        onChange={(e) => setForm({ ...form, musicUrl: e.target.value.slice(0, 2048) })}
        className="w-full bg-black border border-line p-3 text-sm mono text-white focus:border-white"
        placeholder="https://open.spotify.com/..."
        inputMode="url"
      />
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        <div>
          <label className="block mono text-[11px] tracking-widest text-mist mb-2">LOCATION — OPTIONAL</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value.slice(0, 120) })}
            className="w-full bg-black border border-line p-3 text-sm mono text-white focus:border-white"
            placeholder="Nowhere"
          />
        </div>
        <div>
          <label className="block mono text-[11px] tracking-widest text-mist mb-2">TIMEZONE — OPTIONAL</label>
          <input
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value.slice(0, 80) })}
            className="w-full bg-black border border-line p-3 text-sm mono text-white focus:border-white"
            placeholder="UTC / America/Chicago"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={save}
          disabled={saving}
          className="mono text-xs tracking-[0.25em] bg-white text-black px-6 py-3 hover:bg-fog disabled:opacity-50"
        >
          {saving ? "SAVING" : "SAVE"}
        </button>
        <button
          onClick={() =>
            setForm({
              bio: initial.bio || "",
              backgroundUrl: initial.backgroundUrl || "",
              musicUrl: initial.musicUrl || "",
              location: initial.location || "",
              timezone: initial.timezone || ""
            })
          }
          className="mono text-xs tracking-[0.25em] border border-line text-fog px-6 py-3 hover:text-white hover:border-white"
        >
          CANCEL
        </button>
        {form.backgroundUrl || form.musicUrl ? (
          <button
            onClick={() => setForm({ ...form, backgroundUrl: "", musicUrl: "" })}
            className="mono text-[11px] tracking-widest text-mist hover:text-white ml-auto"
          >
            RESET MEDIA
          </button>
        ) : null}
      </div>
      {status ? <div className="mono text-[11px] tracking-widest text-fog mt-4">{status}</div> : null}
    </div>
  );
}
