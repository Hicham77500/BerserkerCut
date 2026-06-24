# Documentation Technique - BerserkerCut

**Version :** 1.1.0  
**Date :** 25 juin 2026  
**Portée :** Application mobile React Native / Expo (iOS-first)

> Note de gouvernance: la source de verite produit/architecture est `PROJECT_CONTEXT.md`.
> La politique de nommage/commentaires est decrite dans `PROJECT_CONTEXT.md` section `11) Politique de conventions`.

---

## 📦 Installation & Configuration

### Prérequis
- Node.js ≥ 18
- npm ≥ 9 (recommandé) ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Xcode / iOS Simulator pour tests iOS
- Android Studio pour tests Android (optionnel)

### Installation
```bash
# Cloner le dépôt
git clone <url-du-repo>
cd BerserkerCut

# Installer les dépendances
npm install

# Initialiser les pods iOS
cd ios && pod install && cd ..
```

### Variables d’environnement
Créer un fichier `.env` à la racine :
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
EXPO_PUBLIC_FORCE_DEMO_MODE=false
```

- `EXPO_PUBLIC_API_BASE_URL`: base URL de l'API REST Node/Express.
- `EXPO_PUBLIC_FORCE_DEMO_MODE=true`: force le mode demo local meme si l'API est disponible.

### Scripts utiles (`package.json`)
```bash
npm start          # Expo Dev Server
npm run ios        # Build & run iOS (simulateur)
npm run android    # Build & run Android
npm run web        # Mode PWA
npm test           # Tests unitaires
```

---

## 🧭 Navigation détaillée

### Architecture globale
- `src/navigation/Navigation.tsx` : conteneur racine (Auth + Plans + stack racine)
- `src/navigation/MainNavigator.tsx` : navigation principale tabs-only
- `src/navigation/StackNavigators.tsx` : piles pour chaque domaine

### Flux principale
```
NavigationContainer
└─ AuthProvider / PlanProvider
   └─ AppNavigator (stack racine)
      ├─ LoginScreen
      ├─ OnboardingScreen
      └─ MainNavigator
         ├─ MainTabs (5 stacks visibles)
         └─ ProfileStack (route interne)
