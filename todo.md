# TODO - Audit code non utilise (ordre fichier)

Source: analyse statique TypeScript (`npx tsc --noEmit --noUnusedLocals --noUnusedParameters`)
Date: 2026-06-21

## A verifier et nettoyer

- [x] __tests__/NutritionScreen.test.tsx
  - `waitFor` importe mais non utilise.

- [x] src/components/HealthStep.tsx
  - `bmiCategory` calcule mais non utilise.

- [x] src/components/MealEditModal.tsx
  - `IOSCheckbox` importe mais non utilise.

- [x] src/components/OnboardingTrainingStep.tsx
  - `Animated` importe mais non utilise.

- [x] src/components/PrivacyConsentModal.tsx
  - `TouchableOpacity` importe mais non utilise.

- [x] src/examples/OnboardingTrainingStepExample.tsx
  - variable `day` non utilisee.

- [x] src/navigation/DrawerNavigator.tsx
  - `useRef` importe mais non utilise.
  - `screenWidth` non utilise.
  - `styles` non utilise (dans un scope local indique par TS).

- [x] src/screens/nutrition/NutritionScreen.tsx
  - `useAuth` importe mais non utilise.

- [x] src/screens/OnboardingScreenModern.tsx
  - type/interface `OnboardingStep` declare mais non utilise.

- [x] src/screens/profile/ProfileHealthScreen.tsx
  - `Button` importe mais non utilise.
  - `loading` non utilise.
  - parametre `error` non utilise.

- [x] src/screens/profile/ProfileOverviewScreen.tsx
  - `quickActionsItems` declare mais non utilise.

- [x] src/services/apiClient.ts
  - `saveSession` importe mais non utilise.
  - `clearSession` importe mais non utilise.

- [x] src/services/auth.ts
  - `AppConfig` importe mais non utilise.

- [x] src/services/demoAuth.ts
  - parametre `password` non utilise (fonction indiquee par TS).

- [x] src/services/demoPlan.ts
  - parametre `userId` non utilise (fonction indiquee par TS).

- [x] src/services/plan.ts
  - `planId` non utilise.
  - `macros` non utilise.
  - `user` non utilise.

## Notes

- Cette liste est volontairement conservative: on supprime un element uniquement apres verification fonctionnelle.
- Proposition de cadence: traiter 2-3 fichiers par PR pour limiter les regressions.
- Inventaire `noUnusedLocals` / `noUnusedParameters` nettoye completement au 2026-06-21.

## Backlog design / architecture observe pendant l'exploration

- [x] Finaliser la migration light/dark sur les composants legacy encore statiques:
  - `src/components/OnboardingTrainingStep.tsx`
  - `src/components/HealthStep.tsx`
  - `src/components/MealEditModal.tsx`
  - `src/components/NutritionGoalsModal.tsx`

- [x] Supprimer `src/navigation/DrawerNavigator.tsx`
  - implementation drawer legacy retiree du codebase
  - documentation et contexte a realigner sur une navigation tabs-only

- [ ] Verifier toute l'app sur appareil iPhone avec encoche en mode clair et sombre
  - valider top safe-area de l'accueil et hauteur reelle du tab bar
  - controler les ecrans a long scroll (nutrition, profil, photos, confidentialite)
  - verifier les surfaces secondaires Training / Settings en plein soleil et luminosite reduite
  - fait en code: accueil + tab bar adaptes aux insets dynamiques (reste a valider visuellement sur iPhone reel)

- [ ] Finaliser l'audit accessibilite mobile de base sur device
  - VoiceOver: ordre de lecture des cartes Home et des onglets
  - contrastes des textes secondaires et boutons ghost dans Training / Settings
  - taille cible tactile des chips de theme et CTA secondaires sur iPhone mini
  - fait en code: labels/roles/hints renforces sur ProfilOverview, ProfilPhotos, Nutrition

- [ ] Revoir la navigation secondaire profile/settings
  - valider que tous les ecrans utilitaires passent bien par Parametres ou par des CTA dedies

- [~] Uniformiser les safe areas restantes
  - fait: Training, Supplements, ProfileGoals, ProfileTraining, ProfilePhotos, ProfilePrivacy
  - restant: Login, Onboarding modern, OnboardingTrainingStep, TimePickerModal, Dashboard legacy, fallbacks Navigation

- [x] Lancer les audits skills `AllSkills/mobile-app-design`
  - `validate-touch-targets.sh`: 0 issue sur `BerserkerCut/src`
  - `accessibility-audit.sh`: detections majoritairement sur boutons custom, plus corrections appliquees sur les ecrans prioritaires
