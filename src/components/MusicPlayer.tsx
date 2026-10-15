"use client";

import { useMemo, useRef, useState } from "react";

function spotifyEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com") && !u.hostname.includes("embed.spotify.com")) return null;
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

export default function MusicPlayer({ url }: { url: string | null }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);

  const spotify = useMemo(() => (url ? spotifyEmbed(url) : null), [url]);
  const yt = useMemo(() => (url ? youtubeId(url) : null), [url]);
  const isDirect = useMemo(() => {
    if (!url) return false;
    return /\.(mp3|ogg|wav|m4a)(\?.*)?$/i.test(url);
  }, [url]);

  if (!url) {
    return <div className="mono text-[11px] tracking-widest text-mist">NO TRANSMISSION LOADED</div>;
  }

  if (spotify) {
    return (
      <div className="w-full">
        <div className="rounded-2xl overflow-hidden border border-line bg-black leading-[0]">
          <iframe
            src={spotify}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify player"
            className="border-0"
          />
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="mono text-[10px] tracking-widest text-mist hover:text-white mt-2 inline-block">
          OPEN IN SPOTIFY ↗
        </a>
      </div>
    );
  }

  if (yt) {
    return (
      <div className="w-full">
        <div className="border border-line aspect-video w-full">
          <iframe
            src={"https://www.youtube-nocookie.com/embed/" + yt}
            title="YouTube player"
            className="w-full h-full"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="mono text-[10px] tracking-widest text-mist hover:text-white mt-2 inline-block">
          OPEN IN YOUTUBE ↗
        </a>
      </div>
    );
  }

  if (isDirect) {
    return (
      <div className="border border-line p-3 flex items-center gap-3 bg-black">
        <button
          onClick={() => {
            const el = audioRef.current;
            if (!el) return;
            if (playing) {
              el.pause();
              setPlaying(false);
            } else {
              void el.play();
              setPlaying(true);
            }
          }}
          className="mono text-[11px] tracking-widest border border-white px-3 py-2 hover:bg-white hover:text-black transition-colors"
        >
          {playing ? "PAUSE" : "PLAY"}
        </button>
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
          className="w-32 accent-white"
        />
        <audio
          ref={audioRef}
          src={url}
          preload="none"
          onEnded={() => setPlaying(false)}
          onVolumeChange={(e) => setVolume((e.target as HTMLAudioElement).volume)}
        />
        <span className="mono text-[10px] tracking-widest text-mist truncate">DIRECT AUDIO</span>
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="mono text-[11px] tracking-widest border border-line px-4 py-3 block hover:border-white text-fog hover:text-white">
      OPEN TRACK ↗
    </a>
  );
}
