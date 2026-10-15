# LONESTAR — Underground Digital Collective

Made by Ego. Lonestar On Top.

Black-dominant, monochromatic, identity-focused collective site with Discord OAuth2, role hierarchy, member profiles, view counters, and a separately hosted Discord sync bot.

## Stack

- Next.js 14 App Router, React 18, TypeScript
- Tailwind CSS
- PostgreSQL with Prisma ORM (Vercel-compatible managed Postgres: Neon, Supabase, Vercel Postgres)
- Discord OAuth2 (identify + guilds) with iron-session sealed cookies
- Zod validation, database-backed rate limiting with in-memory fallback
- Discord.js v14 bot in `bot/` for long-running Gateway sync

## Structure

- `src/app/` — pages and API routes
- `src/components/` — Navbar, LoadingScreen, MemberCard, TypewriterBio, MusicPlayer, ProfileEditor
- `src/lib/` — db, session, discord, validation, rate limiting, authz
- `prisma/schema.prisma` — database schema
- `prisma/migrations/` — SQL migrations
- `bot/` — persistent Discord bot (host separately, never in Vercel serverless)
- `.env.example` — placeholder env vars only, no secrets

## Quick start

1. Copy env:

   `cp .env.example .env.local`

2. Fill placeholders: Discord client ID/secret, bot token, guild ID, redirect URI, DATABASE_URL, SESSION_SECRET (32+ chars), ADMIN_DISCORD_IDS, BOT_SHARED_SECRET.

3. Install and set up DB:

   `npm install`
   `npx prisma migrate deploy`
   `npm run db:seed`

4. Run:

   `npm run dev`

5. Production build:

   `npm run build`
   `npm start`

## Key behaviours

- Profiles are created by an admin first, linked to a Discord user ID. Login never auto-creates a profile. Ownership is matched only by Discord user ID.
- Editing requires: valid session, matching Discord ID, current guild membership (admins bypass membership check for editing their own assigned profile only if they own it).
- Homepage views count raw page-view events with 6-hour dedup per client hash. Never described as unique visitors.
- Biography typewriter loops the saved bio then the exact phrase Lonestar On Top. Saved bio is unchanged, rendered as plain text.
- Backgrounds: validated PNG/JPG/GIF HTTP(S) URLs stored as strings, previewed client-side, dark overlay, graceful fallback. No server-side fetching.
- Music: Spotify embeds via official iframe, YouTube nocookie embeds, direct MP3/OGG/WAV/M4A via audio element with user-gesture play only. No autoplay, no DRM bypass. Unsupported links render as an outbound link.
- Security: server-side authz on every protected route, state validation, HTTP-only SameSite cookies, CSP + hardening headers, no secrets in client code, production builds without source maps.

## Docs

- `DEPLOYMENT.md` — GitHub + Vercel deployment
- `DISCORD_SETUP.md` — Discord app, bot invite, OAuth2
- `BOT_HOSTING.md` — persistent bot hosting
- `SECURITY.md` — security model and limits

## Scripts

- `npm run dev` — local dev
- `npm run build` — prisma generate + next build
- `npm run db:push` — push schema (dev)
- `npm run db:migrate` — deploy migrations (prod)
- `npm run db:seed` — seed roles, affiliations, sync state
