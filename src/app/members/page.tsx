"use client";

import { useEffect, useState } from "react";
import MemberCard, { type CardMember } from "@/components/MemberCard";

type Role = { roleId: string; name: string };

export default function MembersPage() {
  const [members, setMembers] = useState<CardMember[]>([]);
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
      .then((d) => setRoles(d.roles || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ search, role, page: String(page), limit: "24" });
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
    <div className="max-w-6xl mx-auto px-5 py-12">
      <div className="mono text-[11px] tracking-[0.4em] text-mist">DIRECTORY</div>
      <h1 className="mono text-4xl tracking-[0.15em] mt-3">MEMBERS</h1>
      <p className="text-fog text-sm mt-3 max-w-xl">Only approved profiles appear here. Order follows role hierarchy, then name.</p>

      <div className="flex flex-col md:flex-row gap-3 mt-8">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="SEARCH USERNAME OR DISPLAY NAME"
          className="flex-1 bg-coal border border-line px-4 py-3 mono text-xs tracking-widest text-white placeholder:text-mist focus:border-white"
        />
        <select
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
          }}
          className="bg-coal border border-line px-4 py-3 mono text-xs tracking-widest text-fog focus:border-white"
        >
          <option value="">ALL ROLES</option>
          {roles.map((r) => (
            <option key={r.roleId} value={r.roleId}>{r.name}</option>
          ))}
        </select>
      </div>

      <div className="mono text-[11px] tracking-widest text-mist mt-6">{loading ? "LOADING..." : total + " PROFILE" + (total === 1 ? "" : "S")}</div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-line h-56 bg-coal animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="border border-line p-14 text-center mt-4">
          <div className="mono text-xs tracking-[0.3em] text-mist">NO MEMBERS FOUND</div>
          <div className="text-fog text-sm mt-2">Try a different search or filter.</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {members.map((m) => (
            <MemberCard key={m.id} m={m} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center gap-3 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="mono text-[11px] tracking-widest border border-line px-4 py-2 text-fog hover:text-white disabled:opacity-40"
          >
            ← PREV
          </button>
          <span className="mono text-[11px] tracking-widest text-mist">PAGE {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="mono text-[11px] tracking-widest border border-line px-4 py-2 text-fog hover:text-white disabled:opacity-40"
          >
            NEXT →
          </button>
        </div>
      ) : null}
    </div>
  );
}
