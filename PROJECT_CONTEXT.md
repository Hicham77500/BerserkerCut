# BerserkerCut - Project Context

Version: 2026-06-21
Maintainer: Copilot workspace bootstrap

## 1) Project Snapshot

- Product: iOS-first nutrition and supplement coaching app for cutting phase.
- Frontend stack: Expo 54, React Native 0.81, React 19, TypeScript strict.
- Backend stack: Node/Express + MongoDB (separate service in backend/).
- Runtime modes:
  - Cloud mode when EXPO_PUBLIC_API_BASE_URL is configured.
  - Demo mode fallback (local services + storage) when API is absent/unreachable.

## 2) Fast Navigation Map

### Entry points

- App root: App.tsx
- Expo register: index.ts
- Root navigation and providers: src/navigation/Navigation.tsx
- Main in-app navigator (tabs): src/navigation/MainNavigator.tsx
- System settings screen: src/screens/settings/SystemSettingsScreen.tsx

### Domain layers

- UI components: src/components/
- Screens: src/screens/
- Business hooks: src/hooks/
- Service layer: src/services/
- Shared models: src/types/
- Configuration and utilities: src/utils/

### Backend API

- API bootstrap: backend/src/server.js
- Auth routes: backend/src/routes/auth.js
- Plans routes: backend/src/routes/plans.js
- User routes: backend/src/routes/users.js

## 3) Execution Model

- Auth state and privacy consent are orchestrated in src/hooks/useAuth.tsx.
- Daily plan lifecycle is orchestrated in src/hooks/usePlan.tsx.
- API client handles token attachment and query composition in src/services/apiClient.ts.
- App mode switching (demo/cloud) is handled in src/services/appModeService.ts and src/utils/config.ts.

## 4) Operational Commands

- Install app dependencies: npm install
- Start Expo dev server: npm start
- Run iOS: npm run ios
- Run tests: npm test
- Backend dev server:
  1. cd backend
  2. npm install
  3. npm run dev

## 5) Flag Registry (Drapeaux)

Use these flags as anchors for next work sessions.

### [FLAG-ARCH-01] Auth token contract mismatch risk

- Location: backend/src/routes/auth.js
- Observation: createTokens exists, but register/login call createToken.
- Risk: login/register route crash or wrong token payload shape.
- Priority: HIGH

### [FLAG-ARCH-02] API auth response schema drift

- Location: src/services/auth.ts + backend/src/routes/auth.js
- Observation: mobile expects token + refreshToken + user; backend register/login currently return token + user.
- Risk: session persistence inconsistency and refresh flow break.
- Priority: HIGH

### [FLAG-CONFIG-01] Hardcoded local IP in API client

- Location: src/services/apiClient.ts
- Observation: default URL includes a fixed LAN IP for physical devices.
- Risk: fragile onboarding on other machines/networks.
- Priority: MEDIUM

### [FLAG-DOC-01] Documentation drift (Firebase vs JWT backend)

