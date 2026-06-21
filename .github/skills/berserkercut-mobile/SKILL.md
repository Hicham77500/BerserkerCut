---
name: berserkercut-mobile
description: >
  Implement and evolve BerserkerCut mobile features safely across Expo/React Native,
  with iOS-first UX, deterministic nutrition logic, and demo/cloud runtime parity.
metadata:
  author: berserkercut
---

# BerserkerCut Mobile

## Mission
Ship iOS-first mobile features in BerserkerCut without regressing plan generation, auth/session behavior, or offline demo reliability.

## Applies To
Teams: local project contributors working in BerserkerCut.

## When To Use
- Adding or modifying screens in src/screens.
- Updating hooks in src/hooks and services in src/services.
- Changing navigation and provider orchestration in src/navigation/Navigation.tsx.
- Working on demo/cloud switching behavior.

## Core Capabilities
- Maintain strict TypeScript and stable app boot sequence.
- Keep useAuth/usePlan contracts coherent with backend payloads.
- Preserve iOS-first dark UI consistency (tokens from src/utils/theme.ts).
- Ensure demo fallback remains functional when backend is unavailable.
- Keep side effects (storage, notifications, agenda) isolated and testable.

## Mobile Design Quality Gates
- Keep a single primary navigation affordance per surface. Avoid duplicate entrypoints like header shortcut + bottom tab for the same destination.
- Shared UI components must be theme-aware. Avoid hardcoded `Colors.*` usage inside reusable components when the runtime theme can change.
- Bottom tab navigation should stay within 3 to 5 visible items. Hidden/internal routes are acceptable, but user-facing duplication is not.
- Respect minimum touch targets: 44x44 pt on iOS, 48x48 dp on Android.
- Maintain contrast parity in both dark and light themes for buttons, labels, inputs, progress tracks, and disabled states.
- Avoid unexplained persistent spacing caused by stacked safe-area handling and navigator paddings.
- Prefer explicit destructive actions over hidden gestures (for example visible delete buttons over long-press-only removal).
- Copy must be consent-first for privacy-sensitive behavior. Do not imply data collection before explicit user agreement.

## Standard Workflow
1. Read PROJECT_CONTEXT.md and check active flags before coding.
2. Identify impact radius: screen, hook, service, and API contract.
3. Implement the smallest safe change preserving demo/cloud parity.
4. Run tests and type checks for impacted scope.
5. Update PROJECT_CONTEXT.md flag status if risk was reduced or resolved.

## Inputs Required
- Change scope and acceptance criteria.
- Impacted user flow (auth, plan, nutrition, profile, agenda, notifications).
- Runtime target (demo mode, cloud mode, or both).

## Output Contract
- Minimal, reviewable patch.
- Explicit note on auth/plan contract impact.
- Updated docs/context when behavior changes.

## Stop Conditions
- Stop when acceptance criteria are met and no new architecture flag is introduced.
- Stop if backend contract details are missing; request exact endpoint payload schema.

## Validation Steps
- npm test
- Verify login + daily plan loading path on simulator.
- Verify fallback behavior when API is unreachable.

## Quick Quality Checklist
- [ ] Navigation flow still valid (login/onboarding/main).
- [ ] useAuth and usePlan states remain consistent.
- [ ] No hardcoded environment assumptions introduced.
- [ ] Theme tokens used (no random style values for core surfaces).
- [ ] No duplicate navigation target visible in the same user flow.
- [ ] Buttons/inputs/cards remain coherent in both light and dark modes.
- [ ] Privacy and demo mode wording matches implemented behavior.

## Deliverables
- Source patch in src/ and optionally backend/.
- Updated PROJECT_CONTEXT.md flag notes when relevant.
- Short validation note with commands run.

## Quality Gates
- No TypeScript strict regressions.
- No auth/session payload mismatch.
- No crash in loading state for app bootstrap.

## Anti-Patterns To Avoid
- Bypassing services directly from screens for network/storage side effects.
- Introducing platform conditionals in many places instead of one abstraction point.
- Mixing demo and cloud payload shape assumptions in UI components.

## Success Metrics
- Reduced open flag count in PROJECT_CONTEXT.md.
- Stable login/onboarding to main flow.
- Stable daily plan generation/update/toggle supplement flow.
