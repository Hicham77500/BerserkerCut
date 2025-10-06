# BerserkerCut 🔥

Une application iOS native (React Native Expo) pour la sèche intelligente avec plans nutritionnels et suppléments personnalisés.

> **Stratégie de développement** : iOS-first puis PWA. Voir [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md) pour plus de détails.

## 🎯 Objectif

**BerserkerCut** génère chaque jour un plan nutritionnel et de suppléments adapté selon :
- Votre profil (poids, objectif, jours d'entraînement)
- Le contexte (jour d'entraînement, repos, etc.)
- Vos suppléments disponibles
- Vos préférences alimentaires

## 🚀 Fonctionnalités (Phase iOS)

- **Authentification Firebase** (email/mot de passe)
- **Onboarding complet** avec formulaire de profil
- **Dashboard quotidien** avec plans personnalisés
- **Logique conditionnelle** (plans différents selon le jour)
- **Suivi des suppléments** avec notifications
- **Conseils quotidiens** adaptés au contexte
- **Optimisations iOS** (performances, animations, UX native)

## 📱 Technologies

### Phase Actuelle (iOS Native)
- **React Native** avec Expo SDK 53
- **TypeScript** 5.8.3 pour la type safety
- **Firebase** v11.10.0 (Authentication & Firestore)
- **React Navigation** v7 pour la navigation
- **Architecture propre** avec séparation des responsabilités

### Phase Future (PWA)
- Architecture partagée (90% de code réutilisé)
- React Router pour la navigation web
- Service Workers pour l'offline
- PWA optimizations

## 🏗️ Architecture

### Phase iOS (Actuelle)
```
src/
├── components/     # Composants réutilisables
├── hooks/         # Contextes React (Auth, Plan)
├── navigation/    # Configuration de navigation
├── screens/       # Écrans de l'application
├── services/      # Services Firebase
├── types/         # Types TypeScript
└── utils/         # Utilitaires et thème
```
Pour la vue d'ensemble complète, voir `docs/ARCHITECTURE.md`.

### Phase PWA (Future)
```
src/
├── platforms/
│   ├── mobile/     # Code spécifique React Native
│   └── web/        # Code spécifique PWA
├── shared/         # Code commun (90% du code actuel)
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   └── types/
```

## 🔧 Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd BerserkerCut
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer Firebase**
   - Créer un projet Firebase
   - Activer Authentication (email/password)
   - Activer Firestore
   - Mettre à jour les clés dans `app.json`
   - Voir [docs/setup/FIREBASE_SETUP.md](./docs/setup/FIREBASE_SETUP.md) pour plus de détails

4. **Lancer l'application (iOS)**
   ```bash
   # Développement
   npm start
   
   # Build iOS spécifique
   npm run ios
   
   # Pour tester sur simulateur iOS
   expo run:ios
   ```

## 🔥 Firebase Configuration

### Firestore Collections

- **users**: Profils utilisateurs
- **dailyPlans**: Plans quotidiens générés

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Daily plans can only be accessed by their owner
    match /dailyPlans/{planId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🍽️ Logique Métier

### Génération des Plans

1. **Calcul des besoins caloriques**
   - Métabolisme de base (Harris-Benedict)
   - Facteur d'activité
   - Ajustement selon l'objectif (sèche, recomp)

2. **Répartition des macronutriments**
   - Protéines : 1.8-2.2g/kg selon l'objectif
   - Lipides : 25-30% des calories
   - Glucides : reste des calories

3. **Génération des repas**
   - Répartition selon le type de jour
   - Sélection d'aliments adaptés
   - Calcul des portions

### Suppléments

- **Timing intelligent** selon l'entraînement
- **Dosages personnalisés**
- **Suivi de prise** avec notifications

## 🎨 UI/UX

- **Design moderne** avec Material Design
- **Navigation intuitive** avec onglets
- **Feedback visuel** pour les actions
- **Responsive** sur tous les écrans

## 🔒 Sécurité

- **Authentication Firebase** sécurisée
- **Règles Firestore** strictes
- **Validation des données** côté client et serveur
- **Pas de données sensibles** exposées

## 📊 État du Projet

### Phase iOS (En cours) ✅
- ✅ Architecture de base
- ✅ Authentification Firebase
- ✅ Écrans principaux (Login, Onboarding, Dashboard, Profile)
- ✅ Services Firebase (Auth, Plans)
- ✅ Types TypeScript complets
- ✅ Navigation React Navigation
- ✅ Génération intelligente de plans
- ✅ Interface utilisateur moderne
- 🔄 Optimisations iOS en cours
- 📋 Tests et déploiement TestFlight à venir

### Phase PWA (Planifiée) 🔮
- 📋 Refactoring architecture partagée
- 📋 Adaptations web (React Router, localStorage)
- 📋 Service Workers et PWA features
- 📋 Responsive design et optimisations web

## 🚀 Prochaines Étapes

### Phase iOS (Priorité)
1. **Optimisations iOS natives**
   - Performances (60 FPS constant)
   - Animations fluides
   - Gestion mémoire optimisée
2. **Tests approfondis**
   - Tests unitaires et d'intégration
   - Tests sur différents appareils iOS
   - Tests de performance
3. **Préparation App Store**
   - TestFlight beta testing
   - Screenshots et métadonnées
   - Soumission App Store

### Phase PWA (Après iOS)
1. **Refactoring architecture**
   - Migration vers structure partagée
   - Séparation mobile/web
2. **Développement PWA**
   - React Router integration
   - Service Workers
   - Progressive enhancement
3. **Déploiement web**
   - Optimisations Lighthouse
   - Déploiement production

Pour plus de détails, voir [docs/development/DEVELOPMENT_ROADMAP.md](./docs/development/DEVELOPMENT_ROADMAP.md)

## 📚 Documentation

La documentation complète du projet est organisée dans le dossier `docs/` :

### 🛠️ Setup & Configuration
- [Firebase Setup](./docs/setup/FIREBASE_SETUP.md) - Configuration Firebase complète
- [Firebase Activation](./docs/setup/FIREBASE_ACTIVATION.md) - Activation des services
- [Firestore Schema](./docs/setup/FIRESTORE_SCHEMA.md) - Structure de la base de données
- [Firebase Troubleshooting](./docs/setup/FIREBASE_TROUBLESHOOTING.md) - Résolution de problèmes

### 🔧 Development
- [Development Roadmap](./docs/development/DEVELOPMENT_ROADMAP.md) - Stratégie iOS→PWA
- [Development Log](./docs/development/DEVELOPMENT_LOG.md) - Journal de développement
- [Deployment Guide](./docs/development/DEPLOYMENT.md) - Guide de déploiement
- [Testing Guide](./docs/development/TESTING.md) - Guide des tests

### 🚀 Features
- [Health Improvements](./docs/features/HEALTH_IMPROVEMENTS.md) - Améliorations santé
- [Mission Accomplished](./docs/features/MISSION_ACCOMPLISHED.md) - Fonctionnalités complétées
- [Onboarding Training](./docs/features/ONBOARDING_TRAINING_IMPLEMENTATION.md) - Implémentation onboarding

### 📋 Releases
- [Release Notes v1.0.1](./docs/releases/RELEASE_NOTES_v1.0.1.md)
- [Release Notes v1.0.2](./docs/releases/RELEASE_NOTES_v1.0.2.md)
- [Release Notes v1.0.4](./docs/releases/RELEASE_NOTES_v1.0.4.md) - iOS-first + PWA prep
- [Migration Notes v1.0.4](./docs/releases/MIGRATION_NOTES_v1.0.4.md) - Architecture migration
- [PWA Transition v1.0.4](./docs/releases/PWA_TRANSITION_v1.0.4.md) - Plan transition PWA

## 🤝 Contribution

Ce projet utilise une architecture modulaire qui facilite les contributions :
- Respecter les conventions TypeScript
- Suivre le pattern établi pour les services
- Ajouter des tests pour les nouvelles fonctionnalités
- Maintenir la documentation à jour

## 📝 Licence

Projet privé - Tous droits réservés.

---

**BerserkerCut** - Votre coach de sèche intelligent 🔥💪
