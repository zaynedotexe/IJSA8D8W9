"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileEditor, { type EditableProfile } from "@/components/ProfileEditor";

type FullProfile = EditableProfile & {
  username: string | null;
  globalName: string | null;
  avatar: string | null;
  nickname: string | null;
};

export default function MePage() {
  const router = useRouter();
  const [state, setState] = useState<string>("loading");
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [detail, setDetail] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((me) => {
        if (!alive) return;
        if (!me.authenticated) {
          router.replace("/login");
          return;
        }
        if (!me.isMember) {
          setState("not_member");
          return;
        }
        if (!me.profileId) {
          setState("no_profile");
          return;
        }
        return fetch("/api/profiles/" + me.profileId, { cache: "no-store" })
          .then((r) => r.json())
          .then((d) => {
            if (!alive) return;
            if (d.profile) {
              setProfile(d.profile);
              setState("ready");
            } else {
              setDetail("Profile unavailable");
              setState("error");
            }
          });
      })
      .catch(() => {
        if (alive) {
          setDetail("Network error");
          setState("error");
        }
      });
    return () => {
      alive = false;
    };
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/");
  }

  if (state === "loading") {
    return <div className="max-w-3xl mx-auto px-5 py-24 mono text-xs tracking-widest text-mist">VERIFYING IDENTITY...</div>;
  }

  if (state === "not_member") {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <div className="mono text-xs tracking-[0.3em] text-mist">ACCESS DENIED</div>
        <p className="text-fog text-sm mt-4">You are not currently a member of the Lonestar Discord server.</p>
        <button onClick={logout} className="mono text-xs tracking-widest border border-line px-6 py-3 mt-8 text-fog hover:text-white">LOGOUT</button>
      </div>
    );
  }

  if (state === "no_profile") {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <div className="mono text-xs tracking-[0.3em] text-mist">NO PROFILE ASSIGNED</div>
        <p className="text-fog text-sm mt-4">Ego has not created a website profile for your Discord account yet. Membership alone does not create one.</p>
        <button onClick={logout} className="mono text-xs tracking-widest border border-line px-6 py-3 mt-8 text-fog hover:text-white">LOGOUT</button>
      </div>
    );
  }

  if (state === "error" || !profile) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <div className="mono text-xs tracking-[0.3em] text-mist">ERROR</div>
        <p className="text-fog text-sm mt-4">{detail || "Something went wrong."}</p>
        <Link href="/" className="mono text-xs tracking-widest text-white mt-8 inline-block">← HOME</Link>
      </div>
    );
  }

  const display = profile.displayName || profile.nickname || profile.globalName || profile.username || "YOU";

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="mono text-[11px] tracking-[0.4em] text-mist">MY PROFILE</div>
          <h1 className="font-display text-3xl md:text-4xl tracking-wide mt-2">{display}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={"/" + encodeURIComponent(profile.username || profile.id)} className="mono text-[11px] tracking-widest border border-line rounded-full px-4 py-2 text-fog hover:text-white">VIEW PUBLIC</Link>
          <button onClick={logout} className="mono text-[11px] tracking-widest border border-line rounded-full px-4 py-2 text-fog hover:text-white">LOGOUT</button>
        </div>
      </div>
      <div className="mt-8">
        <ProfileEditor initial={profile} onSaved={(p) => setProfile({ ...profile, ...p })} />
      </div>
    </div>
  );
}
