# BerserkerCut - Copilot Instructions

## Baseline Context

- BerserkerCut is an Expo + React Native + TypeScript app (iOS-first) for cutting plans.
- Runtime supports cloud API mode and local demo fallback mode.
- Current architecture reference is PROJECT_CONTEXT.md.

## Priority Rules

1. Preserve auth and plan contract integrity between:
	 - src/services/auth.ts
	 - src/services/plan.ts
	 - backend/src/routes/auth.js
	 - backend/src/routes/plans.js
2. Keep demo/cloud parity: never implement features that only work in one mode unless explicitly requested.
3. Use strict TypeScript and existing service abstractions (avoid direct fetch/storage from screens).
4. Keep iOS-first UX quality while preserving Android/web compatibility where already present.

## Architecture Constraints

- Navigation and provider boot sequence must remain stable:
	- App.tsx -> src/navigation/Navigation.tsx -> providers.
- Business logic belongs in hooks/services, not in presentation components.
- Theme values must come from src/utils/theme.ts and related design tokens.
- Shared UI components must consume the runtime theme; avoid hardcoded visual tokens inside reusable components when light/dark mode can switch at runtime.
- Sensitive behavior changes require updates in PROJECT_CONTEXT.md flag registry.

## UX/UI Guardrails

- Avoid duplicate navigation affordances for the same destination in a single surface.
- Keep bottom tab bars to the minimum useful visible destinations; use internal routes for secondary flows.
- Respect touch target minimums: 44x44 pt iOS, 48x48 dp Android.
- Check safe-area and navigator padding interactions before shipping layout changes.
- Ensure buttons, inputs, cards, progress indicators, and disabled states remain coherent in both dark and light themes.
- Privacy-sensitive copy must be consent-first and match the real implementation.

## Code Quality

- Prefer minimal, reviewable patches with explicit impact notes.
- Add tests for behavioral changes when feasible, especially auth/plan flows.
- Avoid hardcoded environment-specific values.
- Do not introduce dependency-heavy solutions for small problems.

## Active Flags

- Check PROJECT_CONTEXT.md before any significant change.
- If a change resolves or mitigates a flag, update the flag status in PROJECT_CONTEXT.md.

## Recommended Skill Composition

- Local skill: .github/skills/berserkercut-mobile/SKILL.md
- External references (orisha-skills): frontend, javascript, ux-ui, api-design, security, swift.

