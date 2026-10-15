import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import Ticker from "@/components/Ticker";
import CodeTexture from "@/components/CodeTexture";
import { prisma } from "@/lib/db";
import { SEED_AFFILIATIONS } from "@/lib/site";

export const revalidate = 60;

async function getData() {
  if (!prisma) return { affiliations: SEED_AFFILIATIONS, members: [] };
  try {
    const [affiliations, roles, profiles] = await Promise.all([
      prisma.affiliation.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
      prisma.roleConfig.findMany({ where: { visible: true } }),
      prisma.profile.findMany({
        where: { visible: true, approved: true },
        include: { discordIdentity: true, affiliation: true },
        take: 50
      })
    ]);
    const priorityOf = new Map(roles.map((r) => [r.roleId, r.priority]));
    const roleById = new Map(roles.map((r) => [r.roleId, r]));
    const members = profiles
      .filter((p) => p.discordIdentity && p.discordIdentity.isMember)
      .map((p) => {
        const id = p.discordIdentity!;
        const rids = (id.roleIds || []).filter((rid) => roleById.has(rid));
        const pri = rids.length ? Math.min(...rids.map((rid) => priorityOf.get(rid) ?? 9999)) : 9999;
        return {
          id: p.id,
          identity: p.identity,
          glowColor: p.glowColor,
          username: id.username,
          globalName: id.globalName,
          avatar: id.avatar,
          nickname: id.nickname,
          roles: rids.map((rid) => roleById.get(rid)!),
          affiliation: p.affiliation,
          priority: pri
        };
      })
      .sort((a, b) => (a.priority !== b.priority ? a.priority - b.priority : a.username.localeCompare(b.username)))
      .slice(0, 5);
    return { affiliations, members };
  } catch {
    return { affiliations: SEED_AFFILIATIONS, members: [] };
  }
}

export default async function Home() {
  const { affiliations, members } = await getData();
  return (
    <div>
      <LoadingScreen />
      <section className="relative overflow-hidden min-h-[92vh] flex flex-col justify-center">
        <CodeTexture
          lines={["$ whoami", "> lonestar", "const lonestar = { mode: 'underground' }", "0xLONESTAR", "$ nmap -sS collective", "[ok] identity verified"]}
          className="opacity-80"
        />
        <div className="relative px-5 md:px-10 pt-16 md:pt-24 pb-12 max-w-6xl mx-auto text-center">
          <div className="animate-enter">
            <div className="mono text-[11px] tracking-[0.45em] text-fog">DISCORD.GG/LONESTAR — UNDERGROUND DIGITAL COLLECTIVE</div>
            <img src="/lonestar-wordmark.png" alt="LONESTAR" className="w-full max-w-3xl mt-6 mx-auto select-none drift-slow" loading="eager" />
            <h1 className="sr-only">LONESTAR</h1>
            <p className="text-fog max-w-xl mx-auto mt-6 leading-relaxed text-sm md:text-base">
              A quiet collective of distinct identities. Minimal noise. Precise presence. Membership is earned, profiles are curated, and every signal matters.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link href="/members" className="mono text-xs tracking-[0.25em] bg-white text-black rounded-full px-8 py-4 hover:bg-fog transition-colors">
                ENTER THE INDEX →
              </Link>
              <Link href="/affiliations" className="mono text-xs tracking-[0.25em] border border-line text-fog rounded-full px-8 py-4 hover:text-white hover:border-white transition-colors">
                AFFILIATES
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-2 mt-10 mono text-[11px] tracking-[0.3em] text-mist">
              <span>EST. IN THE DARK</span>
              <span>MODE — PRIVATE</span>
              <span>{members.length > 0 ? "INDEX — LIVE" : "INDEX — STANDBY"}</span>
            </div>
          </div>
        </div>
      </section>

      <Ticker items={["LONESTAR ON TOP", "IDENTITY IS EARNED", "MINIMAL NOISE", "MADE BY EGO", "STAY UNDERGROUND"]} />

      <section className="border-t border-line">
        <div className="px-5 md:px-10 py-14 md:py-20 max-w-6xl">
          <div className="mono text-[11px] tracking-[0.4em] text-mist">DOCTRINE</div>
          {[
            { k: "I", t: "NO SNITCHING", d: "Loyalty first. What happens within Lonestar stays within Lonestar." },
            { k: "II", t: "REVENGE", d: "Never forget betrayal. Stay calm, act smart, and let consequences follow." },
            { k: "III", t: "MODDER", d: "Power comes with responsibility. No abuse, no favoritism, no unnecessary power trips." }
          ].map((c) => (
            <div key={c.k} className="flex gap-6 md:gap-10 py-8 border-b border-line group">
              <span className="font-display text-4xl md:text-6xl text-outline-faint group-hover:text-outline transition-all shrink-0">{c.k}</span>
              <div>
                <div className="font-display text-xl md:text-2xl tracking-wide">{c.t}</div>
                <p className="text-fog text-sm mt-2 max-w-lg leading-relaxed">{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 md:px-10 py-14 md:py-20 max-w-6xl">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="mono text-[11px] tracking-[0.4em] text-mist">NETWORK</div>
            <h2 className="font-display text-3xl md:text-5xl mt-2">AFFILIATES</h2>
          </div>
          <Link href="/affiliations" className="mono text-[11px] tracking-widest text-fog hover:text-white shrink-0">VIEW ALL →</Link>
        </div>
        {affiliations.length === 0 ? (
          <div className="border-t border-line py-14 text-center mono text-xs tracking-[0.3em] text-mist">NO AFFILIATIONS PUBLISHED</div>
        ) : (
          <div className="border-t border-line">
            {affiliations.slice(0, 4).map((a: { id: string; name: string; description: string; category?: string | null }, i: number) => (
              <Link key={a.id} href="/affiliations" className="group flex items-center gap-5 py-6 border-b border-line">
                <span className="mono text-[11px] text-mist w-8">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1">
                  <span className="font-display text-xl md:text-3xl tracking-wide block group-hover:translate-x-2 transition-transform">{a.name}</span>
                  <span className="text-fog text-sm mt-1 block line-clamp-1">{a.description}</span>
                </span>
                <span className="mono text-[10px] tracking-[0.25em] text-mist hidden sm:block">{a.category || "LINKED"}</span>
                <span className="mono group-hover:translate-x-1 transition-transform" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="relative overflow-hidden border-t border-line">
        <div className="px-5 md:px-10 py-16 md:py-24 text-center max-w-6xl mx-auto">
          <div className="mono text-[11px] tracking-[0.45em] text-mist">PROVE YOU BELONG</div>
          <Link href="/login" className="font-display block text-[13vw] md:text-8xl mt-4 leading-none hover:text-outline transition-all">
            JOIN US
          </Link>
          <div className="mono text-[11px] tracking-[0.3em] text-mist mt-6">DISCORD OAUTH — MEMBERS ONLY — MADE BY EGO</div>
        </div>
      </section>
    </div>
  );
}
