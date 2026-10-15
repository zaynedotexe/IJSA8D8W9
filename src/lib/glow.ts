export function glow(hex: string | null | undefined, alpha: number): string | undefined {
  if (!hex) return undefined;
  const m = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return undefined;
  let full = m[1];
  if (full.length === 3) full = full.split("").map((c) => c + c).join("");
  const a = Math.max(0, Math.min(1, alpha));
  const aa = Math.round(a * 255).toString(16).padStart(2, "0");
  return "#" + full.toLowerCase() + aa;
}

export function isHexColor(v: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());
}
