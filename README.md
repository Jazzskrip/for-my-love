# Advent Calendar

30-day advent calendar. Deployed on Vercel as static files.

## Current Structure

```
index.html                  <- main page (calendar)
advent-calendar-a.html      <- reference file (original calendar)
advent-calendar-a.css       <- reference file (original styles)
data/
  rewards-a.json            <- 30 days of rewards (mock data)
  theme-a.json              <- CSS custom properties (theme)
  theme-a.md                <- theme description
  info.json                 <- help/info content
package.json
start.command               <- local dev server (double-click to run)
CLAUDE.md                   <- AI assistant rules
```

## Planned Structure

```
index.html                  <- main page
css/
  style.css                 <- all styles and animations
js/
  calendar.js               <- calendar logic (dates, unlocking, localStorage progress)
  games.js                  <- mini-games (triggered by specific cells)
  effects.js                <- background effects (snow, confetti)
data/
  rewards.json              <- 30 days config (rewards, video URLs, game flags)
  theme.json                <- CSS custom properties
  info.json                 <- help content
package.json
start.command
CLAUDE.md
README.md
```

## Planned Features

- 30 cells, one unlocks per day based on START_DATE
- YouTube video autoplay on cell open
- Mini-games on specific cells (must complete to unlock reward)
- Customizable animations and background effects
- Progress saved in localStorage

## Dev

Double-click `start.command` or run:

```
npm run dev
```

## Deploy

Push to GitHub, connect to Vercel. No build step needed.
