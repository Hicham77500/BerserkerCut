# Architecture BerserkerCut

## Couches
- **Interface** : écrans React Native (`src/screens`) et navigation (`src/navigation`).
- **Application** : hooks (`useAuth`, `usePlan`) qui orchestrent les services et exposent l'état au reste de l'app.
- **Services** : implémentations métier (`AuthService`, `PlanService`, `Demo*`) qui dialoguent avec l'API backend (MongoDB) ou le mode démo local.
- **Infrastructure** : configuration centrale (`src/utils/config.ts`), client HTTP (`src/services/apiClient.ts`), stockage de session (`src/services/sessionStorage.ts`) et types partagés (`src/types`).

## Flux d'authentification
1. `AuthProvider` branche `AuthService.onAuthStateChanged` pour hydrater le contexte utilisateur depuis la session locale.
2. `AuthService` route vers l'API (`/auth/*`, `/users/*`) ou `DemoAuthService` selon le flag `USE_DEMO_MODE`.
3. Les profils sont récupérés via l'API (`getUserProfile`) et stockés en AsyncStorage pour hydrater le contexte après redémarrage.

## Onboarding → Profil
- Étape 1 : données basiques (nom, objectifs) fusionnées dans `UserProfile` avant envoi à `AuthService.updateProfile`.
- Étape 2 : `HealthStep` renvoie un `Partial<HealthProfile>` utilisé pour compléter `profile.health`.
- Étape 3 : `OnboardingTrainingStep` produit un `ExtendedTrainingProfile` transmis à `saveTrainingProfile` (API `/users/{id}/training-profile`).
- Étape 4 : préférences suppléments envoyées à `updateProfile` pour persistance côté backend.

## Génération des plans
- `PlanProvider` appelle `PlanService.getTodaysPlan`; si aucun plan n'existe, `generateDailyPlan` calcule les besoins (formule Harris-Benedict), répartit macros/repas, génère les suppléments puis persiste le plan via l'API (`PUT /plans/{planId}`).
- `PlanService.markSupplementTaken` délègue au backend (`POST /plans/{planId}/supplements/{supplementId}/taken`) ou à `DemoPlanService` en mode démo.

## Mode démo
- `USE_DEMO_MODE` active les services AsyncStorage (`DemoAuthService`, `DemoPlanService`, stockage `training_profile_*`).
- Les services démo stockent l'état localement pour permettre des tests hors connexion et éviter toute dépendance au backend.

## Backend API
- `backend/` contient un service Express connecté à MongoDB Atlas.
- Les routes REST implémentent les use cases attendus par `AuthService`, `PlanService` et `trainingService`.
- Les modèles principaux (`users`, `training_profiles`, `daily_plans`) sont stockés via Mongoose.

## Points de maintenance
- Mettre à jour `docs/ARCHITECTURE.md` si les endpoints ou flux principaux évoluent.
- Garder les flags `USE_DEMO_MODE` et la configuration (`AppConfig`) alignés entre services.
- Vérifier les types partagés (`src/types`) lors de l'ajout de nouveaux champs profil/plan pour garantir la cohérence API ↔ client.
