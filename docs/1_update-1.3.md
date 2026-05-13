# Update 1.3 Context

## Entry + Auth
- Default entry: `index.html`.
- Auth data: `auth.json` with `login`, `password`, `group` (A/B), `displayName`.
- Session stored in `localStorage` as `adventSession`.
- After login: group A → `advent-calendar-a.html`, group B → `advent-calendar-b.html`.
- Each calendar blocks access if the stored session group mismatches.

## Structure
- `advent-calendar-a.html` — calendar A page.
- `advent-calendar-b.html` — calendar B page.
- `advent-calendar-a.css` — base styles with CSS variables.
- `advent-calendar-b.css` — imports `advent-calendar-a.css`.
- `data/` — editable content and theme files:
  - `data/rewards-a.json` — items + page text for calendar A.
  - `data/rewards-b.json` — items + page text for calendar B.
  - `data/info.json` — shared help content.
  - `data/theme-a.json` — theme variables for A.
  - `data/theme-b.json` — theme variables for B.
  - `data/theme-a.md` / `data/theme-b.md` — variable explanations.

## Rewards + Page Text
- Rewards are loaded from `data/rewards-*.json`.
- Each reward uses `slot`, `icon`, `title`, `desc`, `coupon`.
- Page text (`title`, `subtitle`, `instructions`) is also loaded from rewards JSON.

## Help / Wiki
- Floating “i” button on both calendars.
- Modal content loaded from `data/info.json`.
- Close button (×) added with golden hover glow.

## Visuals
- Calendar A: dark/gold theme, snow canvas enabled.
- Calendar B: light “snow” theme, snow canvas enabled.
- User panel (name + progress) on both calendars with constant gold border/shadow.
- Coupon modal in B has light gradient, gold border/shadow, darker overlay.

## Dev Server
- `serve.ps1` serves `index.html` by default.
