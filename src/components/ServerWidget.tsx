"use client";

import { useState } from "react";

export default function ServerWidget({ guildId, name }: { guildId: string; name: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="rounded-3xl glass overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <span className="mono text-[10px] tracking-[0.35em] text-fog">◉ LIVE — {name.toUpperCase()}</span>
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" aria-hidden="true" />
      </div>
      {!failed ? (
        <iframe
          src={"https://discord.com/widget?id=" + guildId + "&theme=dark"}
          width="100%"
          height="420"
          allowTransparency={true}
          frameBorder={0}
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          title={name + " Discord server"}
          loading="lazy"
          className="w-full block bg-transparent"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="p-8 text-center mono text-[11px] tracking-widest text-mist">
          WIDGET OFFLINE — ENABLE SERVER WIDGET IN DISCORD SETTINGS
        </div>
      )}
    </div>
  );
}
