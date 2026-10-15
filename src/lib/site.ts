export const SITE_NAME = "Lonestar";
export const TAGLINE = "An underground digital collective.";
export const CREATOR = "Made by Ego";
export const LOOP_PHRASE = "Lonestar On Top";

export const SEED_AFFILIATIONS = [
  { id: "seed-aff-1", name: "LONESTAR WORLD", description: "Primary collective identity.", category: "COLLECTIVE", order: 0, visible: true, logoUrl: null, externalUrl: "https://www.lonestarwxrld.com/" },
  { id: "seed-aff-2", name: "UNDERGROUND", description: "Affiliated community space.", category: "COMMUNITY", order: 1, visible: true, logoUrl: null, externalUrl: null }
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
