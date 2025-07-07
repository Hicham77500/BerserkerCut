# 🔧 Guide de Dépannage - Configuration Firebase

## ❌ Problème Rencontré

L'erreur suivante indique que Firebase n'est pas correctement configuré :

```
WARN  @firebase/firestore: WebChannelConnection RPC 'Listen' stream transport errored
ERROR Erreur lors de la sauvegarde du profil d'entraînement: [FirebaseError: Failed to get document because the client is offline.]
```

## ✅ Solutions Implémentées

### 1. **Mode Demo Automatique**
L'application bascule automatiquement en **mode développement** quand Firebase n'est pas disponible :
- ✅ Sauvegarde locale avec AsyncStorage
- ✅ Interface utilisateur adaptée
- ✅ Messages informatifs pour l'utilisateur
- ✅ Aucune perte de données

### 2. **Configuration Intelligente**
Le système détecte automatiquement le mode optimal :
- 🔧 **Mode Demo** : Configuration Firebase invalide ou manquante
- ☁️ **Mode Firebase** : Configuration valide et connexion disponible

## 🛠️ Configuration Firebase (Production)

Pour utiliser Firebase en production, suivez ces étapes :

### Étape 1 : Créer un Projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquer sur "Ajouter un projet"
3. Nommer votre projet (ex: "berserkercut-prod")
4. Configurer Google Analytics (optionnel)

### Étape 2 : Configurer l'Application Web

1. Dans votre projet Firebase, cliquer sur l'icône Web `</>`
2. Nommer votre app (ex: "BerserkerCut")
3. Copier la configuration JavaScript

### Étape 3 : Mettre à Jour la Configuration

Remplacer les valeurs dans `app.json` :

```json
{
  "expo": {
    "extra": {
      "firebaseApiKey": "VOTRE_VRAIE_API_KEY",
      "firebaseAuthDomain": "votre-projet.firebaseapp.com",
      "firebaseProjectId": "votre-projet-id",
      "firebaseStorageBucket": "votre-projet.appspot.com",
      "firebaseMessagingSenderId": "123456789",
      "firebaseAppId": "1:123456789:web:abcdef123456"
    }
  }
}
```

### Étape 4 : Configurer Firestore

1. Dans Firebase Console → Firestore Database
2. Cliquer "Créer une base de données"
3. Choisir le mode **Test** pour commencer
4. Sélectionner une région proche

### Étape 5 : Configurer l'Authentification

1. Dans Firebase Console → Authentication
2. Onglet "Sign-in method"
3. Activer "Email/Password"

### Étape 6 : Règles de Sécurité Firestore

Remplacer les règles par défaut dans `firestore.rules` :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs authentifiés
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🔄 Basculer vers Firebase

Pour activer Firebase une fois configuré :

1. Mettre à jour `src/utils/config.ts` :
```typescript
export const AppConfig = {
  DEMO_MODE: false,        // Passer à false
  FIREBASE_ENABLED: true,  // Passer à true
  // ...
};
```

2. Redémarrer l'application Expo

## 🧪 Test de la Configuration

Utiliser ces fonctions pour tester :

```typescript
import { checkFirebaseConnection, getCurrentMode } from '../services/trainingService';

// Vérifier le mode actuel
console.log('Mode actuel:', getCurrentMode());

// Tester la connexion Firebase
checkFirebaseConnection().then(connected => {
  console.log('Firebase connecté:', connected);
});
```

## 📱 Mode Demo - Fonctionnalités

En mode demo, l'application :

✅ **Sauvegarde locale** : Données stockées avec AsyncStorage  
✅ **Interface adaptée** : Messages informatifs pour l'utilisateur  
✅ **Persistance** : Les données survivent aux redémarrages  
✅ **Validation** : Même validation que le mode Firebase  
✅ **Performance** : Pas de délai réseau  

## 🔍 Vérification du Status

L'interface affiche automatiquement :
- 🔧 "Mode développement activé" en haut de l'écran
- 💾 "Sauvegarder (Local)" sur le bouton
- ℹ️ "Vos données sont stockées localement" dans les messages

## ⚡ Avantages du Mode Demo

1. **Développement rapide** : Pas besoin de configuration Firebase pour tester
2. **Hors ligne** : Fonctionne sans connexion internet
3. **Données persistantes** : Sauvegarde locale fiable
4. **Interface identique** : Même UX que le mode production

## 🚨 Limitations du Mode Demo

- ❌ Pas de synchronisation cloud
- ❌ Données liées à l'appareil uniquement
- ❌ Pas de partage entre utilisateurs
- ❌ Pas de sauvegarde automatique externe

## 🔄 Migration Demo → Firebase

Pour migrer les données demo vers Firebase :

1. Configurer Firebase correctement
2. Les données locales restent disponibles
3. Au prochain login, les données peuvent être synchronisées
4. Implémenter une fonction de migration si nécessaire

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifier la console Expo pour les erreurs
2. Tester `getCurrentMode()` pour connaître le mode actuel
3. Vérifier la configuration dans `app.json`
4. S'assurer que les règles Firestore sont correctes

Le mode demo garantit que votre application fonctionne **toujours**, même sans Firebase configuré ! 🚀
