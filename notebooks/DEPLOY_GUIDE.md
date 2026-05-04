# Ledger — Deploy Guide

A step-by-step walkthrough to run Ledger locally and deploy it to Vercel. All paths assume you're inside the `ledger/` directory.

---

## Part 1 — Local development

### 1. Install dependencies

```bash
npm install
```

This pulls down Next.js 14, React 18, Tailwind, Recharts, and the Anthropic SDK.

### 2. Configure your API key

Copy the template file and paste your Anthropic key into it:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the value:

```
ANTHROPIC_API_KEY=sk-ant-...
```

`.env.local` is gitignored — it never ships anywhere. The key is read **server-side only**, inside the `/app/api/*` route handlers. It is never exposed to the browser bundle.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the April observation with six months of seed data already loaded. Press `A` to add an entry, `/` to focus the correspondence input, `Esc` to close any modal.

---

## Part 2 — Verify the production build

Before deploying, confirm a clean build:

```bash
npm run build
npm start
```

`npm run build` type-checks, compiles, and statically analyses every route. A green build means the app is deployable. `npm start` runs the production server locally against the same key.

---

## Part 3 — Deploy to Vercel

1. Push the repo to GitHub (see **Part 4**).
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. In the Vercel dashboard, open **Settings → Environment Variables** and add:

   | Name                 | Value                 | Environments                |
   | -------------------- | --------------------- | --------------------------- |
   | `ANTHROPIC_API_KEY`  | your key              | Production, Preview, Dev    |

4. Click **Deploy**. First build takes ~1 minute.

Once it's live, every subsequent `git push` to `main` triggers a fresh deploy.

---

## Part 4 — GitHub setup

From inside the project directory:

```bash
git init
git add .
git commit -m "Initial commit: Ledger scaffold"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Before the first commit, sanity-check that `.env.local` is gitignored:

```bash
git check-ignore -v .env.local
```

It should print a line confirming the file is ignored. If not, stop and fix `.gitignore` before committing.

---

## Part 5 — Day-to-day use

- **Adding an entry** — press `A` (or the `+ Entry` button top-right).
- **Editing** — click any row in section `10 — The ledger`.
- **Deleting** — hover a ledger row and click `×`, or delete from the edit modal.
- **Month navigation** — month picker in the header. Months appear there automatically once they contain entries.
- **Budgets** — type directly into the `of ₹X` field next to each envelope bar.
- **Analysing a category** — click the category name in `08 — Envelopes` to open the dive modal.
- **Exporting your data** — footer → `Export CSV`. Import is in the same place.
- **Resetting** — footer → `Reset all` (terracotta border). Requires a confirmation.

---

## Troubleshooting

- **"ANTHROPIC_API_KEY is not set on the server."** — you haven't created `.env.local`, or you added the key after starting `npm run dev`. Stop the server (`Ctrl-C`) and restart it.
- **"Analysis failed." on the Observation panel** — usually a transient network issue or the Anthropic API returned a 5xx. Press **Redraft** to retry. The browser console will have the server-logged stack trace if it was a bug on our side.
- **Fonts look wrong (system serif, sans, or monospace)** — confirm the Google Fonts `<link>` at the top of `app/layout.tsx` loaded. If you're behind a firewall that blocks `fonts.googleapis.com`, the fallback chain (`Georgia`, `system-ui`, `ui-monospace`) will kick in and the layout still holds, just less refined.
- **The flow chart is empty** — you're looking at a month with no data. Pick a different month from the header picker, or add transactions.
- **`npm run build` fails with a type error** — run `npm run lint` locally and fix any reported issues. Types are strict by design.
- **Seed data didn't appear** — open the browser DevTools → Application → Local Storage → your origin, delete any `ledger:*` keys, and refresh. The seed runs on first visit only (tracked by `ledger:seeded`).

---

## Where things live

```
app/
  layout.tsx        Font imports, root html/body.
  page.tsx          The single client-rendered dashboard.
  globals.css       Tailwind base + a few explicit rules (hairlines, mark underline, blink cursor).
  api/
    observe/        Monthly observation endpoint.
    correspond/     Chat endpoint.
    dive/           Per-category analysis endpoint.
components/         All UI components. One file per concern.
lib/
  types.ts          Shared type definitions + constants.
  storage.ts        localStorage wrappers, namespaced.
  format.ts         Formatting helpers (currency, dates, month names, year spelling).
  compute.ts        Derived statistics (totals, stats, trends, ETAs).
  seed.ts           Six months of student-finance seed data.
  ai.ts             Typed fetch wrappers for the three API routes.
logs/PROGRESS.md    The build log — first-class deliverable.
notebooks/          This file.
```
