import Link from "next/link";
import LoadingScreen from "@/components/LoadingScreen";
import HomeViews from "@/components/HomeViews";

async function getAffiliations() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000");
    const res = await fetch(base + "/api/affiliations", { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.affiliations || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const affiliations = await getAffiliations();
  return (
    <div>
      <LoadingScreen />
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-16">
        <div className="animate-enter">
          <div className="mono text-[11px] tracking-[0.4em] text-mist">UNDERGROUND DIGITAL COLLECTIVE</div>
          <h1 className="mono text-6xl md:text-8xl tracking-[0.12em] mt-6 leading-none">LONESTAR</h1>
          <p className="text-fog max-w-xl mt-6 leading-relaxed">
            A quiet collective of distinct identities. Minimal noise. Precise presence. Membership is earned, profiles are curated, and every signal matters.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/members" className="mono text-xs tracking-[0.25em] bg-white text-black px-7 py-3.5 hover:bg-fog transition-colors">
              EXPLORE MEMBERS
            </Link>
            <Link href="/affiliations" className="mono text-xs tracking-[0.25em] border border-line text-fog px-7 py-3.5 hover:text-white hover:border-white transition-colors">
              AFFILIATIONS
            </Link>
          </div>
          <div className="mt-8 border-t border-line pt-5 flex flex-wrap gap-x-8 gap-y-2">
            <HomeViews />
            <span className="mono text-[11px] tracking-[0.25em] text-mist">STATUS — ONLINE</span>
            <span className="mono text-[11px] tracking-[0.25em] text-mist">MODE — PRIVATE</span>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-px bg-line border border-line">
          {[
            { k: "01", t: "IDENTITY", d: "Each member carries a single deliberate identity, tied to Discord and curated by Ego." },
            { k: "02", t: "HIERARCHY", d: "Roles define order. Visibility is intentional. Nothing leaks that should not." },
            { k: "03", t: "SIGNAL", d: "Profiles speak through biography, background, and sound. No clutter, only presence." }
          ].map((c) => (
            <div key={c.k} className="bg-black p-8">
              <div className="mono text-[11px] tracking-[0.3em] text-mist">{c.k}</div>
              <div className="mono text-sm tracking-[0.25em] mt-3">{c.t}</div>
              <p className="text-fog text-sm mt-3 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="mono text-[11px] tracking-[0.35em] text-mist">NETWORK</div>
            <h2 className="mono text-3xl tracking-[0.15em] mt-2">AFFILIATIONS</h2>
          </div>
          <Link href="/affiliations" className="mono text-[11px] tracking-widest text-fog hover:text-white">VIEW ALL →</Link>
        </div>
        {affiliations.length === 0 ? (
          <div className="border border-line p-10 text-center mono text-xs tracking-widest text-mist">NO AFFILIATIONS PUBLISHED</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {affiliations.slice(0, 6).map((a: { id: string; name: string; description: string; category?: string }) => (
              <div key={a.id} className="border border-line bg-coal p-6 hover:border-fog transition-colors">
                <div className="mono text-[10px] tracking-[0.3em] text-mist">{a.category || "LINKED"}</div>
                <div className="mono text-base tracking-widest mt-2">{a.name}</div>
                <p className="text-fog text-sm mt-2 line-clamp-3">{a.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto px-5 py-16 text-center">
          <div className="mono text-xs tracking-[0.4em] text-mist">LONESTAR ON TOP</div>
          <div className="mono text-[11px] tracking-widest text-mist mt-4">Made by Ego</div>
        </div>
      </section>
    </div>
  );
}