- Location: .github/copilot-instructions.md and docs/*
- Observation: some docs mention Firebase-first while runtime uses JWT REST + demo fallback.
- Mitigation (2026-06-21): privacy UI wording aligned to implemented local/iCloud behavior (no unimplemented retention/anonymization claim in in-app RGPD section).
- Mitigation (2026-06-21): consent audit trail added in ProfilePrivacyScreen and persisted in secure storage (last 10 activation/withdrawal events).
- Risk: misleading implementation choices during future changes.
- Priority: MEDIUM

### [FLAG-SEC-01] Verbose backend request logging

- Location: backend/src/server.js
- Observation: middleware logs full headers for each request.
- Risk: sensitive token exposure in logs.
- Priority: HIGH

### [FLAG-OPS-01] Vendored dependencies in backend subtree

- Location: backend/node_modules/
- Observation: dependencies are present in repository tree.
- Risk: noisy diffs, larger repository, slower CI operations.
- Priority: LOW

### [FLAG-UX-01] Double navigation model (drawer + tabs) in modern mobile flow

- Location: src/navigation/Navigation.tsx + src/navigation/MainNavigator.tsx
- Observation: previous flow exposed duplicate primary navigation (side drawer + bottom tabs), creating UI overlap and cognitive load.
- Mitigation (2026-06-21): modern main flow now uses a single bottom-tab navigation model; global toolbar/drawer layer removed from active root flow.
- Mitigation (2026-06-21): legacy custom drawer implementation deleted from the codebase to avoid dormant UX paths.
- Mitigation (2026-06-21): Home header duplicate "Profil" shortcut removed in favor of a dedicated settings entrypoint.
- Mitigation (2026-06-21): ProfileStack hidden from bottom tab bar UI while kept as internal navigation route.
- Mitigation (2026-06-21): Home safe-area bottom inset removed to eliminate persistent gap above tab bar.
- Mitigation (2026-06-21): settings is now a first-class visible bottom-tab destination, replacing the previous hidden/duplicated access pattern.
- Mitigation (2026-06-21): bottom tab bar height now follows runtime safe-area insets, and Home restores top safe-area coverage on notch devices.
- Mitigation (2026-06-21): Home header top spacing now adapts to safe-area inset values for large Dynamic Island/notch devices (including iPhone 16 Pro Max class).
- Priority: MEDIUM

### [FLAG-UX-02] User theme preference missing (light mode unavailable)

- Location: src/hooks/useThemeMode.tsx + src/screens/settings/SystemSettingsScreen.tsx
- Observation: app was hardcoded to dark mode with no user control.
- Mitigation (2026-06-21): persisted theme preference (dark/light) added and exposed through system settings screen.
- Mitigation (2026-06-21): notification controls moved from HomeDashboardScreen to SystemSettingsScreen for single settings entrypoint.
- Mitigation (2026-06-21): shared UI components (Button, IOSButton, Input, Card) switched to runtime theme palettes to restore visual coherence in light mode.
- Mitigation (2026-06-21): additional shared UI components (MacroCard, ProgressBar, IOSCheckbox) switched to runtime theme palettes for cross-screen visual consistency.
- Mitigation (2026-06-21): legacy onboarding/modal surfaces (HealthStep, OnboardingTrainingStep, MealEditModal, NutritionGoalsModal) switched to runtime theme palettes.
- Mitigation (2026-06-21): TrainingScreen palette refreshed to use layered surfaces and accent states instead of flat white blocks in light mode.
- Mitigation (2026-06-21): accessibility labels/roles/hints reinforced on ProfileOverview, ProfilePhotos, NutritionScreen, and SystemSettings controls.
- Validation (2026-06-21): external skills audit from `AllSkills/mobile-app-design` reports 0 touch-target violations on `src` via `validate-touch-targets.sh`.
- Residual risk: some legacy UI components still rely on static theme tokens and may need progressive adaptation for full light-mode parity.
- Priority: MEDIUM

### [FLAG-UX-03] Demo mode consent wording and activation ambiguity on login

- Location: src/screens/LoginScreen.tsx
- Observation: previous demo toggle/button copy could suggest data handling without explicit pre-activation agreement.
- Mitigation (2026-06-21): demo mode activation is now consent-first with explicit confirmation and clearer wording (fictitious local profile, no personal baseline data required).
- Priority: MEDIUM

### [FLAG-MAINT-01] Unused code and dormant imports across mobile codebase

- Location: see todo.md cleanup inventory.
- Observation: multiple files still contain unused imports, variables, parameters, and legacy navigation code.
- Mitigation (2026-06-21): cleanup batches completed across tests, components, screens, navigation legacy, and services.
- Validation (2026-06-21): `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` now returns clean.
- Priority: LOW

## 6) Suggested Skill Set For This Repository

Adapted from orisha-skills and tailored to BerserkerCut workflows:

- frontend
- javascript
- ux-ui
- api-design
- security
- swift (newly added in orisha-skills)

Recommended pairings:

- Mobile feature delivery: frontend + ux-ui + javascript
- API contract changes: api-design + security + javascript
- Native iOS bridge or migration work: swift + frontend + security

## 7) Next Actions Queue

1. Resolve [FLAG-ARCH-01] and [FLAG-ARCH-02] together (single auth contract pass).
2. Replace hardcoded LAN IP in src/services/apiClient.ts with deterministic host derivation.
3. Reduce backend header logging to non-sensitive fields only.
4. Align docs and Copilot instructions with current runtime architecture.
5. Add backend auth contract tests for register/login/refresh payload shape.
6. Complete on-device accessibility and safe-area validation in both light and dark modes, then fold findings into the design backlog.
