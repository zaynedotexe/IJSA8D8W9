import Link from "next/link";

async function getData() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");
    const res = await fetch(base + "/api/affiliations", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const d = await res.json();
    return d.affiliations || [];
  } catch {
    return [];
  }
}

export default async function AffiliationsPage() {
  const list = await getData();
  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <div className="mono text-[11px] tracking-[0.4em] text-mist">NETWORK</div>
      <h1 className="mono text-4xl tracking-[0.15em] mt-3">AFFILIATIONS</h1>
      <p className="text-fog text-sm mt-3 max-w-xl">Communities and identities linked to Lonestar. Managed by the administrator.</p>
      {list.length === 0 ? (
        <div className="border border-line p-14 text-center mt-8 mono text-xs tracking-widest text-mist">NO AFFILIATIONS PUBLISHED</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {list.map((a: { id: string; name: string; description: string; category?: string; externalUrl?: string; logoUrl?: string }) => (
            <div key={a.id} className="border border-line bg-coal p-6 flex gap-5">
              {a.logoUrl ? (
                <img src={a.logoUrl} alt={a.name} className="w-16 h-16 object-cover border border-line grayscale" loading="lazy" />
              ) : (
                <div className="w-16 h-16 grid place-items-center border border-line mono text-xl bg-black">{a.name.slice(0, 1)}</div>
              )}
              <div className="flex-1">
                <div className="mono text-[10px] tracking-[0.3em] text-mist">{a.category || "LINKED"}</div>
                <div className="mono text-lg tracking-widest mt-1">{a.name}</div>
                <p className="text-fog text-sm mt-2">{a.description}</p>
                {a.externalUrl ? (
                  <a href={a.externalUrl} target="_blank" rel="noreferrer" className="mono text-[11px] tracking-widest text-fog hover:text-white mt-3 inline-block">VISIT ↗</a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-10">
        <Link href="/" className="mono text-[11px] tracking-widest text-mist hover:text-white">← HOME</Link>
      </div>
    </div>
  );
}
