# Bot Hosting (separate from Vercel)

Never run a permanently connected Gateway bot inside Vercel serverless functions. Host `bot/` on a long-running host.

## Options

- Railway, Render, Fly.io, Hetzner VPS, or any Node 18+ host with persistent processes.
- 256MB RAM is enough. One instance only to avoid duplicate sync events.

## Deploy steps (generic)

1. Push repo. On bot host, set root to `bot/` or copy that folder.
2. Set env vars:
   - DISCORD_BOT_TOKEN
   - DISCORD_GUILD_ID
   - SITE_URL = https://your-domain.vercel.app
   - BOT_SHARED_SECRET (must equal web env)
   - SYNC_INTERVAL_MINUTES = 15
3. Install + start:
   - `npm install --omit=dev`
   - `npm start`
4. Use a process manager (systemd, pm2, Docker restart policy) so disconnects auto-resume.

Docker example:

  FROM node:20-alpine
  WORKDIR /app
  COPY package.json ./
  RUN npm install --omit=dev
  COPY index.js ./
  CMD ["node", "index.js"]

## What the bot does

- Listens for guildMemberAdd, guildMemberRemove, guildMemberUpdate, userUpdate.
- Maps each event to `{ discordId, username, globalName, avatar, nickname, roleIds, isMember, joinedAt }`.
- POSTs to `SITE_URL/api/sync/discord` with header `x-bot-secret: BOT_SHARED_SECRET`, with retries and 429 backoff.
- Runs full reconciliation every 15 minutes to recover missed events.
- Never collects passwords, tokens, or message contents. Only approved member fields.

## Health

- Check web `GET /api/sync/discord` or admin panel sync status + lastRunAt.
- If lastRunAt is stale, check bot logs, token validity, intent flags, and SITE_URL reachability.
- Rotate BOT_SHARED_SECRET on both sides if it leaks.
