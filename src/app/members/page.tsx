"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CodeTexture from "@/components/CodeTexture";
import MemberRow, { type RowMember } from "@/components/MemberRow";
import RoleIcon from "@/components/RoleIcon";
import { glow } from "@/lib/glow";

function Spotlight({ m, index, total }: { m: RowMember; index: number; total: number }) {
  const display = m.nickname || m.globalName || m.username;
  return (
    <Link href={"/member/" + m.id} className="group block text-center px-4 py-10 md:py-14 animate-enter" key={m.id}>
      <div className="relative inline-block">
        {m.backgroundUrl ? (
          <img src={m.backgroundUrl} alt="" aria-hidden="true" loading="lazy" className="absolute -inset-10 w-[calc(100%+5rem)] h-[calc(100%+5rem)] object-cover opacity-20 blur-2xl rounded-full pointer-events-none" />
        ) : null}
        {m.avatar ? (
          <img
            src={m.avatar}
            alt={display}
            className="relative w-32 h-32 md:w-44 md:h-44 rounded-full object-cover ring-2 ring-white/80 ring-offset-8 ring-offset-black mx-auto transition-transform duration-500 group-hover:scale-105"
            style={glow(m.glowColor, 0.9) ? { boxShadow: "0 0 34px 8px " + glow(m.glowColor, 0.9) } : undefined}
          />
        ) : (
          <span className="relative w-32 h-32 md:w-44 md:h-44 rounded-full grid place-items-center border border-line bg-[#0b0b0b] font-display text-5xl md:text-6xl mx-auto">
            {display.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="mono text-[11px] tracking-[0.4em] text-mist mt-7">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <div className="font-display text-4xl md:text-7xl tracking-wide mt-2 break-words leading-none">{display}</div>
      <div className="mono text-[11px] tracking-[0.25em] text-mist mt-3">@{m.username} — {m.identity}</div>
      <div className="flex flex-wrap justify-center gap-1.5 mt-5">
        {m.roles.slice(0, 4).map((r) => (
          <span key={r.roleId} className="mono text-[10px] tracking-[0.2em] border border-line text-fog rounded-full px-3.5 py-1.5 flex items-center gap-1.5">
            <RoleIcon roleId={r.roleId} icon={r.icon} emoji={r.unicodeEmoji} size={12} />
            {r.name}
          </span>
        ))}
      </div>
      <div className="mono text-[11px] tracking-[0.3em] text-fog mt-7 group-hover:text-white transition-colors">OPEN PROFILE →</div>
    </Link>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<RowMember[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"spotlight" | "index">("spotlight");
  const [spot, setSpot] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: view === "spotlight" ? "50" : "20" });
    fetch("/api/members?" + params.toString(), { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members || []);
        setTotalPages(d.totalPages || 1);
        setTotal(d.total || 0);
        setSpot(0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, view]);

  useEffect(() => {
    if (view !== "spotlight" || members.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setSpot((s) => (s + 1) % members.length), 7000);
    return () => window.clearInterval(t);
  }, [view, members, paused]);

  const current = members.length ? members[spot % members.length] : null;

  return (
    <div>
      <section className="relative overflow-hidden">
        <CodeTexture lines={["$ enum index", "> resolving identities", "[ok] hierarchy loaded", "0xMEMBERS"]} />
        <div className="relative px-5 md:px-10 pt-14 md:pt-20 pb-8 max-w-6xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="mono text-[11px] tracking-[0.45em] text-fog">DIRECTORY — {loading ? "···" : total + " SIGNAL" + (total === 1 ? "" : "S")}</div>
              <h1 className="font-display text-6xl md:text-8xl mt-3 leading-[0.9]">
                MEM<span className="text-outline">BERS</span>
              </h1>
            </div>
            <div className="flex border border-line rounded-full p-1 shrink-0" role="tablist" aria-label="View">
              {(["spotlight", "index"] as const).map((v) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => {
                    setView(v);
                    setPage(1);
                  }}
                  className={
                    "mono text-[10px] tracking-[0.2em] rounded-full px-4 py-2 transition-colors " +
                    (view === v ? "bg-white text-black" : "text-fog hover:text-white")
                  }
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {view === "spotlight" ? (
        <section className="px-5 md:px-10 pb-16 max-w-6xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-[#141414] animate-pulse mx-auto" />
              <div className="h-8 w-56 bg-[#141414] rounded-full mx-auto mt-7 animate-pulse" />
            </div>
          ) : !current ? (
            <div className="py-20 text-center border-t border-line">
              <div className="font-display text-3xl text-outline-faint">NO SIGNAL</div>
              <div className="text-fog text-sm mt-3">The index is empty — check back soon.</div>
            </div>
          ) : (
            <div className="border-t border-line">
              <Spotlight m={current} index={spot % members.length} total={members.length} />
              <div className="flex items-center justify-center gap-5 mt-2 pb-4">
                <button
                  onClick={() => setSpot((s) => (s - 1 + members.length) % members.length)}
                  aria-label="Previous member"
                  className="mono text-lg text-fog hover:text-white w-11 h-11 rounded-full border border-line hover:border-white transition-colors"
                >
                  ←
                </button>
                <div className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar py-2" role="tablist" aria-label="Members">
                  {members.slice(0, 30).map((m, i) => (
                    <button
                      key={m.id}
                      role="tab"
                      aria-selected={i === spot % members.length}
                      aria-label={(m.nickname || m.username) ?? "member"}
                      onClick={() => setSpot(i)}
                      className={
                        "rounded-full shrink-0 transition-all " +
                        (i === spot % members.length ? "w-8 h-2.5 bg-white" : "w-2.5 h-2.5 bg-[#2e2e2e] hover:bg-fog")
                      }
                    />
                  ))}
                </div>
                <button
                  onClick={() => setSpot((s) => (s + 1) % members.length)}
                  aria-label="Next member"
                  className="mono text-lg text-fog hover:text-white w-11 h-11 rounded-full border border-line hover:border-white transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="px-5 md:px-10 pb-16 max-w-6xl">
          <div className="border-t border-line">
            {loading ? (
              <div>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-5 py-5 border-b border-line animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-[#141414]" />
                    <div className="flex-1">
                      <div className="h-5 w-40 bg-[#141414] rounded-full" />
                      <div className="h-3 w-24 bg-[#101010] rounded-full mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="py-20 text-center">
                <div className="font-display text-3xl text-outline-faint">NO SIGNAL</div>
                <div className="text-fog text-sm mt-3">The index is empty — check back soon.</div>
              </div>
            ) : (
              members.map((m, i) => <MemberRow key={m.id} m={m} index={(page - 1) * 20 + i} />)
            )}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center gap-4 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="mono text-[11px] tracking-widest border border-line rounded-full px-5 py-2.5 text-fog hover:text-white disabled:opacity-40"
              >
                ← PREV
              </button>
              <span className="mono text-[11px] tracking-widest text-mist">PAGE {page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="mono text-[11px] tracking-widest border border-line rounded-full px-5 py-2.5 text-fog hover:text-white disabled:opacity-40"
              >
                NEXT →
              </button>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
