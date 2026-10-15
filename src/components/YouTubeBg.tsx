"use client";

import { useEffect, useRef, useState } from "react";

type Player = {
  playVideo: () => void;
  mute: () => void;
  seekTo: (s: number, allow: boolean) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => Player; PlayerState?: { PLAYING: number; ENDED: number } };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoading: Promise<void> | null = null;
let apiTagAdded = false;
const apiWaiters: (() => void)[] = [];

function loadApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiLoading) return apiLoading;
  apiLoading = new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("timeout")), 12000);
    apiWaiters.push(() => {
      window.clearTimeout(timer);
      resolve();
    });
    const w = window as unknown as { onYouTubeIframeAPIReady?: () => void };
    if (!w.onYouTubeIframeAPIReady) {
      w.onYouTubeIframeAPIReady = () => {
        const waiting = apiWaiters.splice(0);
        waiting.forEach((fn) => fn());
      };
    }
    if (!apiTagAdded) {
      apiTagAdded = true;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      tag.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error("blocked"));
      };
      document.head.appendChild(tag);
    }
  });
  return apiLoading;
}

export default function YouTubeBg({ id, poster }: { id: string; poster: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let player: Player | null = null;
    let alive = true;
    const fallback = window.setTimeout(() => {
      if (alive) setVisible(true);
    }, 10000);
    loadApi()
      .then(() => {
        if (!alive || !hostRef.current || !window.YT) return;
        player = new window.YT.Player(hostRef.current, {
          videoId: id,
          playerVars: {
            autoplay: 1,
            mute: 1,
            loop: 1,
            playlist: id,
            controls: 0,
            rel: 0,
            playsinline: 1,
            disablekb: 1,
            iv_load_policy: 3,
            modestbranding: 1
          },
          events: {
            onReady: (e: { target: Player }) => {
              e.target.mute();
              e.target.playVideo();
            },
            onStateChange: (e: { data: number; target: Player }) => {
              const playing = window.YT?.PlayerState?.PLAYING;
              const ended = window.YT?.PlayerState?.ENDED;
              if (e.data === playing && alive) {
                window.clearTimeout(fallback);
                setVisible(true);
              }
              if (e.data === ended) {
                e.target.seekTo(0, true);
                e.target.playVideo();
              }
            }
          }
        });
      })
      .catch(() => {
        if (alive) setVisible(true);
      });
    return () => {
      alive = false;
      window.clearTimeout(fallback);
      try {
        player?.destroy();
      } catch {}
    };
  }, [id]);

  return (
    <div className="absolute inset-0">
      <img src={poster} alt="" aria-hidden="true" loading="eager" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
      <div
        className={"absolute pointer-events-none transition-opacity duration-1000 " + (visible ? "opacity-100" : "opacity-0")}
        style={{ width: "130%", height: "130%", left: "-15%", top: "-15%" }}
      >
        <div ref={hostRef} className="w-full h-full" />
      </div>
    </div>
  );
}
