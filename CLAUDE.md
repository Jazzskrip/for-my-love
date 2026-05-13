# Project: Advent Calendar for My Love

## Workflow Rules
- ALWAYS discuss the approach FIRST before writing any code
- ALWAYS ask for explicit approval before making changes
- NEVER modify, create, or delete files without user confirmation
- If unsure about something — ask, don't assume

## Deployment
- Platform: Vercel
- Deploy: entire repository as static files
- No backend, no API, no database — pure frontend

## Architecture
- `index.html` — main entry page (advent calendar)
- `css/style.css` — all styles and animations
- `js/calendar.js` — calendar logic (dates, cell unlocking, progress via localStorage)
- `js/games.js` — mini-games (triggered by specific cells)
- `js/effects.js` — background effects (snow, confetti, etc.)

## Key Features
- 30-day advent calendar, one cell unlocks per day based on START_DATE
- YouTube video playback on cell open (iframe, autoplay)
- Mini-games required before some cells fully open
- Progress saved in localStorage
- Date check based on user's device clock
