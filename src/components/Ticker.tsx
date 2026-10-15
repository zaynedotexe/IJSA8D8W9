export default function Ticker({ items, fast = false }: { items: string[]; fast?: boolean }) {
  if (items.length === 0) return null;
  const row = (key: string, hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {items.map((t, i) => (
        <span key={key + i} className="flex items-center shrink-0">
          <span className="mono text-xs tracking-[0.35em] text-fog px-6">{t}</span>
          <span className="text-mist" aria-hidden="true">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="overflow-hidden border-y border-line bg-black marquee-paused no-scrollbar">
      <div className={fast ? "marquee-track-fast py-3" : "marquee-track py-3"}>
        {row("a", false)}
        {row("b", true)}
      </div>
    </div>
  );
}
