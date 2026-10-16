import Link from "next/link";
import CodeTexture from "@/components/CodeTexture";
import Ticker from "@/components/Ticker";
import { accentFor } from "@/lib/site";
import { prisma } from "@/lib/db";
import { SEED_AFFILIATIONS } from "@/lib/site";

export const revalidate = 60;

function clean<T extends { logoUrl?: string | null }>(a: T): T {
  if (a.logoUrl && a.logoUrl.startsWith("/aff-")) return { ...a, logoUrl: a.logoUrl.replace("/aff-", "/ally-") };
  return a;
}

async function getData() {
  if (!prisma) return SEED_AFFILIATIONS.map(clean);
  try {
    const rows = await prisma.affiliation.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
    return rows.map(clean);
  } catch {
    return SEED_AFFILIATIONS.map(clean);
  }
}

export default async function AffiliationsPage() {
  const list = await getData();
  return (
    <div>
      <section className="relative overflow-hidden">
        <CodeTexture lines={["$ trace network", "> handshake ok", "[ok] allies resolved", "0xALLIES"]} />
        <div className="relative px-5 md:px-10 pt-14 md:pt-20 pb-8 max-w-6xl">
          <div className="mono text-[11px] tracking-[0.45em] text-fog">NETWORK — {list.length} LINKED</div>
          <h1 className="font-display text-6xl md:text-8xl mt-3 leading-[0.9]">
            AFFIL<span className="text-outline">IATES</span>
          </h1>
          <p className="text-fog text-sm mt-4 max-w-xl">Communities and identities linked to Lonestar. Managed by the administrator.</p>
        </div>
      </section>

      {list.length > 0 ? (
        <Ticker items={list.map((a: { name: string }) => a.name)} fast />
      ) : null}

      <section className="px-5 md:px-10 py-12 max-w-6xl">
        {list.length === 0 ? (
          <div className="border-t border-line py-20 text-center mono text-xs tracking-[0.3em] text-mist">NO AFFILIATIONS PUBLISHED</div>
        ) : (
          <div className="border-t border-line">
            {list.map((a: { id: string; name: string; description: string; category?: string | null; externalUrl?: string | null; logoUrl?: string | null }, i: number) => (
              <div key={a.id} className="flex flex-col md:flex-row gap-5 md:gap-8 py-8 md:py-10 border-b border-line group">
                <span className="mono text-[11px] text-mist md:w-10 shrink-0 pt-2">{String(i + 1).padStart(2, "0")}</span>
                {a.logoUrl ? (
                  <img
                    src={a.logoUrl}
                    alt={a.name}
                    loading="lazy"
                    style={{ "--acc": accentFor(a.name) } as React.CSSProperties}
                    className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover border border-line grayscale hover:grayscale-0 transition-all duration-500 shrink-0 hover:shadow-[0_0_36px_6px_var(--acc)]"
                  />
                ) : (
                  <span className="w-20 h-20 md:w-28 md:h-28 rounded-2xl grid place-items-center border border-line font-display text-3xl md:text-4xl bg-[#0b0b0b] shrink-0">
                    {a.name.slice(0, 1)}
                  </span>
                )}
                <div className="flex-1">
                  <div className="mono text-[10px] tracking-[0.35em] text-mist">{a.category || "LINKED"}</div>
                  <div className="font-display text-2xl md:text-4xl tracking-wide mt-1">{a.name}</div>
                  <p className="text-fog text-sm mt-2 max-w-2xl leading-relaxed">{a.description}</p>
                  {a.externalUrl ? (
                    <a href={a.externalUrl} target="_blank" rel="noreferrer" className="mono text-[11px] tracking-[0.25em] text-fog hover:text-white mt-4 inline-block border border-line hover:border-white rounded-full px-5 py-2 transition-colors">
                      VISIT ↗
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-10">
          <Link href="/" className="mono text-[11px] tracking-widest text-mist hover:text-white">← HOME</Link>
        </div>
      </section>
    </div>
  );
}
