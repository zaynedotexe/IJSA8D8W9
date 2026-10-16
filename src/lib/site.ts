export const ACCENTS: Record<string, string> = {
  lannister: "#ff2020",
  celestia: "#ffd83d",
  lonestar: "#ffffff"
};

export function accentFor(name: string): string {
  return ACCENTS[name.toLowerCase()] || "#ffffff";
}

export const SITE_NAME = "Lonestar";
export const TAGLINE = "An underground digital collective.";
export const CREATOR = "Made by Ego";
export const LOOP_PHRASE = "Lonestar On Top";

export const SEED_AFFILIATIONS = [
  { id: "seed-aff-1", name: "Lannister", description: "Allied collective standing with Lonestar.", category: "AFFILIATE", order: 0, visible: true, logoUrl: "/ally-lannister.png", externalUrl: null },
  { id: "seed-aff-2", name: "Celestia", description: "Allied community in orbit with Lonestar.", category: "AFFILIATE", order: 1, visible: true, logoUrl: "/ally-celestia.png", externalUrl: null },
  { id: "seed-aff-3", name: "Lonestar", description: "The home collective.", category: "AFFILIATE", order: 2, visible: true, logoUrl: "/ally-lonestar.png", externalUrl: null }
];

export type SeedProfile = {
  id: string;
  discordId: string;
  identity: string;
  bio: string;
  username: string;
  globalName: string;
  avatar: string | null;
  nickname: string | null;
  roleIds: string[];
};

export const SEED_PROFILES: SeedProfile[] = [];

