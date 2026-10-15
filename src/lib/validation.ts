import { z } from "zod";

const imageUrl = z
  .string()
  .max(2048)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), { message: "Invalid URL" })
  .refine((v) => v === "" || /\.(png|jpe?g|gif)(\?.*)?$/i.test(v), { message: "Only PNG JPG JPEG GIF allowed" });

const musicUrl = z
  .string()
  .max(2048)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), { message: "Invalid URL" })
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

export const profileUpdateSchema = z.object({
  bio: z.string().max(500).optional(),
  backgroundUrl: imageUrl.optional(),
  musicUrl: musicUrl.optional(),
  location: z.string().max(120).optional(),
  timezone: z.string().max(80).optional()
});

export const adminProfileSchema = z.object({
  discordId: z.string().min(5).max(32),
  identity: z.string().max(60).optional(),
  bio: z.string().max(500).optional(),
  approved: z.boolean().optional(),
  visible: z.boolean().optional(),
  affiliationId: z.string().nullable().optional()
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
  isMember: z.boolean().optional(),
  joinedAt: z.string().nullable().optional()
});

export function toSafeMusicKind(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("spotify")) return "spotify";
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("soundcloud")) return "soundcloud";
  if (/\.(mp3|ogg|wav|m4a)(\?.*)?$/.test(lower)) return "audio";
  return "link";
}
