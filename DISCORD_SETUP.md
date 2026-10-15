# Discord Application Setup

Follow least privilege. Only request what Lonestar needs.

## 1. Create application

1. Go to Discord Developer Portal → Applications → New Application → name it Lonestar.
2. Copy Application ID → use as DISCORD_CLIENT_ID.
3. Go to OAuth2 → copy Client Secret → DISCORD_CLIENT_SECRET. Reset it if it ever leaks.
4. Add redirect URL: `https://your-domain.vercel.app/api/auth/callback`. Must match DISCORD_REDIRECT_URI exactly, including https and path.
5. Scopes used by the site: `identify` and `guilds`. No bot scopes needed for login. No password or token storage.

## 2. Create bot user

1. Go to Bot → Add Bot.
2. Copy token → DISCORD_BOT_TOKEN (server-side only, never in browser code).
3. Turn OFF all Privileged Gateway Intents except Server Members Intent only if you need full member listing and it is available to your app. The bot uses Guilds + GuildMembers intents.
4. OAuth2 → URL Generator: select `bot` scope, then minimal permissions: View Channels, Read Message History is NOT needed. Lonestar sync only needs: View Server Members intent via Gateway, plus Manage? No. Invite with no extra permissions if possible; Discord grants member-read via intent, not via permission bit. If invite requires a permission, use View Channels only.

## 3. Invite bot

1. Generate invite URL with `bot` scope and copy to browser.
2. Invite to your server (DISCORD_GUILD_ID). To get Guild ID: Server Settings → Widget or enable Developer Mode → right-click server → Copy ID.
3. Place bot role high enough to read members but grant no moderation powers.

## 4. Get IDs

- ADMIN_DISCORD_IDS: enable Developer Mode → right-click Ego → Copy User ID. Comma-separate multiple admins.
- Role IDs for hierarchy: Server Settings → Roles → right-click role → Copy ID. Add them in `/admin` via Roles API or directly in DB RoleConfig with priority (lower = higher rank).

## 5. Verify

- `/api/auth/login` redirects to `discord.com/api/oauth2/authorize` with identify + guilds.
- After approve, callback exchanges code server-side, fetches user + guilds, checks DISCORD_GUILD_ID membership, upserts DiscordIdentity, seals session cookie.
- `/api/auth/me` shows authenticated user and owned profileId.