```

### TabNavigator
- La navigation principale active est tabs-only, sans drawer global.
- `ProfileStack` reste accessible via routes internes sans dupliquer la navigation primaire.
- Le nombre exact d'onglets visibles peut evoluer selon le scope MVP; verifier `src/navigation/MainNavigator.tsx`.
- Style dynamique clair/sombre et hauteur ajustee aux safe areas.

---

## 🎨 Composants UI (sélection)

| Composant | Fichier | Usage principal |
|-----------|---------|-----------------|
| `Button` | `src/components/Button.tsx` | Boutons primaires / secondaires avec état loading |
| `Card` | `src/components/Card.tsx` | Conteneur avec ombre iOS |
| `IOSButton` | `src/components/IOSButton.tsx` | CTA style Cupertino |
| `IOSCheckbox` | `src/components/IOSCheckbox.tsx` | Checkbox iOS | 
| `MacroCard` | `src/components/MacroCard.tsx` | Affichage macro nutriments |
| `PrivacyConsentModal` | `src/components/PrivacyConsentModal.tsx` | Consentement RGPD |
| `MealEditModal` | `src/components/MealEditModal.tsx` | Édition repas |
| `ProgressBar` | `src/components/ProgressBar.tsx` | Progress bar personnalisable |
| `CircularProgress` | `src/components/CircularProgress.tsx` | Indicateur circulaire |

Chaque composant suit :
- Props typées (TypeScript)
- Théme sombre (`useThemeMode` + `ThemePalette`)
- Comportements testables (hooks | fonctions pures)

---

## 🔧 Services & API

| Service | Fichier | Rôle |
|---------|---------|------|
| `auth.ts` | `src/services/auth.ts` | Authentification REST JWT (login, register, logout, updateProfile) |
| `demoAuth.ts` | `src/services/demoAuth.ts` | Mode démo local |
| `plan.ts` | `src/services/plan.ts` | Génération plans nutrition (macros, repas, suppléments) |
| `healthService.ts` | `src/services/healthService.ts` | Profil santé (IMC, objectifs) |
| `trainingService.ts` | `src/services/trainingService.ts` | Programmes d’entraînement personnalisés |
| `photoStorage.ts` | `src/services/photoStorage.ts` | Upload & gestion des photos de progression |
| `appModeService.ts` | `src/services/appModeService.ts` | Gestion mode entraînement/repos |
| `sessionStorage.ts` | `src/services/sessionStorage.ts` | Session locale (AsyncStorage) |
| `apiClient.ts` | `src/services/apiClient.ts` | Client HTTP centralisé |
| `agendaService.ts` | `src/services/agendaService.ts` | Création d'événements natifs (Expo Calendar) |

**Back-end** : dossier `backend/` (Node.js + Express) pour API REST, avec authentification JWT.

---

## 🪝 Hooks personnalisés

### `useAuth`
- Provider + hook (`src/hooks/useAuth.tsx`)
- Gestion de l’état utilisateur (API JWT + mode démo)
- Modal consentement confidentialité (SecureStore)
- Méthodes exposées : `login`, `register`, `logout`, `updateProfile`
 
### `usePlan`
- Gestion plan nutrition quotidien (`src/hooks/usePlan.tsx`)
- Récupère/génère les plans via `plan.ts`
- Met à jour les repas, rafraîchit les données

### `useThemeMode`
- Gestion du thème sombre/clair (`src/hooks/useThemeMode.tsx`)
- Stockage préférence (`AsyncStorage`)
- Expose `colors`, `navigationTheme`, `toggleTheme`

### `useNotifications`
- Abstraction Expo Notifications (`src/hooks/useNotifications.ts`)
- Provisionne : `scheduleNotification`, `scheduleDailyReminder`, `cancelAll`, état de permission
- Gestion optimisée iOS (handler foreground, channel Android par défaut)

### `useAgenda`
- Synchronisation calendrier natif (`src/hooks/useAgenda.ts`)
- Rafraîchit les événements à 14 jours, demande les permissions Expo Calendar
- Helpers pour planifier les séances/nutrition depuis l'app

---

## � Notifications & Agenda natif

### Notifications locales (Expo Notifications)
- Module utilitaire : `src/utils/notifications.ts`
   - `configureNotifications()` : handler foreground + channel Android
   - `requestPermissionsAsync()` : autorisation iOS (provisionnel supporté)
   - `scheduleNotification()` : payload générique avec métadonnées `data`
   - `scheduleDailyReminder()` : rappels journaliers (nutrition/suppléments)
   - `cancelAllNotifications()` / `listScheduledNotifications()` pour le debug
- Hook `useNotifications`
   - Centralise l'état de permission (`granted`/`denied`/`undetermined`)
   - Fournit `scheduleNotification`, `scheduleDailyReminder`, `cancelAll`
   - Listener `addNotificationResponseReceivedListener` prêt pour analytics/navigation
- Intégration UI : `SystemSettingsScreen`
   - CTA d'autorisation + rappels matin/soir préconfigurés
   - Bouton de test (notification 5 secondes) et reset des rappels

### Agenda iOS (Expo Calendar)
- Service `agendaService.ts`
   - Crée un calendrier dédié "BerserkerCut Agenda" (couleur cuivre)
   - Ajoute des événements avec alarmes -15 min (séance, meal prep)
   - Liste les événements sur 7/14 jours pour l'UI
- Hook `useAgenda`
   - Gère permissions (`getCalendarPermissionsAsync` + fallback request)
   - Rafraîchit les événements après chaque modification
- Écran `AgendaScreen` (si active selon le scope produit)
   - Actions rapides : séance 18h (1h30) / meal prep 12h30 (30 min)
   - Synchronisation manual refresh + empty state convivial
   - Accessibilite via navigation interne dediee (sans dependance a un drawer global)

---

## �💾 Gestion des données

### Stockage local
- `AsyncStorage` : préférences non sensibles (thème, onboarding, mode app)
- `SecureStore` : informations sensibles (consentement cloud, tokens)

### Mode cloud et mode demo
- Mode cloud: API REST JWT (dossier `backend/`).
- Mode demo: stockage local pour valider les parcours sans backend.
- Le mobile ne parle pas directement a la base de donnees: tout passe par la couche service (`src/services/*`).

### Données synchronisées
- Profil utilisateur (`UserProfile`)
- Plans quotidiens (macros, repas, suppléments)
- Photos de progression
- Profil santé (poids, taille, sommeil, activité)

### Conformité RGPD & données de santé
- **Catégorie de données** : certaines informations sont des données de santé (poids, IMC, habitudes de sommeil). Elles sont traitées dans le cadre d’un coaching personnalisé et nécessitent un consentement explicite.
- **Consentement explicite** : la modalité est gérée via `PrivacyConsentModal` (SecureStore).  
   - Collecte du consentement cloud (synchronisation des plans).  
   - Journalisation locale de la date/choix pour prouver la traçabilité.
- **Droits utilisateurs** : l’architecture prévoit la suppression complète des données sur demande (service `auth.logout` + purge des donnees applicatives cote cloud/local).  
- **Minimisation** : seules les données nécessaires aux recommandations sont stockées. Toute donnée facultative est désactivable par l’utilisateur.
- **Anonymisation IA** : pour les fonctionnalités d’IA (roadmap), les données sont **pseudonymisées côté appareil** avant envoi :  
   - Suppression des identifiants personnels (nom, email).  
   - Agrégation sur des identifiants temporaires (hash local).  
   - Les attributs sensibles (poids, sommeil) sont normalisés (plages de valeur) avant transmission.  
- **Serveur & segmentation** : 
   - Backend Node/Express (dossier `backend/`) agit comme passerelle API.  
   - Base de donnees cloud: implementation backend selon configuration de l'environnement.  
   - Serveur IA (à venir) hébergé séparément, ne reçoit que des payloads anonymisés signés (JWT) via la passerelle.  
   - Aucun traitement IA n’est déclenché sans consentement actif.

---

## ✅ Validation & Formulaires

Utilitaires dans `src/utils` :
- `validation.ts` (si présent) ou logique locale dans les écrans
- Exemples : validation email, mot de passe, poids, taille
- Composant `Input` : support erreurs + masque + keyboardType
- Modalités RGPD via `PrivacyConsentModal`

---

## 🧪 Tests

### Config
- Jest + Testing Library (`jest-expo`)
- `jest.config.js` & `jest.setup.ts` (mocks Expo SecureStore, ImagePicker, etc.)

### Fichiers de tests (`__tests__/`)
- `HomeDashboardScreen.test.tsx`
- `NutritionScreen.test.tsx`
- `ProfileHealthScreen.test.tsx`
- Snapshots dans `__tests__/__snapshots__/`

### Bonnes pratiques
- Tester les hooks via `renderHook`
- Mock des services et navigation
- Privilegier les assertions comportementales; eviter les snapshots visuels globaux

---

## 🐛 Debugging

### Logs conditionnels
```tsx
if (__DEV__) {
  console.log('Debug info', data);
}
```

### Network Debugging
- React Native Debugger / Flipper
- `global.XMLHttpRequest = global.originalXMLHttpRequest` (pour dev websockets)

### Performance
- Utiliser `useMemo`, `useCallback`
- `Animated` avec `useNativeDriver`
- `FlatList` vs `ScrollView` pour longues listes

---

## 📝 FAQ Développeurs

**Ajouter un écran ?**  
Creer le composant dans `src/screens/<domaine>/` -> l'ajouter au `StackNavigator` correspondant -> verifier l'integration via la navigation tabs-only.

**Changer les couleurs du thème ?**  
Modifier `src/utils/theme.ts` (palettes `ThemePalette.dark` / `ThemePalette.light`).

**Ajouter un service API ?**  
Créer `src/services/<nom>.ts`, utiliser `apiClient` pour les appels, typage dans `src/types`.

**Activer/désactiver le mode démo ?**  
Utiliser `appModeService` (stockage AsyncStorage, listener global).

**Tester un hook ?**  
Utiliser `@testing-library/react-hooks` ou wrapper custom.

---

## 🔮 Pistes d’amélioration
- Mode “coach IA” (recommandations dynamiques)
- Export des données nutritionnelles (CSV / PDF)
- Intégration Apple Health / Google Fit
- Notifications push intelligentes (expo-notifications)
- Mode offline avancé (cache plans + synchronisation différée)

---

**Fin de la documentation technique v1.1.0**
