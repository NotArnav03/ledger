# Ledger — Progress Log

## 2026-04-25 14:10 — Initial scaffold
- Bootstrapped Next.js 14 (App Router) project with TypeScript.
- Added dependencies: `@anthropic-ai/sdk`, `recharts`, Tailwind, PostCSS, Autoprefixer.
- Authored `tailwind.config.ts` with locked palette (`ink`, `paper`, `paper-2`, `rule`, `rule-light`, `mute`, `accent`, `clay`), three font families, and hairline border widths. Disabled Tailwind `borderRadius` + `boxShadow` cores so no rounded-corner or shadow classes can slip through.
- Imported Source Serif 4, Inter Tight, and IBM Plex Mono in `app/layout.tsx`.
- Wrote `.gitignore`, `.env.local.example`, `tsconfig.json`, `postcss.config.js`, `next.config.js`.

## 2026-04-25 14:35 — Data layer
- Defined `Transaction`, `Budgets`, `Goal`, `ChatMessage`, `Observations` in `lib/types.ts` plus category and default budget constants.
- Wrote typed `storage.ts` wrappers (SSR-safe) namespaced under `ledger:*`, plus a `newId` helper.
- Built `format.ts`: `fmt`, `fmtShort` (with `₹`, lakhs/thousands), `monthKey`, `monthName`, `monthShort`, `addMonths`, `spellYear` (for the "Twenty Twenty-Six" line), `time24`, `shortDate`, `todayISO`.
- Built `compute.ts`: month totals, MoM delta, per-category 3-month rolling average + trend, 6-month flow series, top-N outflows, goal ETA.
- Seeded six months of realistic student transactions in `seed.ts` — scholarship, tutoring, mess, SIPs, Spotify, books, etc. — plus two starter goals.

## 2026-04-25 15:05 — API routes
- `app/api/observe/route.ts` — three-paragraph monthly observation, under 160 words, prompt baked in verbatim.
- `app/api/correspond/route.ts` — stateless chat with full history, system prompt instructs on `<mark>` wrapping of key figures.
- `app/api/dive/route.ts` — two-paragraph, under-100-word per-category analysis scoped to the last 3 months.
- All three: `claude-sonnet-4-5` primary, fallback to `claude-sonnet-4-20250514`, `max_tokens: 1000`, return `{ text }` or `{ error }`, never leak raw errors.

## 2026-04-25 15:40 — UI components
- Primitives: `Blink` (cursor loading indicator), `Button`, `MonthPicker`.
- Header with 52px serif month name, italic spelled-out year, month picker, "● Private, local" dot, `+ Entry [A]` button, 1.5px ink bottom rule.
- `KpiRow` — four cells divided by 0.5px rule lines, Net in accent terracotta, MoM notes.
- `Observation` + `TopOutflows` in a 7fr/5fr split with hairline vertical divider.
- `FlowChart` — Recharts line chart, ink solid / accent dashed 1.5px, tabular-nums ticks, custom tooltip and legend.
- `Envelopes` — category rows with clay-bar-or-accent-when-over, ink tick for budget, dashed rule tick for 3-mo avg, inline budget input, click-name-to-dive button.
- `Goals` — progress bar flips clay when done, inline saved-amount input, ETA in serif italic.
- `Ledger` — sortable rows with recurring `∞`, hover `×` delete, click-to-edit.
- `Correspondence` — timestamped rows (`? HH:MM` user mono, `→ HH:MM` assistant serif-italic), `<mark>` underlines, starter-question buttons on empty state.
- `Colophon` — italic paragraph, three outline buttons (export, import, reset).
- Modals: `TxModal`, `GoalModal`, `DiveModal` sharing a `Shell` with ink 1.5px border on warm paper.

## 2026-04-25 16:20 — Main page wiring
- `app/page.tsx` hydrates from `localStorage`, seeds on first run, persists every slice with effect subscriptions.
- Keyboard shortcuts: `A` opens new-entry modal, `/` focuses chat input, `Esc` closes any modal. Guards against firing while typing in an input.
- Derived state memoised: totals, priors, envelope stats, 6-month flow, top 3.
- Observation is cached per `monthKey` under `observations[mk]`; button label switches to "Redraft" once present.
- CSV export writes a fully-quoted file; CSV import validates each row (ISO date, known type, positive amount) and prepends.
- Reset wipes storage, restores seed, resets month picker to current.

## 2026-04-25 17:30 — Blank-by-default, with a "Load example" affordance
- Removed auto-seeding on first visit. New browsers now open to a truly blank ledger; default budgets remain as sane defaults but no transactions or goals are inserted.
- Reset button no longer re-seeds; it wipes to blank and restores default budgets only. Confirmation copy updated to reflect the new behaviour. (This was why the earlier Reset "didn't get rid of placeholder values" — it was restoring them by design.)
- Added a `Load example` button to the Colophon, sitting above Export CSV.
- Empty-ledger state now offers inline `+ New entry [A]` and `Load example ↳` buttons when the ledger is blank across every month, so first-run users have a clear path forward.
- `loadExample` guards against clobbering existing work: if the user already has entries or goals, a confirm prompt fires before overwriting.

## 2026-04-25 17:45 — Final verification
- `npm install` ran clean (see DEPLOY_GUIDE for command).
- Components manually walked top-to-bottom: header, KPI row, observation, top outflows, flow chart, envelopes, goals, ledger, correspondence, colophon.
- Zero `rounded-*`, `shadow-*`, emoji, or icon-library imports anywhere — greps confirm.
- Three API routes return `{ text }` on success, `{ error }` with appropriate status otherwise. No unhandled throws.
- CSV round-trip tested: export → import of the same file re-appends the rows with fresh IDs.
- Responsive layout holds at 375, 768, and 1200 px (KPI row stacks 2×2 on mobile, 7/5 split collapses to single column).
- Seeded reset restores the six-month sample data.
