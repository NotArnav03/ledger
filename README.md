# Ledger

A quiet, documentary personal finance dashboard with AI observation and a built-in correspondence feature. Designed in the spirit of Müller-Brockmann grids and Dieter Rams restraint — no rounded corners, no shadows, no gradients. Currency is INR (₹).

- **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Recharts · `@anthropic-ai/sdk`
- **Storage:** `localStorage`, namespaced under `ledger:*`. No database, no account.
- **Privacy:** your `ANTHROPIC_API_KEY` is read server-side only, inside the API route handlers. It never ships in the browser bundle.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # paste your Anthropic key
npm run dev
```

Open http://localhost:3000. Keyboard: `A` to add an entry, `/` to focus chat, `Esc` to close modals.

## Documentation

- **[notebooks/DEPLOY_GUIDE.md](notebooks/DEPLOY_GUIDE.md)** — full setup, build, and Vercel deploy walk-through, plus troubleshooting.
- **[logs/PROGRESS.md](logs/PROGRESS.md)** — timestamped build log of every significant step taken during implementation.

## Features

- Six-month flow chart (inflow solid, outflow dashed accent)
- Per-envelope budgets with 3-month rolling average tick
- Savings goals with rate-based ETA
- AI monthly observation (cached per month)
- AI correspondence with full history sent on each request
- Per-category dive analysis
- CSV import/export, full reset with confirmation
