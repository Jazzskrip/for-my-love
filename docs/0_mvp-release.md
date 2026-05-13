# Update Release Notes

## Overview
- Project split into two calendars: `advent-calendar-a.html` and `advent-calendar-b.html`.
- Default entry page is `index.html` with client-side auth.
- Shared auth data lives in `auth.json` (logins/passwords + group + display name).
- Content data (rewards + info/wiki) moved into `data/` JSON files for easy editing.
- Separate stylesheets for calendar A and B.

## Auth Flow
- `index.html` loads users from `auth.json`.
- On successful login, a session is stored in `localStorage` as `adventSession`.
- Based on group:
  - `A` → `advent-calendar-a.html`
  - `B` → `advent-calendar-b.html`
- Each calendar checks session and redirects back to `index.html` if user group mismatches.
- `displayName` from `auth.json` is used in the top-right user panel.

## Stylesheets
- `advent-calendar-a.css` — base style used by calendar A and the login page.
- `advent-calendar-b.css` — imports A styles and overrides palette for the "snow" theme.

## Data Files (all in `data/`)
- `data/rewards-a.json` — rewards list for calendar A (slot, icon, title, desc, coupon).
- `data/rewards-b.json` — rewards list for calendar B (slot, icon, title, desc, coupon).
- `data/info.json` — shared wiki/help content for the floating “i” button.

## UI Updates
- Floating help button + modal on both calendars (content from `data/info.json`).
- Calendar B uses light winter palette and includes falling snow (canvas).
- Coupon popup colors adjusted to match calendar B palette.
- User panel (name + progress) appears on both calendars.

## Storage Keys
- `adventSession` — active login and group, with display name.
- `adventLastOpened` — last opened day (progress).
- `adventRewardsOrderA` and `adventRewardsOrderB` are no longer used (rewards fixed by slot).

## Notes
- All JSON files except `auth.json` moved to `data/`.
- Local dev server entry is `index.html` by default.
