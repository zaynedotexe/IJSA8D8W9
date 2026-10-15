"use client";

import MemberPage from "../member/[id]/page";

export default function UsernamePage({ params }: { params: { username: string } }) {
  return <MemberPage params={{ id: params.username }} />;
}
