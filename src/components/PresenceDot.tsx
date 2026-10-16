export default function PresenceDot({ status, size = 16 }: { status?: string | null; size?: number }) {
  const s = (status || "offline").toLowerCase();
  const base = "rounded-full shrink-0 border-2 border-black";
  const style = { width: size, height: size };
  if (s === "online") return <span aria-label="online" title="Online" className={base + " bg-white"} style={style} />;
  if (s === "idle") return <span aria-label="idle" title="Idle" className={base + " bg-[#6b6b6b]"} style={style} />;
  if (s === "dnd") return <span aria-label="do not disturb" title="Do not disturb" className={base + " bg-black border-white flex items-center justify-center"} style={style}><span className="rounded-full bg-white" style={{ width: size * 0.35, height: size * 0.35 }} /></span>;
  return <span aria-label="offline" title="Offline" className={base + " bg-[#2a2a2a]"} style={style} />;
}
