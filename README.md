# BerserkerCut 🔥

Full-dark native iOS experience for personalised cutting plans.

## Table of contents

1. [Overview](#overview)
2. [Key features](#key-features)
3. [Architecture](#architecture)
4. [Getting started](#getting-started)
5. [Environment variables](#environment-variables)
6. [Development workflow](#development-workflow)
7. [Design system & theming](#design-system--theming)
8. [Backend expectations](#backend-expectations)
9. [Roadmap](#roadmap)
10. [Resources](#resources)

---

## Overview

BerserkerCut is an Expo + React Native TypeScript app focused on an iOS-first experience that helps athletes navigate a cutting phase. The app produces daily nutrition and supplement plans, adapts guidance to rest or training days, and preserves deterministic calculations locally on-device. Phase 1 targets a fully native-feeling dark interface; Phase 2 will extend the same code base to the web.

- **Platform**: Expo SDK (React Native) — optimised for iOS, Android support secondary, web planned.
- **Language**: TypeScript end-to-end.
- **State & data**: React context providers (`useAuth`, `usePlan`) backed by a REST API or an offline demo data layer.
- **Security**: JWT sessions stored locally, HTTPS backend expected.

## Key features

- 🔒 Email/password authentication (REST API via Node/Express + MongoDB).
- 🧮 Local metabolic/macronutrient calculations using deterministic formulas.
- 🥗 Daily meal plans with macro tracking and supplement timing guidance.
- 💤 Contextual tips that adapt to rest/training days.
- ✈️ Demo/offline mode powered by AsyncStorage for instant preview without backend.
- 🌘 Dark theme everywhere — light mode was removed and UI toggles replaced with a consistent dark-native design language.
- 📸 Photo capture & gallery management to document meals or progress.

## Architecture

```text
src/
├── components/        # Reusable UI building blocks (Buttons, Cards, iOS widgets)
├── hooks/             # Theming, auth, plan providers & business logic
├── navigation/        # Stack/tab navigation configuration
├── screens/           # Feature screens (Dashboard, Nutrition, Profile…)
├── services/          # REST + demo services, session helpers, photo storage
├── types/             # Shared TypeScript models (User, DailyPlan, Supplement…)
└── utils/             # Theme system, configuration, diagnostics, helpers
```

More detailed flows live in `docs/ARCHITECTURE.md`.

## Getting started

1. **Clone & install**
   ```bash
   git clone <repository-url>
   cd BerserkerCut
   npm install
   ```

2. **Run the Expo client** (iOS-first)
   ```bash
   npm start        # Launch Expo Dev Tools (press i for iOS simulator)
   # Optional shortcuts
   npm run ios      # Directly open iOS simulator
   npm run android  # Android emulator (secondary support)
   ```

## Environment variables

Create a `.env` file at the project root (or configure `app.json` → `expo.extra`).

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000   # REST backend base URL
EXPO_PUBLIC_FORCE_DEMO_MODE=false                # true to force offline/demo mode
```

When `EXPO_PUBLIC_API_BASE_URL` is missing or unreachable, the demo services take over automatically.

## Development workflow

- **Type checking & linting**: The project relies on TypeScript; ESLint rules ship with Expo. Run `npx tsc --noEmit` or `npx eslint .` if needed.
- **Unit tests**: Jest is configured (see `jest.config.js`).
  ```bash
  npm test
  # or update specific snapshots
  npm test -- --runTestsByPath __tests__/HomeDashboardScreen.test.tsx --updateSnapshot
  ```
- **Backend dev server** (optional, mutualised repo):
  ```bash
  cd backend
  cp .env.example .env   # fill MONGODB_URI, JWT_SECRET, etc.
  npm install
  npm run dev
  ```

## Design system & theming

- The app is dark-only. `useThemeMode` now delivers a static dark palette (`DarkColors`), and UI toggles were removed.
- `src/utils/theme.ts` centralises the palette, typography, spacing, and shadows tuned for iOS.
- Surfaces favour copper/anthracite tones with accessible contrast; cards and overlays rely on `colors.surface`, `colors.secondaryBackground`, and `colors.overlay`.
- Component styling should consume `Spacing`, `Typography`, and `Colors` tokens from the design system to remain consistent.

## Backend expectations

A minimal Node/Express + MongoDB service is still required for cloud mode. The reference implementation lives in `backend/` (not auto-deployed). Key endpoints expected by the mobile app:

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- `GET /users/:id`, `PATCH /users/:id/profile`
- `GET /plans/today?userId=`, `PUT /plans/:planId`
- `POST /plans/:planId/supplements/:supplementId/taken`

The mobile app never talks to MongoDB directly. Secure the API with JWT middleware, ensure CORS allows the Expo dev origin (`http://localhost:19006` by default), and return only the fields required by the client.

## Roadmap

| Status | Next steps |
| ------ | ----------- |
| ✅ | Dark-only redesign, demo mode parity, plan generation logic |
| 🏗️ | Deploy & harden the REST backend (Node/Express + MongoDB Atlas) |
| 🔬 | Expand automated tests + CI, instrument analytics/monitoring |
| 🚀 | Prepare TestFlight build, later reuse codebase for the PWA phase |

## Resources

- `docs/ARCHITECTURE.md` – sequence diagrams, data models, domain logic.
- `src/services/apiClient.ts` – REST client with automatic auth headers.
- `src/services/sessionStorage.ts` – JWT/session helpers.
- `src/utils/designSystem.ts` – layout constants and design tokens.
- `src/utils/debug.ts` – developer diagnostics (`quickDiagnose()` for local checks).

---

> Need to plug additional intelligence (agents, analytics)? Extend the backend with a dedicated microservice; keep the mobile app focused on deterministic calculations and premium iOS UX.
