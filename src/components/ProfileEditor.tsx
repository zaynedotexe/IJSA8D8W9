"use client";

import { useEffect, useState } from "react";

export type EditableProfile = {
  id: string;
  bio: string;
  backgroundUrl: string | null;
  glowColor: string | null;
  musicUrl: string | null;
  trackTitle: string | null;
  trackArtist: string | null;
  trackCover: string | null;
  location: string | null;
  timezone: string | null;
};

export default function ProfileEditor({ initial, onSaved }: { initial: EditableProfile; onSaved: (p: EditableProfile) => void }) {
  const [form, setForm] = useState({
    bio: initial.bio || "",
    backgroundUrl: initial.backgroundUrl || "",
    glowColor: initial.glowColor || "",
    location: initial.location || "",
    timezone: initial.timezone || ""
  });
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bgError, setBgError] = useState(false);
  const [zones, setZones] = useState<string[]>([]);

  useEffect(() => {
    try {
      const fn = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
      if (typeof fn === "function") {
        const list = fn.call(Intl, "timeZone");
        if (Array.isArray(list)) setZones(list);
      }
    } catch {}
  }, []);

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
          glowColor: form.glowColor,
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
          glowColor: data.profile.glowColor,
          musicUrl: data.profile.musicUrl,
          trackTitle: data.profile.trackTitle,
          trackArtist: data.profile.trackArtist,
          trackCover: data.profile.trackCover,
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
    <div className="rounded-3xl border border-line bg-[#0b0b0b] p-5 md:p-7">
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
      <div className="rounded-2xl border border-line p-4 mt-5 mono text-[11px] tracking-widest text-mist">MUSIC IS MANAGED BY THE ADMIN — ASK EGO TO SET YOUR TRACK</div>
      <label className="block mono text-[11px] tracking-widest text-mist mt-5 mb-2">AURA GLOW — HEX COLOR</label>
      <div className="flex gap-3 items-center">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(form.glowColor) ? form.glowColor : "#ffffff"}
          onChange={(e) => setForm({ ...form, glowColor: e.target.value })}
          aria-label="Pick glow color"
          className="w-12 h-12 shrink-0 cursor-pointer bg-black border border-line p-1"
        />
        <input
          value={form.glowColor}
          onChange={(e) => setForm({ ...form, glowColor: e.target.value.slice(0, 7) })}
          className="flex-1 bg-black border border-line p-3 text-sm mono text-white focus:border-white uppercase"
          placeholder="#a9f5d0"
          inputMode="text"
        />
        <span
          className="w-12 h-12 rounded-full shrink-0 border border-line"
          aria-hidden="true"
          style={/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(form.glowColor.trim()) ? { background: form.glowColor.trim(), boxShadow: "0 0 18px 4px " + form.glowColor.trim() } : undefined}
        />
        {form.glowColor ? (
          <button onClick={() => setForm({ ...form, glowColor: "" })} className="mono text-[11px] tracking-widest text-mist hover:text-white shrink-0">
            CLEAR
          </button>
        ) : null}
      </div>
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
          {zones.length > 0 ? (
            <select
              value={zones.includes(form.timezone) || form.timezone === "" ? form.timezone : ""}
              onChange={(e) => setForm({ ...form, timezone: e.target.value.slice(0, 80) })}
              className="w-full bg-black border border-line p-3 text-sm mono text-white focus:border-white"
            >
              <option value="">— SELECT —</option>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          ) : (
            <input
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value.slice(0, 80) })}
              className="w-full bg-black border border-line p-3 text-sm mono text-white focus:border-white"
              placeholder="UTC / America/Chicago"
            />
          )}
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
              glowColor: initial.glowColor || "",
              location: initial.location || "",
              timezone: initial.timezone || ""
            })
          }
          className="mono text-xs tracking-[0.25em] border border-line text-fog px-6 py-3 hover:text-white hover:border-white"
        >
          CANCEL
        </button>
        {form.backgroundUrl ? (
          <button
            onClick={() => setForm({ ...form, backgroundUrl: "" })}
            className="mono text-[11px] tracking-widest text-mist hover:text-white ml-auto"
          >
            RESET BACKGROUND
          </button>
        ) : null}
      </div>
      {status ? <div className="mono text-[11px] tracking-widest text-fog mt-4">{status}</div> : null}
    </div>
  );
}
