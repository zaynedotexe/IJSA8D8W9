export default function CodeTexture({ lines, className = "" }: { lines: string[]; className?: string }) {
  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden " + className} aria-hidden="true">
      {lines.map((line, i) => (
        <div
          key={i}
          className="code-line mono text-[11px] md:text-xs text-[#2e2e2e] whitespace-nowrap absolute"
          style={{ top: 8 + i * 9 + "%", left: (i % 3) * 22 + 4 + "%", animationDelay: 0.15 + i * 0.35 + "s" }}
        >
          {line}
        </div>
      ))}
      <div className="absolute inset-0 bg-grid opacity-40" />
    </div>
  );
}
