"use client";

import { useEffect, useState } from "react";
import CodeTexture from "@/components/CodeTexture";
import MemberRow, { type RowMember } from "@/components/MemberRow";

type Role = { roleId: string; name: string };

export default function MembersPage() {
  const [members, setMembers] = useState<RowMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/roles", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const seen = new Set<string>();
        const unique: Role[] = [];
        for (const r of (d.roles || []) as Role[]) {
          const key = r.name.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(r);
          }
        }
        setRoles(unique);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ search, role, page: String(page), limit: "20" });
    fetch("/api/members?" + params.toString(), { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members || []);
        setTotalPages(d.totalPages || 1);
        setTotal(d.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, role, page]);

  return (
    <div>
      <section className="relative overflow-hidden">
        <CodeTexture lines={["$ enum index", "> resolving identities", "[ok] hierarchy loaded", "0xMEMBERS"]} />
        <div className="relative px-5 md:px-10 pt-14 md:pt-20 pb-8 max-w-6xl">
          <div className="mono text-[11px] tracking-[0.45em] text-fog">DIRECTORY — {loading ? "···" : total + " SIGNAL" + (total === 1 ? "" : "S")}</div>
          <h1 className="font-display text-6xl md:text-8xl mt-3 leading-[0.9]">
            MEM<span className="text-outline">BERS</span>
          </h1>
          <div className="flex flex-col md:flex-row gap-3 mt-8 max-w-3xl">
            <div className="flex-1 flex items-center gap-3 bg-[#0b0b0b] border border-line rounded-full px-5 py-3 focus-within:border-white transition-colors">
              <span className="mono text-fog" aria-hidden="true">⌕</span>
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search the index..."
                className="flex-1 bg-transparent mono text-xs tracking-widest text-white placeholder:text-mist focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => {
                setPage(1);
                setRole("");
              }}
              className={
                "mono text-[10px] tracking-[0.2em] rounded-full px-4 py-2 border shrink-0 transition-colors " +
                (role === "" ? "bg-white text-black border-white" : "text-fog border-line hover:text-white hover:border-white")
              }
            >
              ALL
            </button>
            {roles.map((r) => (
              <button
                key={r.name}
                onClick={() => {
                  setPage(1);
                  setRole(role === r.name ? "" : r.name);
                }}
                className={
                  "mono text-[10px] tracking-[0.2em] rounded-full px-4 py-2 border shrink-0 transition-colors " +
                  (role === r.name ? "bg-white text-black border-white" : "text-fog border-line hover:text-white hover:border-white")
                }
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      </section>

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
              <div className="text-fog text-sm mt-3">Try a different search or caste.</div>
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
    </div>
  );
}
