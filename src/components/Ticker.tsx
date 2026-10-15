export default function Ticker({ items, fast = false }: { items: string[]; fast?: boolean }) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden border-y border-line bg-black marquee-paused no-scrollbar">
      <div className={fast ? "marquee-track-fast py-3 will-change-transform" : "marquee-track py-3 will-change-transform"} aria-hidden={false}>
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center shrink-0" aria-hidden={i >= items.length * 2}>
            <span className="mono text-xs tracking-[0.35em] text-fog px-6 whitespace-nowrap">{t}</span>
            <span className="text-mist shrink-0" aria-hidden="true">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
