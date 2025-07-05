# 🚀 Guide de Déploiement BerserkerCut

## Préparation avant déploiement

### 1. Vérification du code
```bash
# Compilation TypeScript
npx tsc --noEmit

# Vérification des packages
npm audit

# Tests manuels
npm start
```

### 2. Configuration Firebase
- [ ] Projet Firebase configuré en production
- [ ] Règles de sécurité Firestore déployées
- [ ] Authentification email/password activée
- [ ] Clés de configuration mises à jour dans `app.json`

### 3. Configuration Expo
```bash
# Installation du CLI Expo
npm install -g @expo/cli

# Connexion au compte Expo
expo login

# Configuration du projet
expo install --fix
```

## Déploiement sur Expo

### 1. Build de développement
```bash
# Build pour Android
expo build:android

# Build pour iOS
expo build:ios
```

### 2. Publication sur Expo
```bash
# Publication sur Expo Go
expo publish

# Ou avec un canal spécifique
expo publish --release-channel production
```

### 3. Configuration des builds
```bash
# Configuration EAS Build
npm install -g eas-cli
eas login
eas build:configure

# Build pour les stores
eas build --platform android
eas build --platform ios
```

## Déploiement sur les Stores

### Google Play Store (Android)

1. **Préparation**
   ```bash
   # Générer l'APK signé
   eas build --platform android --profile production
   ```

2. **Upload sur Play Console**
   - Créer une nouvelle application
   - Uploader l'APK/AAB
   - Configurer les métadonnées
   - Définir les captures d'écran
   - Publier en test interne puis production

3. **Configuration Play Console**
   - Politique de confidentialité
   - Classification du contenu
   - Tarification et distribution
   - Consentement des applications

### Apple App Store (iOS)

1. **Préparation**
   ```bash
   # Générer l'IPA
   eas build --platform ios --profile production
   ```

2. **Upload sur App Store Connect**
   - Créer une nouvelle app
   - Uploader l'IPA via Transporter
   - Configurer les informations de l'app
   - Soumettre pour révision

3. **Configuration App Store Connect**
   - Métadonnées de l'app
   - Captures d'écran pour tous les appareils
   - Politique de confidentialité
   - Informations de contact

## Configuration de production

### 1. Variables d'environnement
```javascript
// app.json - Configuration production
{
  "expo": {
    "name": "BerserkerCut",
    "slug": "berserker-cut",
    "version": "1.0.0",
    "extra": {
      "firebaseApiKey": "PRODUCTION_API_KEY",
      "firebaseAuthDomain": "berserkercut-prod.firebaseapp.com",
      "firebaseProjectId": "berserkercut-prod",
      // ... autres clés de production
    }
  }
}
```

### 2. Optimisations
```javascript
// eas.json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

### 3. Sécurité
- [ ] Clés de développement supprimées
- [ ] Règles Firebase restrictives
- [ ] Logging de production désactivé
- [ ] Certificats de production configurés

## Monitoring et Analytics

### 1. Expo Analytics
```bash
# Activer les analytics
expo install expo-analytics-amplitude
```

### 2. Crash Reporting
```bash
# Sentry pour le monitoring d'erreurs
expo install @sentry/react-native
```

### 3. Performance Monitoring
```bash
# Firebase Performance
expo install @react-native-firebase/perf
```

## Mise à jour OTA (Over-The-Air)

### 1. Publication d'une mise à jour
```bash
# Mise à jour mineure
expo publish --release-channel production

# Avec message de version
expo publish --release-channel production --message "Fix critical bug"
```

### 2. Canaux de distribution
```javascript
// app.json
{
  "expo": {
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://exp.host/@username/berserker-cut"
    }
  }
}
```

## Checklist de déploiement

### Pré-déploiement
- [ ] Tests manuels complets
- [ ] Configuration Firebase production
- [ ] Variables d'environnement mises à jour
- [ ] Version incrémentée dans app.json
- [ ] Changelog mis à jour

### Builds
- [ ] Build Android sans erreur
- [ ] Build iOS sans erreur
- [ ] Tests sur appareils physiques
- [ ] Vérification des permissions
- [ ] Test de l'authentification

### Métadonnées des stores
- [ ] Titre et description optimisés
- [ ] Captures d'écran de qualité
- [ ] Icône de l'app finalisée
- [ ] Politique de confidentialité
- [ ] Catégories appropriées

### Post-déploiement
- [ ] Monitoring des erreurs activé
- [ ] Analytics configurées
- [ ] Feedback utilisateur collecté
- [ ] Plan de mise à jour défini

## Support et Maintenance

### 1. Monitoring
- Surveillance des erreurs avec Sentry
- Analytics d'usage avec Firebase
- Performance monitoring
- Feedback utilisateur

### 2. Mises à jour
- Corrections de bugs via OTA
- Nouvelles fonctionnalités via store
- Maintenance Firebase
- Mise à jour des dépendances

### 3. Support utilisateur
- Canal de support défini
- FAQ maintenue
- Gestion des avis stores
- Amélioration continue

## Environnements

### Développement
- Firebase: berserkercut-dev
- Expo: development channel
- Debug mode: activé

### Staging
- Firebase: berserkercut-staging
- Expo: staging channel
- Debug mode: désactivé

### Production
- Firebase: berserkercut-prod
- Expo: production channel
- Debug mode: désactivé
- Analytics: activées
