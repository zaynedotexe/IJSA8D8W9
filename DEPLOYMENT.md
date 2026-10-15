# Deployment — GitHub + Vercel

## 1. GitHub

1. `git init`, `git add .`, `git commit -m "Lonestar initial"`.
2. Create an empty private GitHub repo, add remote, `git push -u origin main`.
3. Never commit `.env`, `.env.local`, bot tokens, client secrets, or database URLs. Only `.env.example` with placeholders is committed.

## 2. Database (managed Postgres)

Use Neon, Supabase, or Vercel Postgres. Create a database and copy the pooled connection string.

Set `DATABASE_URL` to `postgresql://...?sslmode=require`.

Run migrations from your machine or CI:

- `npx prisma migrate deploy`
- `npm run db:seed`

Schedule backups in your Postgres provider dashboard. Test restore at least once.

## 3. Vercel project

1. Import the GitHub repo in Vercel.
2. Framework preset: Next.js. Build command: `prisma generate && prisma migrate deploy && next build`.
3. Add environment variables (all server-only except NEXT_PUBLIC_ ones):
   - DISCORD_CLIENT_ID
   - DISCORD_CLIENT_SECRET
   - DISCORD_BOT_TOKEN (only needed for optional server-side member lookup; bot itself runs elsewhere)
   - DISCORD_GUILD_ID
   - DISCORD_REDIRECT_URI = https://your-domain.vercel.app/api/auth/callback
   - DATABASE_URL
   - SESSION_SECRET (32+ random chars)
   - ADMIN_DISCORD_IDS (comma-separated Discord user IDs)
   - BOT_SHARED_SECRET (long random string shared with bot host)
   - NEXT_PUBLIC_SITE_URL = https://your-domain.vercel.app
4. Deploy. Verify `/api/affiliations` and `/api/roles` return JSON.

## 4. Post-deploy checks

- Production build passes with no env missing.
- OAuth redirect URI in Discord portal exactly matches DISCORD_REDIRECT_URI.
- Cookies are Secure + HTTP-only in production (check DevTools Application tab).
- `/login` → Discord → `/me` works for a member with an admin-created profile.
- Non-member login shows not_member message.
- User without profile sees no_profile message.
- Editing another profile ID returns 403.
- Homepage and profile counters increment once per session window, rate limit returns 429 on abuse.
- Discord or DB outage shows degraded empty states instead of stack traces.

## Troubleshooting

- `Database unavailable` on API: check DATABASE_URL, allowlist Vercel IPs or use pooled URL, run migrate deploy.
- `Discord login is not configured`: DISCORD_CLIENT_ID missing in Vercel env.
- `invalid_state`: cookies blocked or redirect URI mismatch across domains. Use a single canonical domain.
- `Sync not configured`: BOT_SHARED_SECRET missing on web side.
- Images not loading: remotePatterns already allow https/http. Check CSP frame-src/img-src if you tighten policy.
