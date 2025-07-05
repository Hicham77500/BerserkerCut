# 🔧 Activation Firebase - Instructions Rapides

## Étapes à suivre pour activer Firebase

### 1. Créer le projet Firebase
- Allez sur https://console.firebase.google.com/
- Créez un projet nommé "BerserkerCut"

### 2. Configurer Authentication
- Authentication → Sign-in method → Activez "Email/Password"

### 3. Configurer Firestore
- Firestore Database → Créer une base de données → Mode "Test"

### 4. Récupérer les clés
Après création du projet, allez dans **Project Settings** → **General** → **Your apps** → **Web**

Vous obtiendrez quelque chose comme :
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnop",
  authDomain: "berserkercut-12345.firebaseapp.com",
  projectId: "berserkercut-12345",
  storageBucket: "berserkercut-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

### 5. Mettre à jour app.json
Remplacez les valeurs dans `app.json` :

```json
{
  "expo": {
    "extra": {
      "firebaseApiKey": "AIzaSyC1234567890abcdefghijklmnop",
      "firebaseAuthDomain": "berserkercut-12345.firebaseapp.com",
      "firebaseProjectId": "berserkercut-12345",
      "firebaseStorageBucket": "berserkercut-12345.appspot.com",
      "firebaseMessagingSenderId": "123456789012",
      "firebaseAppId": "1:123456789012:web:abcdef123456789"
    }
  }
}
```

### 6. Activer Firebase dans le code
Dans `src/services/auth.ts`, changez :
```typescript
const USE_DEMO_MODE = false; // Changez de true à false
```

### 7. Redémarrer l'application
```bash
npm start
```

### 8. Tester
- Créez un compte avec votre email
- Testez la connexion/déconnexion
- Vérifiez dans Firebase Console que les utilisateurs apparaissent

## Règles Firestore de sécurité

Copiez ces règles dans Firestore Database → Règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /dailyPlans/{planId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Dépannage

Si erreurs :
1. Vérifiez que les clés sont bien copiées
2. Redémarrez `npm start`
3. Vérifiez la console Firebase pour les erreurs
4. Assurez-vous que l'authentification Email/Password est activée

## Support
- Documentation complète : Voir `FIREBASE_SETUP.md`
- Console Firebase : https://console.firebase.google.com/
