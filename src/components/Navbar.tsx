"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type MeResponse = {
  authenticated: boolean;
  profileId: string | null;
  user?: { isAdmin?: boolean } | null;
};

export default function Navbar() {
  const pathname = usePathname();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive) setMe(d);
      })
      .catch(() => {
        if (alive) setMe(null);
      });
    return () => {
      alive = false;
    };
  }, [pathname]);

  const link = (href: string, label: string) => {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={
          "mono text-xs tracking-[0.2em] px-3 py-2 border transition-colors " +
          (active ? "text-black bg-white border-white" : "text-fog border-transparent hover:text-white hover:border-line")
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-7 h-7 border border-white grid place-items-center mono text-sm">L</span>
          <span className="mono text-sm tracking-[0.35em]">LONESTAR</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {link("/", "HOME")}
          {link("/members", "MEMBERS")}
          {link("/affiliations", "AFFILIATIONS")}
          {me?.authenticated ? link("/me", "MY PROFILE") : link("/login", "LOGIN")}
          {me?.user?.isAdmin ? link("/admin", "ADMIN") : null}
        </nav>
        <button
          className="md:hidden mono text-xs tracking-widest border border-line px-3 py-2 text-fog"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </div>
      {open ? (
        <div className="md:hidden border-t border-line px-5 py-4 flex flex-col gap-2 bg-black">
          <Link href="/" onClick={() => setOpen(false)} className="mono text-xs tracking-widest text-fog py-2">HOME</Link>
          <Link href="/members" onClick={() => setOpen(false)} className="mono text-xs tracking-widest text-fog py-2">MEMBERS</Link>
          <Link href="/affiliations" onClick={() => setOpen(false)} className="mono text-xs tracking-widest text-fog py-2">AFFILIATIONS</Link>
          {me?.authenticated ? (
            <Link href="/me" onClick={() => setOpen(false)} className="mono text-xs tracking-widest text-fog py-2">MY PROFILE</Link>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="mono text-xs tracking-widest text-fog py-2">LOGIN</Link>
          )}
          {me?.user?.isAdmin ? (
            <Link href="/admin" onClick={() => setOpen(false)} className="mono text-xs tracking-widest text-fog py-2">ADMIN</Link>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
