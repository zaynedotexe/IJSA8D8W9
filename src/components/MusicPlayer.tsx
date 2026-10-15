"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Meta = { title: string; artist: string; cover: string | null };

function kindOf(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("spotify")) return "spotify";
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "youtube";
  if (/\.(mp3|ogg|wav|m4a)(\?.*)?$/.test(lower)) return "direct";
  return "link";
}

function spotifyEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const kind = parts[0];
    const id = parts[1].split("?")[0];
    if (!["track", "album", "playlist", "episode"].includes(kind)) return null;
    return "https://open.spotify.com/embed/" + kind + "/" + id + "?utm_source=generator&theme=0";
  } catch {
    return null;
  }
}

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("?")[0] || null;
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
  } catch {}
  return null;
}

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + String(s).padStart(2, "0");
}

export default function MusicPlayer({ url, title, artist, cover }: { url: string | null; title?: string | null; artist?: string | null; cover?: string | null }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const kind = useMemo(() => (url ? kindOf(url) : "none"), [url]);
  const spotify = useMemo(() => (url && kind === "spotify" ? spotifyEmbed(url) : null), [url, kind]);
  const yt = useMemo(() => (url && kind === "youtube" ? youtubeId(url) : null), [url, kind]);
  const isDirect = kind === "direct";

  useEffect(() => {
    if (!url || (kind !== "spotify" && kind !== "youtube")) return;
    let alive = true;
    fetch("/api/oembed?url=" + encodeURIComponent(url), { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && !d.error) setMeta({ title: d.title, artist: d.artist, cover: d.cover });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url, kind]);

  useEffect(() => {
    const onEnter = () => {
      const el = audioRef.current;
      if (!el) return;
      el.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    };
    window.addEventListener("lonestar:enter", onEnter);
    return () => window.removeEventListener("lonestar:enter", onEnter);
  }, []);

  useEffect(() => {
    if (!isDirect) return;
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    let done = false;
    const attempt = () => {
      el.play()
        .then(() => {
          setPlaying(true);
          done = true;
          window.removeEventListener("pointerdown", attempt);
          window.removeEventListener("keydown", attempt);
        })
        .catch(() => {});
    };
    attempt();
    window.addEventListener("pointerdown", attempt);
    window.addEventListener("keydown", attempt);
    return () => {
      window.removeEventListener("pointerdown", attempt);
      window.removeEventListener("keydown", attempt);
      if (!done) return;
    };
  }, [isDirect, url]);

  if (!url) {
    return <div className="mono text-[11px] tracking-widest text-mist">NO TRANSMISSION LOADED</div>;
  }

  if (kind === "link") {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mono text-[11px] tracking-widest border border-line rounded-2xl px-4 py-3 block hover:border-white text-fog hover:text-white">
        OPEN TRACK ↗
      </a>
    );
  }

  function toggleDirect() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play();
      setPlaying(true);
    }
  }

  const progress = dur > 0 ? Math.min(100, (pos / dur) * 100) : 0;

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center">
        {meta?.cover || (isDirect && cover) ? (
          <img src={(isDirect && cover) || meta?.cover || ""} alt="" loading="lazy" referrerPolicy="no-referrer" className="w-24 h-24 rounded-2xl object-cover border border-line" />
        ) : (
          <div className="w-24 h-24 rounded-2xl border border-line bg-[#0b0b0b] grid place-items-center mono text-2xl text-mist">♪</div>
        )}
        <div className="mono text-[11px] tracking-[0.3em] text-fog mt-4">♪ NOW PLAYING</div>
        <div className="font-display text-lg tracking-wide mt-1 break-words max-w-full">{(isDirect && title) || meta?.title || (isDirect ? "DIRECT AUDIO" : "LOADING…")}</div>
        <div className="text-fog text-sm">{(isDirect && artist) || meta?.artist || (isDirect ? "UNKNOWN ARTIST" : "")}</div>

        {isDirect ? (
          <button
            onClick={toggleDirect}
            aria-label={playing ? "Pause" : "Play"}
            className="w-12 h-12 mt-4 rounded-full border border-white grid place-items-center hover:bg-white hover:text-black transition-colors"
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
        ) : (
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Hide player" : "Play"}
            className="w-12 h-12 mt-4 rounded-full border border-white grid place-items-center hover:bg-white hover:text-black transition-colors"
          >
            {expanded ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
        )}

        {isDirect ? (
          <div className="w-full mt-4">
            <div className="h-1 rounded-full bg-[#2a2a2a] overflow-hidden">
              <div className="h-full bg-white transition-[width]" style={{ width: progress + "%" }} />
            </div>
            <div className="flex items-center justify-between mono text-[10px] tracking-widest text-mist mt-2">
              <span>{fmt(pos)}</span>
              <span>{fmt(dur)}</span>
            </div>
          </div>
        ) : null}

        {isDirect ? (
          <div className="flex items-center gap-2.5 w-full mt-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-mist shrink-0">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            </svg>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              aria-label="Volume"
              className="flex-1 accent-white"
            />
          </div>
        ) : null}

        {isDirect ? (
          <audio
            ref={audioRef}
            src={url}
            preload="auto"
            onTimeUpdate={(e) => setPos((e.target as HTMLAudioElement).currentTime)}
            onLoadedMetadata={(e) => {
              const el = e.target as HTMLAudioElement;
              setDur(el.duration);
              el.volume = volume;
            }}
            onEnded={() => setPlaying(false)}
          />
        ) : null}
      </div>

      {!isDirect && expanded && (spotify || yt) ? (
        <div className="rounded-2xl overflow-hidden border border-line bg-black leading-[0] mt-4">
          {spotify ? (
            <iframe
              src={spotify}
              width="100%"
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify player"
              className="border-0"
            />
          ) : (
            <iframe
              src={"https://www.youtube-nocookie.com/embed/" + yt}
              title="YouTube player"
              className="w-full aspect-video border-0"
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      ) : null}

      {!isDirect && (kind === "spotify" || kind === "youtube") ? (
        <a href={url} target="_blank" rel="noreferrer" className="mono text-[10px] tracking-[0.25em] text-mist hover:text-white mt-4 inline-block">
          OPEN IN {kind === "spotify" ? "SPOTIFY" : "YOUTUBE"} ↗
        </a>
      ) : null}
    </div>
  );
}
