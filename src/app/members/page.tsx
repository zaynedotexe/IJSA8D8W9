"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CodeTexture from "@/components/CodeTexture";
import RoleIcon from "@/components/RoleIcon";
import { glow } from "@/lib/glow";
import type { RowMember } from "@/components/MemberRow";

function StackCard({ m, index, total }: { m: RowMember; index: number; total: number }) {
  const display = m.nickname || m.globalName || m.username;
  const left = index % 2 === 0;
  return (
    <div className={"md:[perspective:1400px] " + (left ? "" : "md:flex md:justify-end")}>
      <Link
        href={"/member/" + encodeURIComponent(m.username || m.id)}
        className={
          "group relative block w-full md:w-[68%] rounded-[28px] border border-white/10 bg-[#0a0a0a] overflow-hidden transition-transform duration-500 ease-out " +
          "md:hover:[transform:rotateY(0deg)_rotateX(0deg)_translateY(-6px)] " +
          (left ? "md:[transform:rotateY(-9deg)_rotateX(2deg)]" : "md:[transform:rotateY(9deg)_rotateX(2deg)]")
        }
        style={glow(m.glowColor, 0.35) ? { boxShadow: "0 30px 90px -20px " + glow(m.glowColor, 0.35) } : undefined}
      >
        <div className="relative h-64 md:h-80 overflow-hidden">
          {m.backgroundUrl ? (
            <img src={m.backgroundUrl} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 bg-grid opacity-70" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <span className="absolute top-4 right-5 mono text-[10px] tracking-[0.3em] text-white/70">
            MEMBER / {String(index + 1).padStart(2, "0")}
          </span>
          <span className="absolute top-4 left-5 mono text-[10px] tracking-[0.3em] text-white/40">
            {String(total).padStart(2, "0")} SIGNALS
          </span>
        </div>
        <div className="relative flex items-center gap-4 p-5 md:p-6 bg-black/80 backdrop-blur">
          {m.avatar ? (
            <img
              src={m.avatar}
              alt={display}
              loading="lazy"
              className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border border-line shrink-0"
              style={glow(m.glowColor, 0.9) ? { boxShadow: "0 0 16px 3px " + glow(m.glowColor, 0.9) } : undefined}
            />
          ) : (
            <span className="w-14 h-14 md:w-16 md:h-16 rounded-full grid place-items-center border border-line bg-[#0b0b0b] font-display text-2xl shrink-0">
              {display.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="flex-1 min-w-0 text-left">
            <div className="font-display text-2xl md:text-4xl tracking-wide truncate">{display}</div>
            <div className="mono text-[10px] md:text-[11px] tracking-[0.2em] text-mist mt-1 truncate">@{m.username} — {m.identity}</div>
          </div>
          <span className="mono text-xl text-fog group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" aria-hidden="true">→</span>
        </div>
        {m.roles.length > 0 ? (
          <div className="flex gap-1.5 px-5 md:px-6 pb-5 bg-black/80 overflow-x-auto no-scrollbar">
            {m.roles.slice(0, 4).map((r) => (
              <span key={r.roleId} className="mono text-[10px] tracking-[0.2em] border border-line text-fog rounded-full px-3 py-1 flex items-center gap-1.5 shrink-0">
                <RoleIcon roleId={r.roleId} icon={r.icon} emoji={r.unicodeEmoji} size={12} />
                {r.name}
              </span>
            ))}
          </div>
        ) : null}
      </Link>
    </div>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<RowMember[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/members?page=1&limit=100", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members || []);
        setTotal(d.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden">
        <CodeTexture lines={["$ enum index", "> resolving identities", "[ok] hierarchy loaded", "0xMEMBERS"]} />
        <div className="relative px-5 md:px-10 pt-14 md:pt-20 pb-8 max-w-6xl">
          <div className="mono text-[11px] tracking-[0.45em] text-fog">DIRECTORY — {loading ? "···" : total + " SIGNAL" + (total === 1 ? "" : "S")}</div>
          <h1 className="font-display text-6xl md:text-8xl mt-3 leading-[0.9]">
            MEM<span className="text-outline">BERS</span>
          </h1>
        </div>
      </section>

      <section className="px-5 md:px-10 pb-20 max-w-6xl">
        <div className="border-t border-line pt-10 flex flex-col gap-10 md:gap-14">
          {loading ? (
            [0, 1].map((i) => (
              <div key={i} className="w-full md:w-[68%] rounded-[28px] border border-line overflow-hidden animate-pulse">
                <div className="h-64 md:h-80 bg-[#101010]" />
                <div className="p-6 bg-black flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#141414]" />
                  <div className="flex-1">
                    <div className="h-7 w-48 bg-[#141414] rounded-full" />
                    <div className="h-3 w-28 bg-[#101010] rounded-full mt-2" />
                  </div>
                </div>
              </div>
            ))
          ) : members.length === 0 ? (
            <div className="py-20 text-center">
              <div className="font-display text-3xl text-outline-faint">NO SIGNAL</div>
              <div className="text-fog text-sm mt-3">The index is empty — check back soon.</div>
            </div>
          ) : (
            members.map((m, i) => <StackCard key={m.id} m={m} index={i} total={total} />)
          )}
        </div>
      </section>
    </div>
  );
}
