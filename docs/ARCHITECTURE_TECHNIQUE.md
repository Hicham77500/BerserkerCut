# Architecture Technique - BerserkerCut

**Version:** 1.0.4  
**Date:** 10 octobre 2025  
**Plateforme cible:** iOS-first, PWA en Phase 2

---

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Stack technique](#stack-technique)
3. [Architecture globale](#architecture-globale)
4. [Structure du projet](#structure-du-projet)
5. [Navigation](#navigation)
6. [Gestion de l'état](#gestion-de-létat)
7. [Services](#services)
8. [Thème et design system](#thème-et-design-system)
9. [Sécurité et authentification](#sécurité-et-authentification)
10. [Performance](#performance)

---

## 🎯 Vue d'ensemble

BerserkerCut est une application React Native Expo TypeScript pour la gestion intelligente de la sèche (cutting) avec des plans de nutrition et de supplémentation personnalisés.

### Stratégie de développement

**Phase 1 (Actuelle):** iOS-first
- Optimisations natives iOS
- Animations et transitions iOS
- Patterns UX iOS
- Déploiement via TestFlight et App Store

**Phase 2 (Future):** PWA
- Réutilisation de 90% du code existant
- Adaptations web-specific
- Progressive Web App features
- Architecture cross-platform

---

## 🛠 Stack technique

### Core Framework
```json
{
  "expo": "54.0.12",
  "react": "19.1.0",
  "react-native": "0.81.4",
  "typescript": "~5.9.2"
}
```

### Navigation
```json
{
  "@react-navigation/native": "^7.1.14",
  "@react-navigation/stack": "^7.4.2",
  "@react-navigation/bottom-tabs": "^7.4.2"
}
```

### State Management & Storage
```json
{
  "@react-native-async-storage/async-storage": "2.2.0",
  "expo-secure-store": "~13.0.1"
}
```

### UI & UX
```json
{
  "react-native-gesture-handler": "~2.28.0",
  "react-native-safe-area-context": "~5.6.0",
  "react-native-screens": "~4.16.0",
  "react-native-svg": "^15.3.0"
}
```

### Media & Storage
```json
{
  "expo-image-picker": "~15.0.7",
  "expo-media-library": "^18.2.0",
  "expo-file-system": "~19.0.16"
}
```

### Testing
```json
{
  "@testing-library/react-native": "^12.5.0",
  "@testing-library/jest-native": "^5.4.3",
  "jest": "^29.7.0",
  "jest-expo": "~54.0.2"
}
```

---

## 🏗 Architecture globale

### Pattern architectural

**Clean Architecture** avec séparation claire des responsabilités :

```
┌─────────────────────────────────────────────┐
│              PRESENTATION LAYER             │
│  (Screens, Components, Navigation)          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│              BUSINESS LOGIC                 │
│  (Hooks, Services, Utils)                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│              DATA LAYER                     │
│  (Storage, API, Firebase)                   │
└─────────────────────────────────────────────┘
```

### Principes de conception

1. **Composants réutilisables** : Design System cohérent
2. **Hooks personnalisés** : Logique métier isolée et testable
3. **Services modulaires** : Séparation des préoccupations
4. **TypeScript strict** : Type-safety à tous les niveaux
5. **iOS-first optimization** : Performance et UX natives

---

## 📁 Structure du projet

```
BerserkerCut/
├── src/
│   ├── components/           # Composants réutilisables UI
│   │   ├── AppToolbar.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── CircularProgress.tsx
│   │   ├── HealthStep.tsx
│   │   ├── Input.tsx
│   │   ├── IOSButton.tsx
│   │   ├── IOSCheckbox.tsx
│   │   ├── MacroCard.tsx
│   │   ├── MealEditModal.tsx
│   │   ├── ModeBadge.tsx
│   │   ├── NutritionGoalsModal.tsx
│   │   ├── OnboardingTrainingStep.tsx
│   │   ├── PrivacyConsentModal.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── TimePickerModal.tsx
│   │   └── index.ts
│   │
│   ├── constants/            # Constantes globales
│   │   └── storageKeys.ts
│   │
│   ├── hooks/                # Custom React Hooks
│   │   ├── useAuth.tsx       # Authentification
│   │   ├── usePlan.tsx       # Plans nutrition
│   │   └── useThemeMode.tsx  # Gestion thème
│   │
│   ├── navigation/           # Configuration navigation
│   │   ├── Navigation.tsx
│   │   ├── MainNavigator.tsx
│   │   └── StackNavigators.tsx
│   │
│   ├── screens/              # Écrans de l'application
│   │   ├── home/
│   │   │   ├── HomeDashboardScreen.tsx
│   │   │   └── LegacyHomeScreen.tsx
│   │   ├── nutrition/
│   │   │   ├── NutritionScreen.tsx
│   │   │   └── NutritionCalendarScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileOverviewScreen.tsx
│   │   │   ├── ProfileHealthScreen.tsx
│   │   │   ├── ProfileGoalsScreen.tsx
│   │   │   ├── ProfileTrainingScreen.tsx
│   │   │   ├── ProfileSupplementsScreen.tsx
│   │   │   ├── ProfilePhotosScreen.tsx
│   │   │   └── ProfilePrivacyScreen.tsx
│   │   ├── training/
│   │   │   └── TrainingScreen.tsx
│   │   ├── supplements/
│   │   │   └── SupplementsScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── OnboardingScreenModern.tsx
│   │   └── index.ts
│   │
│   ├── services/             # Services métier
│   │   ├── apiClient.ts
│   │   ├── appModeService.ts
│   │   ├── auth.ts
│   │   ├── demoAuth.ts
│   │   ├── demoPlan.ts
│   │   ├── healthService.ts
│   │   ├── photo.ts
│   │   ├── photoStorage.ts
│   │   ├── plan.ts
│   │   ├── sessionStorage.ts
│   │   └── trainingService.ts
│   │
│   ├── types/                # Définitions TypeScript
│   │   ├── TrainingProfile.ts
│   │   ├── expo-modules.d.ts
│   │   ├── global.d.ts
│   │   └── index.ts
│   │
│   ├── utils/                # Utilitaires
│   │   ├── accessibility.ts
│   │   ├── config.ts
│   │   ├── debug.ts
│   │   ├── designSystem.ts
│   │   ├── networkFallback.ts
│   │   ├── nutritionConstants.ts
│   │   ├── theme.ts
│   │   └── storage/
│   │
│   ├── examples/             # Exemples de composants
│   │   └── OnboardingTrainingStepExample.tsx
│   │
│   └── architecture.config.ts
│
├── __tests__/                # Tests unitaires
│   ├── HomeDashboardScreen.test.tsx
│   ├── NutritionScreen.test.tsx
│   ├── ProfileHealthScreen.test.tsx
│   └── __snapshots__/
│
├── android/                  # Configuration Android
├── ios/                      # Configuration iOS
├── assets/                   # Images, icônes
├── backend/                  # Backend (si applicable)
├── docs/                     # Documentation
├── public/                   # Assets publics PWA
│
├── App.tsx                   # Point d'entrée
├── index.ts                  # Index principal
├── app.json                  # Configuration Expo
├── tsconfig.json             # Configuration TypeScript
├── babel.config.js           # Configuration Babel
└── package.json              # Dépendances
```

---

## 🧭 Navigation

### Architecture de navigation

L'application utilise une navigation **tabs-first** combinant :
1. **Bottom Tab Navigator** (onglets en bas)
2. **Stack Navigators** (navigation hiérarchique par domaine)
3. **Stack interne Profile** pour les ecrans utilitaires et contextuels

### Hiérarchie de navigation

```
MainNavigator
├── MainTabs
│   ├── HomeStack
│   │   └── HomeDashboardScreen
│   ├── NutritionStack
│   │   ├── NutritionScreen
│   │   └── NutritionCalendarScreen
│   ├── TrainingStack
│   │   └── TrainingScreen
│   ├── AgendaStack
│   │   └── AgendaScreen
│   └── SettingsStack
│       └── SystemSettingsScreen
│
└── ProfileStack
    ├── ProfileOverviewScreen
        ├── ProfileHealthScreen
        ├── ProfileGoalsScreen
        ├── ProfileTrainingScreen
        ├── ProfileSupplementsScreen
        ├── ProfilePhotosScreen
        └── ProfilePrivacyScreen
```

### Animations de navigation

**iOS Transitions** :
```typescript
TransitionPresets.SlideFromRightIOS
```

**Tabs & safe areas** :
- Hauteur du tab bar adaptee au `safe-area inset` bas.
- `HomeDashboardScreen` protege a nouveau l'encoche haute sans recreer le gap bas.

---

## 🔄 Gestion de l'état

### Stratégie

**Local State Management** avec React Hooks :
- `useState` pour état local
- `useContext` pour état global
- `useRef` pour valeurs persistantes
- Custom hooks pour logique métier

### Custom Hooks principaux

#### useAuth
```typescript
// Gestion authentification utilisateur
const { user, login, logout, isLoading } = useAuth();
```

#### usePlan
```typescript
// Gestion plans nutrition
const { plan, updatePlan, isLoading } = usePlan();
```

#### useThemeMode
```typescript
// Gestion thème dark/light
const { colors, isDark, toggleTheme } = useThemeMode();
```

### Storage

**AsyncStorage** : Données non-sensibles
```typescript
await AsyncStorage.setItem('key', value);
```

**SecureStore** : Données sensibles (tokens, credentials)
```typescript
await SecureStore.setItemAsync('token', value);
```

---

## 🔧 Services

### Architecture des services

Tous les services sont **modulaires et isolés** :

#### auth.ts
- Authentification utilisateur
- Gestion de session
- Token management

#### plan.ts
- Génération plans nutrition
- Calculs macros
- Adaptation entraînement/repos

#### healthService.ts
- Profil santé utilisateur
- Calculs métaboliques
- Objectifs de poids

#### trainingService.ts
- Profil d'entraînement
- Programmes personnalisés
- Tracking progression

#### photoStorage.ts
- Upload photos progression
- Galerie utilisateur
- Compression et optimisation

#### appModeService.ts
- Mode entraînement/repos
- Adaptation quotidienne
- Notifications

---

## 🎨 Thème et design system

### Palette de couleurs

#### Dark Mode (par défaut)
```typescript
const darkPalette = {
  primary: '#FF6B35',      // Orange vif
  secondary: '#4ECDC4',    // Turquoise
  background: '#1C1A18',   // Noir chaud
  surface: '#2D2A27',      // Gris foncé
  text: '#FFFFFF',         // Blanc
  textSecondary: '#A8A29E', // Gris clair
  error: '#EF4444',        // Rouge
  success: '#10B981',      // Vert
  warning: '#F59E0B'       // Jaune
}
```

#### Light Mode
```typescript
const lightPalette = {
  primary: '#FF6B35',
  secondary: '#4ECDC4',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#1C1A18',
  textSecondary: '#6B7280',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B'
}
```

### Typography

```typescript
const Typography = {
  h1: { fontSize: 32, fontWeight: '700' },
  h2: { fontSize: 24, fontWeight: '600' },
  h3: { fontSize: 20, fontWeight: '600' },
  body1: { fontSize: 16, fontWeight: '400' },
  body2: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' }
}
```

### Spacing

```typescript
const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
}
```

### Composants iOS-optimized

- **IOSButton** : Bouton style iOS natif
- **IOSCheckbox** : Checkbox iOS-style
- **Card** : Card avec shadow iOS
- **CircularProgress** : Progress indicator iOS

---

## 🔐 Sécurité et authentification

### Firebase Authentication

**Méthodes supportées** :
- Email/Password
- OAuth (Google, Apple)
- Anonymous (mode démo)

### Protection des données

**Données sensibles** :
- Stockage dans SecureStore
- Chiffrement AES-256
- Tokens JWT

**Données utilisateur** :
- AsyncStorage pour cache
- Synchronisation Firestore
- Offline-first approach

### Règles de sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
    }
  }
}
```

---

## ⚡ Performance

### Optimisations iOS

1. **Native Driver** pour animations
2. **React.memo** pour composants purs
3. **useMemo/useCallback** pour calculs lourds
4. **FlatList** pour listes longues
5. **Image optimization** avec Expo Image

### Métriques cibles

- **Time to Interactive** : < 2s
- **Bundle size** : < 25MB
- **Memory usage** : < 100MB
- **Frame rate** : 60 FPS constant

### Code Splitting

```typescript
const Screen = React.lazy(() => import('./Screen'));
```

### Bundle optimization

```json
"expo": {
  "experiments": {
    "treeShaking": true
  },
  "ios": {
    "bundleIdentifier": "com.berserkercut.app"
  }
}
```

---

## 📊 Monitoring

### Error Tracking
- Expo Error Reporting
- Custom error boundaries
- Crash analytics

### Analytics
- User engagement tracking
- Feature usage metrics
- Performance monitoring

---

## 🚀 Déploiement

### iOS (Phase 1)
1. Build avec EAS Build
2. TestFlight pour beta testing
3. App Store submission

### PWA (Phase 2)
1. Expo Web build
2. Service Worker pour offline
3. Déploiement web hosting

---

## 📝 Conventions de code

### TypeScript
- **Strict mode** activé
- **Interfaces** pour types publics
- **Types** pour unions/intersections
- **Enums** pour constantes

### Naming
- **Components** : PascalCase
- **Functions** : camelCase
- **Constants** : UPPER_SNAKE_CASE
- **Files** : PascalCase.tsx ou camelCase.ts

### Import order
```typescript
// 1. React
import React from 'react';

// 2. External libraries
import { View } from 'react-native';

// 3. Internal modules
import { useAuth } from '@/hooks/useAuth';
```

---

**Fin du document - Architecture Technique v1.0.4**
