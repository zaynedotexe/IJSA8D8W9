"use client";

import Link from "next/link";

export type CardMember = {
  id: string;
  identity: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  nickname: string | null;
  roles: { roleId: string; name: string; style?: string | null }[];
  backgroundUrl?: string | null;
  affiliation?: { name: string } | null;
};

export default function MemberCard({ m }: { m: CardMember }) {
  const display = m.nickname || m.globalName || m.username;
  const initial = (display || "?").slice(0, 1).toUpperCase();
  return (
    <Link
      href={"/member/" + m.id}
      className="group border border-line bg-coal hover:border-fog transition-colors overflow-hidden flex flex-col"
    >
      <div className="relative h-36 bg-smoke overflow-hidden">
        {m.backgroundUrl ? (
          <img src={m.backgroundUrl} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-grid opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          {m.avatar ? (
            <img src={m.avatar} alt={display} className="w-12 h-12 object-cover border border-line bg-black" loading="lazy" />
          ) : (
            <span className="w-12 h-12 grid place-items-center border border-line bg-black mono text-lg">{initial}</span>
          )}
          <div>
            <div className="mono text-sm text-white leading-tight">{display}</div>
            <div className="mono text-[11px] text-mist tracking-widest">@{m.username} · {m.identity}</div>
          </div>
        </div>
      </div>
      <div className="p-3 flex flex-wrap gap-1.5">
        {m.roles.slice(0, 4).map((r) => (
          <span key={r.roleId} className="mono text-[10px] tracking-[0.2em] border border-line text-fog px-2 py-1">
            {r.name}
          </span>
        ))}
        {m.affiliation ? (
          <span className="mono text-[10px] tracking-[0.2em] border border-line text-mist px-2 py-1">{m.affiliation.name}</span>
        ) : null}
      </div>
    </Link>
  );
}
