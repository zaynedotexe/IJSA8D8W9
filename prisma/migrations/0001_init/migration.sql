-- Lonestar initial migration
CREATE TABLE "DiscordIdentity" (
  "id" TEXT NOT NULL,
  "discordId" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "globalName" TEXT,
  "avatar" TEXT,
  "nickname" TEXT,
  "roleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isMember" BOOLEAN NOT NULL DEFAULT true,
  "joinedAt" TIMESTAMP(3),
  "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DiscordIdentity_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DiscordIdentity_discordId_key" ON "DiscordIdentity"("discordId");
CREATE INDEX "DiscordIdentity_isMember_idx" ON "DiscordIdentity"("isMember");
CREATE INDEX "DiscordIdentity_updatedAt_idx" ON "DiscordIdentity"("updatedAt");

CREATE TABLE "Affiliation" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "logoUrl" VARCHAR(2048),
  "externalUrl" VARCHAR(2048),
  "category" VARCHAR(80),
  "order" INTEGER NOT NULL DEFAULT 0,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Affiliation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Affiliation_visible_order_idx" ON "Affiliation"("visible", "order");

CREATE TABLE "Profile" (
  "id" TEXT NOT NULL,
  "discordId" TEXT NOT NULL,
  "identity" TEXT NOT NULL DEFAULT 'MEMBER',
  "bio" TEXT NOT NULL DEFAULT '',
  "backgroundUrl" VARCHAR(2048),
  "musicUrl" VARCHAR(2048),
  "location" VARCHAR(120),
  "timezone" VARCHAR(80),
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "views" INTEGER NOT NULL DEFAULT 0,
  "affiliationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Profile_affiliationId_fkey" FOREIGN KEY ("affiliationId") REFERENCES "Affiliation"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Profile_discordIdentity_fkey" FOREIGN KEY ("discordId") REFERENCES "DiscordIdentity"("discordId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Profile_discordId_key" ON "Profile"("discordId");
CREATE INDEX "Profile_visible_approved_idx" ON "Profile"("visible", "approved");
CREATE INDEX "Profile_affiliationId_idx" ON "Profile"("affiliationId");
CREATE INDEX "Profile_updatedAt_idx" ON "Profile"("updatedAt");

CREATE TABLE "RoleConfig" (
  "id" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 100,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "style" VARCHAR(40),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RoleConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RoleConfig_roleId_key" ON "RoleConfig"("roleId");
CREATE INDEX "RoleConfig_priority_idx" ON "RoleConfig"("priority");
CREATE INDEX "RoleConfig_visible_idx" ON "RoleConfig"("visible");

CREATE TABLE "ViewEvent" (
  "id" TEXT NOT NULL,
  "pageType" TEXT NOT NULL,
  "profileId" TEXT,
  "dedupHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ViewEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ViewEvent_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "ViewEvent_pageType_createdAt_idx" ON "ViewEvent"("pageType", "createdAt");
CREATE INDEX "ViewEvent_profileId_createdAt_idx" ON "ViewEvent"("profileId", "createdAt");
CREATE INDEX "ViewEvent_dedupHash_pageType_createdAt_idx" ON "ViewEvent"("dedupHash", "pageType", "createdAt");

CREATE TABLE "RateLimitEntry" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RateLimitEntry_key_key" ON "RateLimitEntry"("key");
CREATE INDEX "RateLimitEntry_expiresAt_idx" ON "RateLimitEntry"("expiresAt");

CREATE TABLE "SyncState" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "lastRunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'ok',
  "detail" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SyncState_kind_key" ON "SyncState"("kind");
