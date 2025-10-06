# Architecture BerserkerCut

## Couches
- **Interface** : écrans React Native dans `src/screens` et navigation dans `src/navigation`.
- **Application** : hooks (`useAuth`, `usePlan`) qui orchestrent les services et exposent l'état au reste de l'app.
- **Services** : implémentations métier (`AuthService`, `PlanService`, `Demo*`) qui accèdent à Firebase ou au mode démo.
- **Infrastructure** : configuration Firebase (`src/services/firebase.ts`) et types partagés (`src/types`).

## Flux d'authentification
1. `AuthProvider` branche `AuthService.onAuthStateChanged` et hydrate le contexte utilisateur.
2. `AuthService` route vers Firebase ou `DemoAuthService` selon le flag `USE_DEMO_MODE`.
3. Les profils sont chargés via Firestore (`getUserProfile`) puis stockés dans le contexte.

## Onboarding → Profil
- Étape 1 : données basiques (nom, objectifs) stockées dans `basicInfo` puis fusionnées dans `UserProfile`.
- Étape 2 : `HealthStep` renvoie un `Partial<HealthProfile>` conservé pour remplir `profile.health`.
- Étape 3 : `OnboardingTrainingStep` produit un `ExtendedTrainingProfile` transformé en `TrainingProfile` simple (`mapWeeklyScheduleToTrainingDays`).
- Étape 4 : préférences suppléments stockées et envoyées à `updateProfile`.

## Génération des plans
- `PlanProvider` appelle `PlanService.getTodaysPlan`, puis `generateDailyPlan` si aucun plan n'est présent.
- `PlanService.generateDailyPlan` : calcule les calories (Harris-Benedict), répartit macros / repas, génère les suppléments et persiste le plan (`dailyPlans` collection).
- `PlanService.markSupplementTaken` marque un supplément comme pris dans Firestore (ou via `DemoPlanService`).

## Mode démo
- `USE_DEMO_MODE` active les versions AsyncStorage (`DemoAuthService`, `DemoPlanService`).
- Les services démo stockent l'état localement pour permettre des tests hors connexion.

## Points de maintenance
- Mettre à jour `docs/ARCHITECTURE.md` en cas d'évolution des flux principaux.
- Garder les flags `USE_DEMO_MODE` synchronisés entre services.
- Vérifier les types partagés (`src/types`) lors de l'ajout de nouvelles données profil ou plan.
