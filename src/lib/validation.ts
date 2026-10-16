import { z } from "zod";

const imageUrl = z
  .string()
  .max(2048)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v) || /^\/[^\s]*$/i.test(v), { message: "Invalid URL" })
  .refine((v) => v === "" || /\.(png|jpe?g|gif|webp|mp4|webm)(\?.*)?$/i.test(v), { message: "Only PNG JPG GIF WEBP MP4 WEBM allowed" });

const backgroundUrl = z
  .string()
  .max(2048)
  .refine(
    (v) => {
      if (v === "") return true;
      if (/^\/[^\s]*$/i.test(v)) return /\.(png|jpe?g|gif|webp|mp4|webm)(\?.*)?$/i.test(v);
      if (!/^https?:\/\/[^\s]+$/i.test(v)) return false;
      if (/\.(png|jpe?g|gif|webp|mp4|webm)(\?.*)?$/i.test(v)) return true;
      try {
        const u = new URL(v);
        if (u.hostname.includes("youtu.be")) return /^\/[\w-]{11}/.test(u.pathname);
        if (u.hostname.includes("youtube.com")) return (u.searchParams.get("v") || "").length === 11;
      } catch {}
      return false;
    },
    { message: "Use PNG JPG GIF MP4 WEBM or a YouTube link" }
  );

const musicUrl = z
  .string()
  .max(2048)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v) || /^\/[^\s]*$/i.test(v), { message: "Invalid URL" })
  .refine(
    (v) => {
      if (v === "") return true;
      const lower = v.toLowerCase();
      return (
        lower.includes("open.spotify.com") ||
        lower.includes("embed.spotify.com") ||
        lower.includes("youtube.com") ||
        lower.includes("youtu.be") ||
        lower.includes("soundcloud.com") ||
        /\.(mp3|ogg|wav|m4a)(\?.*)?$/.test(lower)
      );
    },
    { message: "Unsupported music provider" }
  );

const hexColor = z
  .string()
  .max(7)
  .refine((v) => v === "" || /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim()), { message: "Use a hex code like #a9f5d0" });

export const profileUpdateSchema = z.object({
  bio: z.string().max(500).optional(),
  displayName: z.string().max(100).optional(),
  backgroundUrl: backgroundUrl.optional(),
  glowColor: hexColor.optional(),
  location: z.string().max(120).optional(),
  timezone: z.string().max(80).optional()
});

export const adminProfileSchema = z.object({
  discordId: z.string().min(5).max(32),
  identity: z.string().max(60).optional(),
  bio: z.string().max(500).optional(),
  approved: z.boolean().optional(),
  visible: z.boolean().optional(),
  affiliationId: z.string().nullable().optional(),
  displayName: z.string().max(100).optional(),
  musicUrl: musicUrl.optional(),
  trackTitle: z.string().max(160).optional(),
  trackArtist: z.string().max(160).optional(),
  trackCover: imageUrl.optional()
});

export const affiliationSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().max(2048).optional(),
  externalUrl: z.string().max(2048).optional(),
  category: z.string().max(80).optional(),
  order: z.number().int().optional(),
  visible: z.boolean().optional()
});

export const roleConfigSchema = z.object({
  roleId: z.string().min(3).max(32),
  name: z.string().min(1).max(120),
  priority: z.number().int().min(0).max(10000).optional(),
  visible: z.boolean().optional(),
  style: z.string().max(40).optional()
});

export const syncPayloadSchema = z.object({
  discordId: z.string().min(3).max(32),
  username: z.string().max(100),
  globalName: z.string().max(100).nullable().optional(),
  avatar: z.string().max(2048).nullable().optional(),
  nickname: z.string().max(100).nullable().optional(),
  roleIds: z.array(z.string().max(32)).max(100).optional(),
  roles: z
    .array(
      z.object({
        id: z.string().min(3).max(32),
        name: z.string().max(120),
        icon: z.string().max(128).nullable().optional(),
        unicodeEmoji: z.string().max(32).nullable().optional()
      })
    )
    .max(100)
    .optional(),
  isMember: z.boolean().optional(),
  joinedAt: z.string().nullable().optional()
});

export function roleIconUrl(roleId: string, icon: string | null | undefined): string | null {
  if (!icon) return null;
  return "https://cdn.discordapp.com/role-icons/" + roleId + "/" + icon + ".webp?size=64";
}

export function toSafeMusicKind(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("spotify")) return "spotify";
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("soundcloud")) return "soundcloud";
  if (/\.(mp3|ogg|wav|m4a)(\?.*)?$/.test(lower)) return "audio";
  return "link";
}
