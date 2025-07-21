# BerserkerCut - Deployment Guide 🚀

## Stratégie de Déploiement

Ce guide couvre le déploiement pour les deux phases du projet :
1. **Phase 1** : iOS Native (App Store)
2. **Phase 2** : PWA (Web)

---

## 📱 Phase 1 : Déploiement iOS

### Pré-requis
- Compte Apple Developer ($99/an)
- Xcode installé sur macOS
- Certificats de développement et distribution configurés
- Profils de provisioning créés

### Configuration App Store Connect

1. **Créer l'application**
   ```bash
   # Dans App Store Connect
   - Nom : BerserkerCut
   - Bundle ID : com.anonymous.BerserkerCut
   - Plateforme : iOS
   ```

2. **Métadonnées App Store**
   - Description courte et longue
   - Mots-clés : nutrition, fitness, sèche, musculation
   - Catégorie : Santé et remise en forme
   - Screenshots iPhone/iPad

### Build et Soumission

#### Development Build
```bash
# Test local
npm run ios

# Build pour simulateur
expo run:ios --device
```

#### TestFlight Build
```bash
# Build pour TestFlight
expo build:ios --type archive

# Ou avec EAS (recommandé)
npm install -g @expo/eas-cli
eas build --platform ios --profile production
```

#### Soumission App Store
```bash
# Upload via Xcode ou Transporter
# Puis soumission dans App Store Connect

# Review checklist :
- Métadonnées complètes
- Screenshots HD
- Politique de confidentialité
- Tests de fonctionnalité
```

### Configuration Firebase pour Production

```typescript
// app.json - Production Config
{
  "extra": {
    "firebaseApiKey": "AIza...", // Production key
    "firebaseAuthDomain": "berserkercut-prod.firebaseapp.com",
    "firebaseProjectId": "berserkercut-prod",
    "firebaseStorageBucket": "berserkercut-prod.appspot.com",
    "firebaseMessagingSenderId": "...",
    "firebaseAppId": "..."
  }
}
```

### Tests Pré-Publication

1. **Tests Fonctionnels**
   - Authentification (login/register)
   - Onboarding complet
   - Génération de plans
   - Sauvegarde données

2. **Tests Performance**
   - Temps de démarrage < 3s
   - 60 FPS constant
   - Utilisation mémoire optimale

3. **Tests Appareils**
   - iPhone SE (écran petit)
   - iPhone 15 Pro (écran standard)
   - iPad (si supporté)

### Monitoring Production
```typescript
// Analytics et crash reporting
- Firebase Analytics
- Firebase Crashlytics
- App Store Connect Analytics
```

---

## 🌐 Phase 2 : Déploiement PWA (Future)

### Architecture de Déploiement

```
deployment/
├── ios/           # Build iOS (Phase 1)
├── web/           # Build PWA (Phase 2)
│   ├── static/    # Assets statiques
│   ├── sw.js      # Service Worker
│   └── manifest.json
```

### Configuration PWA

#### Manifest.json
```json
{
  "name": "BerserkerCut",
  "short_name": "BerserkerCut",
  "description": "Coach personnel pour la sèche",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#FF6B35",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Service Worker
```typescript
// Service Worker pour cache et offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('berserkercut-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/manifest.json'
      ]);
    })
  );
});
```

### Plateforme de Déploiement

#### Option 1: Vercel (Recommandé)
```bash
# Installation
npm install -g vercel

# Configuration
vercel init

# Déploiement
vercel --prod
```

#### Option 2: Netlify
```bash
# Build command
npm run build:web

# Deploy directory
dist/
```

#### Option 3: Firebase Hosting
```bash
# Installation
npm install -g firebase-tools

# Configuration
firebase init hosting

# Déploiement
firebase deploy --only hosting
```

### Optimisations PWA

#### Performance
```typescript
// Webpack/Vite optimizations
- Code splitting
- Tree shaking
- Image optimization
- Gzip compression
```

#### SEO et Métadonnées
```html
<!-- Meta tags pour PWA -->
<meta name="description" content="BerserkerCut - Coach personnel pour la sèche">
<meta name="keywords" content="nutrition, fitness, sèche, musculation">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

---

## 🔄 CI/CD Pipeline (Future)

### GitHub Actions

```yaml
name: Deploy BerserkerCut

on:
  push:
    branches: [main]

jobs:
  # Phase 1: iOS Build
  ios-build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: expo build:ios
      
  # Phase 2: PWA Build
  web-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build:web
      - run: vercel --prod
```

---

## 🔐 Sécurité Déploiement

### Variables d'Environnement
```bash
# Production secrets
FIREBASE_API_KEY=***
FIREBASE_PROJECT_ID=berserkercut-prod
APPLE_TEAM_ID=***
APPLE_KEY_ID=***
```

### Monitoring Sécurité
- Firebase Security Rules
- App Store Review Guidelines
- HTTPS only pour PWA
- Content Security Policy

---

## 📊 Métriques et Monitoring

### iOS (App Store Connect)
- Téléchargements et installations
- Notes et avis utilisateurs
- Crashes et performances
- Utilisation des fonctionnalités

### PWA (Google Analytics + Firebase)
- Visiteurs uniques
- Temps d'engagement
- Taux de conversion
- Performance Lighthouse

---

## 🚀 Checklist de Déploiement

### Phase 1 (iOS)
- [ ] Tests complets sur appareils physiques
- [ ] Optimisations performance iOS
- [ ] Configuration Firebase production
- [ ] Métadonnées App Store complètes
- [ ] Screenshots et assets
- [ ] TestFlight beta testing
- [ ] Soumission App Store Review
- [ ] Monitoring post-lancement

### Phase 2 (PWA)
- [ ] Refactoring architecture partagée
- [ ] Build PWA optimisé
- [ ] Service Workers configurés
- [ ] Tests cross-browser
- [ ] Optimisations Lighthouse (score > 90)
- [ ] Déploiement production
- [ ] Monitoring web analytics

---

Ce guide sera mis à jour selon l'avancement des phases de développement.
