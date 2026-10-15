const BADGES: { bit: number; name: string; glyph: string }[] = [
  { bit: 1, name: "STAFF", glyph: "✦" },
  { bit: 2, name: "PARTNER", glyph: "❖" },
  { bit: 4, name: "HYPESQUAD", glyph: "◈" },
  { bit: 8, name: "BUG HUNTER", glyph: "✚" },
  { bit: 64, name: "BRAVERY", glyph: "▲" },
  { bit: 128, name: "BRILLIANCE", glyph: "●" },
  { bit: 256, name: "BALANCE", glyph: "■" },
  { bit: 512, name: "EARLY SUPPORTER", glyph: "★" },
  { bit: 16384, name: "BUG HUNTER+", glyph: "✚" },
  { bit: 65536, name: "EARLY VERIFIED DEV", glyph: "</>" },
  { bit: 131072, name: "MOD ALUMNI", glyph: "⬢" },
  { bit: 262144, name: "ACTIVE DEV", glyph: "⚡" }
];

export default function DiscordBadges({ flags = 0, premiumType = null, boosting = false }: { flags?: number; premiumType?: number | null; boosting?: boolean }) {
  const earned = BADGES.filter((b) => (flags & b.bit) === b.bit);
  if (premiumType !== null && premiumType >= 1) {
    earned.unshift({ bit: 0, name: premiumType === 2 ? "NITRO" : "NITRO BASIC", glyph: "◆" });
  }
  if (boosting) {
    earned.unshift({ bit: 0, name: "BOOSTER", glyph: "▲" });
  }
  if (earned.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5 mt-4" aria-label="Discord badges">
      {earned.map((b, i) => (
        <span
          key={b.bit + "-" + i}
          title={b.name}
          className="mono text-[10px] tracking-[0.15em] border border-line text-fog rounded-full px-2.5 py-1 flex items-center gap-1.5"
        >
          <span aria-hidden="true" className="text-white">{b.glyph}</span>
          {b.name}
        </span>
      ))}
    </div>
  );
}
