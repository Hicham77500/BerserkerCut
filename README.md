# BerserkerCut

---

## 🔧 DESIGN EXPERT IMPLEMENTATION GUIDE - v2.1.0 (2026-06-21)

### Critical Rules (Don't Break!)
1. **Secondary buttons (dark mode):** MUST use `#ffbd5c` + fontWeight: 700 + borderBottom: 2px
2. **Light mode:** bg: `#fef9f7`, text: `#22120f`, primary: `#a83c4e`
3. **HomeScreen layout:** 3-tier structure (40% hero | 20% context | 40% grid)
4. **Tier spacing:** Exactly 24px between sections
5. **Logo:** Molten Rift (Icon 1) for all app assets

### Issue #1: Light Mode - IMPLEMENTATION NEEDED
```typescript
// src/theme/colors.ts (CREATE NEW FILE)
export const COLORS_DARK = {
  surface: '#1e0f0f',
  onSurface: '#f9dcda',
  primary: '#ffb3b1',
  secondary: '#ffbd5c',
  // ... see DESIGN.md for full palette
};

export const COLORS_LIGHT = {
  surface: '#fef9f7',
  onSurface: '#22120f',
  primary: '#a83c4e',
  secondary: '#22120f',
  // ... see DESIGN.md for full palette
};

export const useThemeColors = (isDark: boolean) => 
  isDark ? COLORS_DARK : COLORS_LIGHT;
```

```typescript
// src/theme/useColorScheme.ts (CREATE NEW FILE)
import { useColorScheme as RNColorScheme } from 'react-native';
import { useState } from 'react';

export const useColorScheme = () => {
  const systemScheme = RNColorScheme();
  const [manual, setManual] = useState<string | null>(null);
  const isDark = manual ? manual === 'dark' : systemScheme === 'dark';
  return { isDark, setDarkMode: (v: boolean) => setManual(v ? 'dark' : 'light') };
};
```

### Issue #2: Secondary Buttons - IMPLEMENTATION NEEDED
```tsx
// src/screens/HomeScreen.tsx
const { isDark } = useColorScheme();
const colors = useThemeColors(isDark);

// ❌ BEFORE - DO NOT USE
<Text style={{ color: '#ffb3b1' }}>Voir l'agenda</Text>

// ✅ AFTER - USE THIS PATTERN
<TouchableOpacity 
  style={[styles.secondaryButton, { borderColor: isDark ? '#ffbd5c' : '#a83c4e' }]}
  onPress={() => goToAgenda()}
>
  <Text style={{
    color: isDark ? '#ffbd5c' : '#a83c4e',
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: isDark ? '#ffbd5c' : '#a83c4e',
  }}>
    Voir l'agenda
  </Text>
</TouchableOpacity>
```

### Issue #3: HomeScreen Layout - IMPLEMENTATION NEEDED
```tsx
// src/screens/HomeScreen.tsx - FULL REFACTOR
<ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
  {/* TIER 1: Hero Section (40%) */}
  <View
    testID="home-tier-1"
    style={{
      height: SCREEN_HEIGHT * 0.4,
      marginHorizontal: 16,
      padding: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outline,
    }}
  >
    <MacroRing dailyGoal={1800} current={1500} />
    <Button 
      label="Enregistrer ma séance"
      variant="primary"
      style={{ marginTop: 16 }}
    />
  </View>

  {/* TIER 2: Context Card (20%) */}
  <View
    testID="home-tier-2"
    style={{
      marginTop: 24,
      marginHorizontal: 16,
      height: SCREEN_HEIGHT * 0.2,
      padding: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    }}
  >
    <Text style={{ ...fonts.headlineLg, color: colors.onSurface }}>
      Jour de repos
    </Text>
    <Text style={{ ...fonts.bodyLg, color: colors.onSurfaceVariant, marginTop: 8 }}>
      Profitez-en pour préparer vos repas !
    </Text>
    <Button 
      label="Adapter mon plan"
      variant="secondary"
      style={{ marginTop: 12 }}
    />
  </View>

  {/* TIER 3: Summary Grid (40%) */}
  <View
    testID="home-tier-3"
    style={{
      marginTop: 24,
      marginHorizontal: 16,
      height: SCREEN_HEIGHT * 0.4,
      flexDirection: 'row',
      justifyContent: 'space-between',
    }}
  >
    <SummaryColumn testID="summary-column-nutrition" label="NUTRITION" value="1800 kcal" />
    <SummaryColumn testID="summary-column-training" label="TRAINING" value="3/5 sets" />
    <SummaryColumn testID="summary-column-supplements" label="SUPPLEMENTS" value="3/3" />
  </View>
</ScrollView>
```

### Issue #4: Logo - SETUP REQUIRED
- [ ] Add logo files: `assets/icons/molten-rift-1024.png`, `512.png`, `192.png`
- [ ] Update `app.json`:
  ```json
  {
    "expo": {
      "icon": "assets/icons/molten-rift-1024.png"
    }
  }
  ```

### REGRESSION TEST - DO NOT SKIP
```bash
# Manual tests required:
✓ npm test -- design-regression.test.ts (once implemented)
✓ Light mode toggle in Settings
✓ "Voir l'agenda" button is BRIGHT ORANGE (#ffbd5c) not red
✓ "Adapter mon plan" button is BRIGHT ORANGE not red
✓ HomeScreen shows 3 distinct visible tiers
✓ Spacing between tiers = 24px
✓ Summary grid has 3 columns (not stacked)
✓ All text contrast passes WCAG AA (4.5:1)
✓ Molten Rift logo in tab bar at 32px
```

### REFERENCE DESIGN SYSTEM
See `assets/stitch_berserkercut_ai_nutrition_training_ecosystem/DESIGN.md` for:
- Complete color palettes (colors-light + colors-dark)
- Button component specs
- HomeScreen 3-tier architecture
- Typography rules
- Accessibility guidelines

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
- 🌗 Runtime dark/light theme support with a unified design system and persisted user preference.
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

- The app supports dark and light mode via `useThemeMode`, with persisted user preference.
- `src/utils/theme.ts` centralises the palette, typography, spacing, and shadows tuned for iOS.
- Surfaces rely on semantic tokens (`colors.surface`, `colors.secondaryBackground`, `colors.overlay`) to stay coherent in both modes.
- Component styling should consume `Spacing`, `Typography`, and runtime color tokens from the design system to remain consistent.

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
- `../AllSkills/mobile-app-design/` – mobile UX heuristics used for keyboard and modal ergonomics.
- `../AllSkills/code-review-skill/` – review checklist used before merge.
- `../AllSkills/android-reverse-engineering-skill/` – reverse-engineering reference when needed for interoperability analysis.

### Keyboard Handling Standard (Long Modals)

- Use `KeyboardAvoidingView` to preserve visibility while editing.
- Keep `keyboardShouldPersistTaps="handled"` on form scroll containers.
- On iOS, expose an explicit `Fermer le clavier` action with `InputAccessoryView`.

---

> Need to plug additional intelligence (agents, analytics)? Extend the backend with a dedicated microservice; keep the mobile app focused on deterministic calculations and premium iOS UX.
