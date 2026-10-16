import { Client, GatewayIntentBits, Partials } from "discord.js";

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const GUILD_ID = process.env.DISCORD_GUILD_ID || "";
const SITE_URL = (process.env.SITE_URL || "").replace(/\/$/, "");
const SHARED_SECRET = process.env.BOT_SHARED_SECRET || "";
const INTERVAL_MIN = Number(process.env.SYNC_INTERVAL_MINUTES || "15");

if (!BOT_TOKEN || !GUILD_ID || !SITE_URL || !SHARED_SECRET) {
  console.error("Missing required bot environment variables.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences],
  partials: [Partials.GuildMember, Partials.User]
});

function avatarOf(user) {
  if (!user.avatar) return null;
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + "." + ext + "?size=256";
}

function toPayload(member) {
  const roles = Array.from(member.roles.cache.values()).filter((r) => r.id !== GUILD_ID);
  return {
    discordId: member.user.id,
    username: member.user.username,
    globalName: member.user.globalName || null,
    avatar: avatarOf(member.user),
    nickname: member.nickname || null,
    roleIds: roles.map((r) => r.id),
    roles: roles.map((r) => ({ id: r.id, name: r.name, icon: r.icon || null, unicodeEmoji: r.unicodeEmoji || null })),
    status: member.presence ? member.presence.status : null,
    isMember: true,
    joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null
  };
}

async function push(payloads, attempt) {
  const current = attempt || 1;
  try {
    const res = await fetch(SITE_URL + "/api/sync/discord", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-bot-secret": SHARED_SECRET },
      body: JSON.stringify(payloads)
    });
    if (res.status === 429 && current < 5) {
      const wait = current * 2000;
      await new Promise((r) => setTimeout(r, wait));
      return push(payloads, current + 1);
    }
    if (!res.ok) {
      console.error("Sync failed with status " + res.status);
      return false;
    }
    return true;
  } catch (err) {
    if (current < 5) {
      await new Promise((r) => setTimeout(r, current * 2000));
      return push(payloads, current + 1);
    }
    console.error("Sync error: " + String(err && err.message ? err.message : err));
    return false;
  }
}

async function pushLeave(discordId, username) {
  return push([{ discordId, username: username || "unknown", isMember: false, roleIds: [] }]);
}

async function reconcile() {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const members = await guild.members.fetch({ limit: 1000 });
    const batch = [];
    for (const member of members.values()) {
      if (member.user.bot) continue;
      batch.push(toPayload(member));
      if (batch.length >= 25) {
        await push(batch.splice(0, 25));
      }
    }
    if (batch.length) await push(batch);
    console.log("Reconciled " + members.size + " members.");
  } catch (err) {
    console.error("Reconcile failed: " + String(err && err.message ? err.message : err));
  }
}

client.on("guildMemberAdd", async (member) => {
  if (member.guild.id !== GUILD_ID) return;
  await push([toPayload(member)]);
});

client.on("guildMemberRemove", async (member) => {
  if (member.guild.id !== GUILD_ID) return;
  await pushLeave(member.user.id, member.user.username);
});

client.on("guildMemberUpdate", async (_old, member) => {
  if (member.guild.id !== GUILD_ID) return;
  await push([toPayload(member)]);
});

client.on("userUpdate", async (_old, user) => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;
    await push([toPayload(member)]);
  } catch {}
});

client.once("ready", () => {
  console.log("Lonestar bot online as " + (client.user ? client.user.tag : "unknown"));
  void reconcile();
  const ms = Math.max(5, INTERVAL_MIN) * 60 * 1000;
  setInterval(() => {
    void reconcile();
  }, ms);
});

client.on("shardDisconnect", () => {
  console.error("Shard disconnected. discord.js will attempt to resume.");
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection: " + String(err));
});

await client.login(BOT_TOKEN);
