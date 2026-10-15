"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginInner() {
  const params = useSearchParams();
  const error = params.get("error");
  const message =
    error === "cancelled"
      ? "Login was cancelled."
      : error === "invalid_state"
        ? "Session expired. Try again."
        : error === "not_member"
          ? "You must be a member of the Lonestar Discord server."
          : error === "oauth_failed"
            ? "Discord login failed. Try again."
            : null;

  return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <div className="mono text-[11px] tracking-[0.4em] text-mist">ACCESS</div>
      <h1 className="mono text-4xl tracking-[0.15em] mt-4">LOGIN</h1>
      <p className="text-fog text-sm mt-4 leading-relaxed">
        Authenticate with Discord. Only members with an approved profile created by Ego can edit. Server membership alone does not create a profile.
      </p>
      {message ? <div className="border border-line bg-coal mono text-[11px] tracking-widest text-fog px-4 py-3 mt-6">{message}</div> : null}
      <a
        href="/api/auth/login"
        className="mono text-xs tracking-[0.25em] bg-white text-black px-8 py-4 inline-block mt-8 hover:bg-fog transition-colors"
      >
        LOGIN WITH DISCORD
      </a>
      <div className="mt-8">
        <Link href="/" className="mono text-[11px] tracking-widest text-mist hover:text-white">← HOME</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-xl mx-auto px-5 py-24 mono text-xs text-mist">LOADING...</div>}>
      <LoginInner />
    </Suspense>
  );
}
