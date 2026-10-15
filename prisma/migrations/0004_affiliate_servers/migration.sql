ALTER TABLE "DiscordIdentity" ADD COLUMN "guildIds" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL;
ALTER TABLE "Affiliation" ADD COLUMN "discordGuildId" VARCHAR(32);
