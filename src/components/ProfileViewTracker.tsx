"use client";

import { useEffect, useRef } from "react";

export default function ProfileViewTracker({ id }: { id: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    fetch("/api/views/profile/" + id, { method: "POST", cache: "no-store" }).catch(() => {});
  }, [id]);
  return null;
}
