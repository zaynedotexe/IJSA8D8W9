# Security Model

Lonestar stays secure even if a visitor opens DevTools, inspects network traffic, or downloads every public frontend asset.

## Guarantees

- All secrets live in server env vars. No `NEXT_PUBLIC_` secret exists. Bot token never ships to the browser.
- Every protected API validates the sealed iron-session cookie server-side, checks Discord user ID ownership, and re-checks guild membership from the database record.
- Admin is an explicit allowlist (`ADMIN_DISCORD_IDS`). Client-submitted role IDs never grant admin.
- OAuth state is random per login, stored HTTP-only, compared on callback, single-use.
- Input validated with Zod. ORM parameterizes queries. Output rendered as plain text (React escapes by default). No HTML injection from bios.
- Rate limiting is persistent via Postgres `RateLimitEntry` with in-memory fallback. View endpoints dedup within 6 hours.
- Security headers + CSP in `next.config.js`. Production source maps disabled. Errors return safe messages without stack traces.
- Remote image/music URLs are allowlisted by format and provider, length-limited, previewed client-side only. No server-side fetching, so no SSRF.
- Spotify/YouTube use official embeds only. No audio extraction or DRM bypass.

## Non-goals (deterrence only)

Production minification, code splitting, and no published source maps raise the cost of casual copying but do not make theft impossible. Browser-side right-click or DevTools blocks are intentionally NOT used as security controls and are not claimed to be.

## Operations

- Audit dependencies with `npm audit` before releases.
- Rotate SESSION_SECRET, BOT_SHARED_SECRET, client secret, and bot token if exposed.
- Back up Postgres via provider. Keep `prisma/migrations` in git.
- Log without credentials or session tokens. Sync failures update SyncState for admin review.
