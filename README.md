# BerserkerCut 🔥

Une application mobile React Native Expo pour la sèche intelligente avec plans nutritionnels et suppléments personnalisés.

## 🎯 Objectif

**BerserkerCut** génère chaque jour un plan nutritionnel et de suppléments adapté selon :
- Votre profil (poids, objectif, jours d'entraînement)
- Le contexte (jour d'entraînement, repos, etc.)
- Vos suppléments disponibles
- Vos préférences alimentaires

## 🚀 Fonctionnalités

- **Authentification Firebase** (email/mot de passe)
- **Onboarding complet** avec formulaire de profil
- **Dashboard quotidien** avec plans personnalisés
- **Logique conditionnelle** (plans différents selon le jour)
- **Suivi des suppléments** avec notifications
- **Conseils quotidiens** adaptés au contexte

## 📱 Technologies

- **React Native** avec Expo
- **TypeScript** pour la type safety
- **Firebase** (Authentication & Firestore)
- **React Navigation** pour la navigation
- **Architecture propre** avec séparation des responsabilités

## 🏗️ Architecture

```
src/
├── components/     # Composants réutilisables
├── hooks/         # Contextes React (Auth, Plan)
├── navigation/    # Configuration de navigation
├── screens/       # Écrans de l'application
├── services/      # Services Firebase
├── types/         # Types TypeScript
└── utils/         # Utilitaires
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

4. **Lancer l'application**
   ```bash
   npm start
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

- ✅ Architecture de base
- ✅ Authentification Firebase
- ✅ Écrans principaux (Login, Onboarding, Dashboard, Profile)
- ✅ Services Firebase (Auth, Plans)
- ✅ Types TypeScript complets
- ✅ Navigation React Navigation
- ✅ Génération intelligente de plans
- ✅ Interface utilisateur moderne

## 🚀 Prochaines Étapes

1. **Tests de l'application**
2. **Amélioration de l'algorithme** de génération
3. **Notifications push** pour les suppléments
4. **Statistiques** et suivi de progression
5. **Mode hors ligne** avec synchronisation

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
