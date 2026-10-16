"use client";

import Link from "next/link";
import RoleIcon from "@/components/RoleIcon";
import { glow } from "@/lib/glow";

export type RowMember = {
  id: string;
  identity: string;
  status?: string | null;
  displayName?: string | null;
  glowColor?: string | null;
  backgroundUrl?: string | null;
  username: string;
  globalName: string | null;
  avatar: string | null;
  nickname: string | null;
  roles: { roleId: string; name: string; icon?: string | null; unicodeEmoji?: string | null }[];
  affiliation?: { name: string } | null;
};

export default function MemberRow({ m, index }: { m: RowMember; index: number }) {
  const display = m.displayName || m.nickname || m.globalName || m.username;
  return (
    <Link
      href={"/" + encodeURIComponent(m.username || m.id)}
      className="group flex items-center gap-4 md:gap-6 py-4 md:py-5 border-b border-line px-2 md:px-4 transition-colors hover:bg-white hover:text-black"
    >
      <span className="mono text-[11px] text-mist group-hover:text-black/60 w-8 shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>
      {m.avatar ? (
        <img
          src={m.avatar}
          alt={display}
          loading="lazy"
          className="w-11 h-11 md:w-14 md:h-14 rounded-full object-cover border border-line group-hover:border-black/30 shrink-0"
          style={glow(m.glowColor, 0.9) ? { boxShadow: "0 0 14px 2px " + glow(m.glowColor, 0.9) } : undefined}
        />
      ) : (
        <span
          className="w-11 h-11 md:w-14 md:h-14 rounded-full grid place-items-center border border-line bg-black mono text-lg shrink-0"
          style={glow(m.glowColor, 0.9) ? { boxShadow: "0 0 14px 2px " + glow(m.glowColor, 0.9) } : undefined}
        >
          {display.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="font-display text-lg md:text-2xl tracking-wide block truncate">{display}</span>
        <span className="mono text-[10px] md:text-[11px] tracking-[0.2em] text-mist group-hover:text-black/60 block truncate">
          @{m.username} — {m.identity}
        </span>
      </span>
      <span className="hidden md:flex gap-1.5 shrink-0">
        {m.roles.slice(0, 3).map((r) => (
          <span key={r.roleId} className="mono text-[10px] tracking-[0.2em] border border-line group-hover:border-black/30 text-fog group-hover:text-black/70 rounded-full px-3 py-1 flex items-center gap-1.5">
            <RoleIcon roleId={r.roleId} icon={r.icon} emoji={r.unicodeEmoji} size={12} />
            {r.name}
          </span>
        ))}
      </span>
      <span className="mono text-sm shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
    </Link>
  );
}
