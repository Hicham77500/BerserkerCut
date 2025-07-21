# BerserkerCut - Roadmap de Développement 🗺️

## 📋 Stratégie de Développement

### Approche iOS-First puis PWA

Ce projet suit une stratégie de développement en deux phases pour maximiser la qualité et optimiser les ressources :

1. **Phase 1 : iOS Native** (Priorité absolue)
2. **Phase 2 : PWA** (Réutilisation du code existant)

---

## 🎯 Phase 1 : iOS Native (En cours)

### Objectifs
- Créer une expérience iOS native parfaite
- Établir une architecture solide et réutilisable
- Valider le modèle métier et l'UX
- Optimiser les performances sur iOS

### Fonctionnalités Ciblées

#### ✅ Complétées
- Architecture de base React Native + Expo
- Authentification Firebase
- Écrans principaux (Login, Onboarding, Dashboard, Profile)
- Services Firebase (Auth, Plans)
- Types TypeScript complets
- Navigation React Navigation
- Génération intelligente de plans
- Interface utilisateur moderne

#### 🔄 En Développement
- Optimisation des performances iOS
- Tests unitaires et d'intégration
- Gestion d'erreurs avancée
- Mode hors ligne avec synchronisation

#### 📋 À Venir
- Notifications push iOS
- Widgets iOS (optionnel)
- Tests sur différents appareils iOS
- Optimisations spécifiques iOS (animations, transitions)
- Déploiement TestFlight
- Publication App Store

### Technologies Phase 1
```typescript
// Stack technique iOS
- React Native (0.79.5)
- Expo SDK (53.0.17)
- TypeScript (5.8.3)
- Firebase v11.10.0
- React Navigation 7.x
- AsyncStorage pour le cache local
```

---

## 🌐 Phase 2 : PWA (Futur)

### Objectifs
- Réutiliser 90% du code existant
- Adapter l'UX pour le web
- Optimiser pour les performances web
- Maintenir la parité fonctionnelle

### Architecture PWA Prévue

```
src/
├── platforms/
│   ├── mobile/          # Code spécifique React Native
│   │   ├── navigation/
│   │   ├── storage/     # AsyncStorage
│   │   └── components/  # Composants RN spécifiques
│   └── web/            # Code spécifique PWA
│       ├── navigation/  # React Router
│       ├── storage/     # localStorage/IndexedDB
│       └── components/  # Composants web spécifiques
├── shared/             # Code commun (90% du projet actuel)
│   ├── components/     # Composants cross-platform
│   ├── services/       # Services Firebase (inchangés)
│   ├── hooks/          # Hooks React (inchangés)
│   ├── utils/          # Utilitaires (inchangés)
│   └── types/          # Types TypeScript (inchangés)
```

### Adaptations PWA Nécessaires

#### Navigation
```typescript
// React Native → Web
- React Navigation → React Router
- Stack Navigator → Browser History
- Tab Navigator → Navigation Menu
```

#### Stockage
```typescript
// React Native → Web
- AsyncStorage → localStorage/IndexedDB
- Secure Storage → Web Crypto API
```

#### Interface
```typescript
// Adaptations web
- Responsive Design (mobile-first)
- Touch → Mouse interactions
- Gestures → Click events
- SafeAreaView → CSS viewport
```

#### Fonctionnalités Web Spécifiques
- Service Workers pour le cache
- Web Push Notifications
- PWA Manifest
- Offline-first avec IndexedDB
- Performance monitoring

---

## 📅 Timeline Estimé

### Phase 1 : iOS (2-3 mois)
```
Mois 1:
- Finalisation des fonctionnalités core
- Tests et débogage
- Optimisations iOS

Mois 2:
- Tests utilisateurs
- Corrections et améliorations
- Préparation App Store

Mois 3:
- Déploiement TestFlight
- Feedback et itérations
- Publication App Store
```

### Phase 2 : PWA (1-2 mois)
```
Mois 1:
- Refactoring architecture
- Adaptations web
- Tests cross-platform

Mois 2:
- Optimisations PWA
- Déploiement web
- Documentation
```

---

## 🔄 Migration vers PWA

### Étapes de Transition

1. **Analyse du Code Existant**
   - Identifier le code réutilisable (90%)
   - Localiser les adaptations nécessaires (10%)

2. **Refactoring Architecture**
   - Créer les dossiers `platforms/` et `shared/`
   - Migrer le code commun vers `shared/`
   - Créer les adaptations spécifiques

3. **Implémentation Web**
   - Configuration webpack/Vite
   - Adaptations des composants
   - Navigation web
   - PWA features

4. **Tests et Optimisations**
   - Tests cross-platform
   - Performance monitoring
   - Progressive enhancement

---

## 🎯 Avantages de cette Approche

### Phase iOS
- ✅ Focus sur une plateforme = qualité maximale
- ✅ Architecture éprouvée avant réplication
- ✅ Feedback utilisateur précoce
- ✅ Validation du modèle métier

### Phase PWA
- ✅ Réutilisation massive du code
- ✅ Architecture déjà testée
- ✅ Expérience utilisateur validée
- ✅ Time-to-market réduit

---

## 📊 Métriques de Succès

### Phase 1 (iOS)
- Performance : 60 FPS constant
- Temps de démarrage < 3s
- Taux de crash < 0.1%
- Rating App Store > 4.5

### Phase 2 (PWA)
- Lighthouse Score > 90
- First Contentful Paint < 2s
- Code réutilisé > 85%
- Feature parity = 100%

---

## 🔧 Outils et Technologies

### Actuels (iOS)
- React Native + Expo
- TypeScript
- Firebase
- Metro bundler

### Futurs (PWA)
- Vite/Webpack pour le bundling
- React Router pour la navigation
- Workbox pour les Service Workers
- Vercel/Netlify pour le déploiement

---

Cette roadmap sera mise à jour régulièrement selon l'avancement du projet et les retours utilisateurs.
