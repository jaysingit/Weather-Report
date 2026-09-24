# Weatherly

A weather app for checking current conditions anywhere in the world. Search any city to see live temperature, humidity, wind, and conditions, powered by the free, keyless [Open-Meteo](https://open-meteo.com/) geocoding, forecast, and air quality APIs. Built with React, TypeScript, and Vite, and hosted as a static site on GitHub Pages — no backend, no database.

**Live site:** https://jaysingit.github.io/Weatherly/

## Features

- Search any city worldwide and get current weather (temperature, feels-like, humidity, wind, conditions)
- UV index shown for every location; pollen level (Low/Moderate/High/Very High) shown for European locations, where Open-Meteo's pollen data is available — the row is hidden elsewhere rather than showing a placeholder
- Country flag and the city's own local date/time shown on the result card, always in 12-hour AM/PM format regardless of the viewer's device or locale (Open-Meteo refreshes current conditions on a 15-minute interval, so the time reflects the latest available reading, not the live second)
- Night look for the result card (dark starry background, moon icon) when it's currently night at the searched location, independent of your own local time
- Empty searches are blocked (required field + disabled Search button) instead of silently doing nothing
- Loading and error states for invalid/unmatched searches
- Reset button to clear the search and result back to default
- Open Graph / Twitter meta tags with a real screenshot, so sharing the link (LinkedIn, Slack, etc.) shows an actual preview instead of a blank card
- No API key or backend required — calls Open-Meteo directly from the browser

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and build
- [Open-Meteo](https://open-meteo.com/) geocoding, forecast, and air quality (pollen) APIs
- GitHub Pages + GitHub Actions for hosting/deployment

## React features used

- **Functional components + hooks** — `useState` for local UI state, `useEffect` for data fetching
- **Effect cleanup with `AbortController`** — `WeatherDisplay` cancels the in-flight fetch if the searched city changes again before the previous request resolves, avoiding stale results
- **Lifting state up** — `App` owns the `city` state and passes it down to `SearchBar` (via `onSearch`/`onReset`) and `WeatherDisplay` (via props), keeping the two components decoupled from each other
- **Controlled form inputs** — the search box's value is fully driven by React state, not the DOM
- **Conditional rendering** — loading, error, empty, and success states in `WeatherDisplay` are just different return values off the same component
- **Component composition** — `SearchBar` and `WeatherDisplay` are small, single-purpose components composed together in `App`
- **TypeScript-typed props and events** — every component has a typed props interface, and event handlers (e.g. `FormEvent<HTMLFormElement>`) are explicitly typed
- **React Compiler** — enabled via `babel-plugin-react-compiler` in `vite.config.ts` for automatic memoization, so components aren't hand-wrapped in `useMemo`/`useCallback`

## Project structure

```
src/
  api/
    weather.ts          # Open-Meteo geocoding, forecast + air quality API calls
  components/
    SearchBar.tsx        # City input, submit and reset controls
    WeatherDisplay.tsx   # Fetches and renders the weather card
  types/
    weather.ts           # Shared TypeScript types
  utils/
    formatTime.ts        # Formats the location's local date/time
    pollenLevel.ts        # Pollen concentration -> Low/Moderate/High/Very High
    weatherCodes.ts       # WMO weather code -> description/icon lookup (day/night variants)
  App.tsx                 # Page layout and top-level state
  App.css                 # App-specific styles
  index.css               # Global styles, theme variables, background
  main.tsx                 # React entry point
public/
  favicon.svg              # Weather-themed favicon
.github/workflows/
  deploy.yml                # Builds and deploys to GitHub Pages on push to main
```

## Getting started

Requires [Node.js](https://nodejs.org/) 20+.

```bash
npm install
npm run dev
```

This starts the Vite dev server (prints the local URL to open in your browser).

## Available scripts

| Command           | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start the local dev server with hot reload       |
| `npm run build`   | Type-check and build for production into `dist/` |
| `npm run preview` | Preview the production build locally             |
| `npm run lint`    | Run ESLint                                       |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app and deploys `dist/` to GitHub Pages automatically (requires **Settings → Pages → Source: GitHub Actions** to be set once in the repo). The Vite `base` in `vite.config.ts` is set to `/Weatherly/` to match this repo's Pages URL.
