import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <div className="mono text-xs tracking-[0.35em]">LONESTAR</div>
          <div className="mono text-[11px] text-mist mt-2 tracking-widest">UNDERGROUND DIGITAL COLLECTIVE</div>
        </div>
        <div className="flex gap-5 mono text-[11px] tracking-widest text-fog">
          <Link href="/members" className="hover:text-white">MEMBERS</Link>
          <Link href="/affiliations" className="hover:text-white">AFFILIATIONS</Link>
          <Link href="/login" className="hover:text-white">LOGIN</Link>
        </div>
        <div className="mono text-[11px] text-mist tracking-widest">Made by Ego · Lonestar On Top</div>
      </div>
    </footer>
  );
}
