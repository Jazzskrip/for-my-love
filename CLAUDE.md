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
- `css/games.css` — mini-game styles
- `js/calendar.js` — calendar logic (dates, cell unlocking, progress via localStorage)
- `js/games.js` — mini-games (triggered by specific cells)
- `js/effects.js` — background effects (snow, confetti, etc.)

## Data Structure
- `data/rewards.json` — per-day config (video, game, tryAgain, coupon, etc.)
- `data/theme.json` — CSS custom properties (palette)
- `data/phrases.json` — pool of "try again" phrases
- `data/info.json` — help content

Data structure must be designed so each day can independently enable/disable features:
video, mini-game, try-again mechanic, popup type, coupon, animation style.

## Key Features
- 30-day advent calendar, one cell unlocks per day based on START_DATE
- YouTube video playback on cell open (iframe, autoplay)
- Mini-games required before some cells fully open
- Try-again mechanic (configurable attempts per day, random phrases)
- Popups on cell open (text, image, video — configurable per day)
- Customizable open animations per day (flip, fade, zoom, etc.)
- Switchable background effects (snow, hearts, stars, etc.)
- Progress saved in localStorage
- Debug menu for testing (jump to day 1/5/15/30, unlock all, reset)
- Date check based on user's device clock

## Tasks
- Task files live in `tasks/` folder
- Feature specs live in `docs/features/`
