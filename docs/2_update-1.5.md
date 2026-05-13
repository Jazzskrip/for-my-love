# Update 1.5 Context

## Entry + Auth
- Default entry: `index.html`.
- Auth data: `auth.json` with `login`, `password`, `group` (A/B/ADMIN), `displayName`.
- User session stored in `localStorage` as `adventSession` (A/B) and `adminSession` (ADMIN).
- After login: group A -> `advent-calendar-a.html`, group B -> `advent-calendar-b.html`, ADMIN -> `ad-ru-te-1.html`.

## Admin Page
- `ad-ru-te-1.html`: admin dashboard UI and logic.
- `ad-ru-te-1.css`: admin styles (graphite + amber palette).
- Admin shows per-user progress, last login, last update, coupons count.
- Admin coupons modal is split into Active/Used. Button (check mark) marks coupon as used.
- Admin button "Обнулить дни" resets opened days + coupons for a user.

## Calendars
- `advent-calendar-a.html`: calendar A page; reads progress from DB, updates on day open; has user coupon modal (Active/Used) and a "Купоны" button under user panel.
- `advent-calendar-b.html`: calendar B page; same logic and UI as A, but uses theme B palette.
- `advent-calendar-a.css`: base calendar styles, overlays, coupon modal styles, user coupons modal styles.
- `advent-calendar-b.css`: imports A styles and overrides for theme B (light palette).

## Data Files
- `data/rewards-a.json` / `data/rewards-b.json`: calendar items + page text. Each item uses `slot`, `icon`, `title`, `desc`, `coupon`.
- `data/info.json`: shared help content for both calendars.
- `data/theme-a.json` / `data/theme-b.json`: CSS variables for themes.
- `data/theme-a.md` / `data/theme-b.md`: variable explanations.

## Supabase + API
- Table `progress` fields:
  - `login` (PK), `display_name`, `group`, `opened_days` (int[]), `coupons` (jsonb), `last_login_at`, `updated_at`.
- API endpoints (Vercel):
  - `api/progress-login.js`: upsert `last_login_at` on successful login.
  - `api/progress-update.js`: update `opened_days`, `coupons`, `updated_at` on day open or admin action.
  - `api/progress-read.js`: read progress for one login (calendar pages).
  - `api/progress-list.js`: list progress for admin dashboard.
- Required env in Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Progress Logic
- Calendars fetch progress from DB on load and render opened days from `opened_days`.
- On opening a day, calendars update DB via `progress-update`.
- Coupons are stored in `progress.coupons`; `used: true` marks used coupons.
- Admin marks coupons used; users see Active/Used in their modal.

## Dev Server
- `serve.ps1` serves `index.html` by default at `http://localhost:3000/`.

## Other
- `UPDATE-RELEASE.md`, `update1.3.md`: prior update notes.
- `ANALYSIS_CALENDAR.md`: analysis notes.
