# Configuration Firebase pour BerserkerCut

## 1. Créer un projet Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Créer un nouveau projet "BerserkerCut"
3. Activer Google Analytics (optionnel)

## 2. Activer l'authentification

1. Aller dans "Authentication" > "Sign-in method"
2. Activer "Email/Password"
3. Configurer les domaines autorisés

## 3. Configurer Firestore

1. Aller dans "Firestore Database"
2. Créer une base de données
3. Choisir le mode "Production" (avec les règles de sécurité)
4. Sélectionner la région (europe-west1 pour l'Europe)

## 4. Déployer les règles de sécurité

Copiez le contenu du fichier `firestore.rules` dans l'onglet "Règles" de Firestore.

## 5. Récupérer les clés de configuration

1. Aller dans "Project Settings" > "General"
2. Faire défiler jusqu'à "Your apps"
3. Cliquer sur "Add app" > "Web"
4. Enregistrer l'app avec le nom "BerserkerCut"
5. Copier les clés de configuration

## 6. Mettre à jour app.json

Remplacer les valeurs dans la section `extra` du fichier `app.json` :

```json
{
  "expo": {
    "extra": {
      "firebaseApiKey": "VOTRE_API_KEY",
      "firebaseAuthDomain": "VOTRE_PROJECT_ID.firebaseapp.com",
      "firebaseProjectId": "VOTRE_PROJECT_ID",
      "firebaseStorageBucket": "VOTRE_PROJECT_ID.appspot.com",
      "firebaseMessagingSenderId": "VOTRE_SENDER_ID",
      "firebaseAppId": "VOTRE_APP_ID"
    }
  }
}
```

## 7. Structure des collections Firestore

### Collection `users`
```typescript
{
  id: string (document ID = userId)
  email: string
  profile: {
    name: string
    weight: number
    height: number
    age: number
    gender: 'male' | 'female'
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
    objective: 'cutting' | 'recomposition' | 'maintenance'
    trainingDays: Array<{
      dayOfWeek: number
      type: 'strength' | 'cardio' | 'mixed' | 'rest'
      timeSlot: 'morning' | 'afternoon' | 'evening'
      duration: number
    }>
    availableSupplements: Array<{
      id: string
      name: string
      type: string
      dosage: string
      timing: string
      available: boolean
    }>
    allergies: string[]
    foodPreferences: string[]
  }
  createdAt: string (ISO date)
  updatedAt: string (ISO date)
}
```

### Collection `dailyPlans`
```typescript
{
  id: string (format: {userId}_{YYYY-MM-DD})
  userId: string
  date: string (ISO date)
  dayType: 'training' | 'rest' | 'cheat'
  nutritionPlan: { ... }
  supplementPlan: { ... }
  dailyTip: string
  completed: boolean
  createdAt: string (ISO date)
}
```

## 8. Test de la configuration

Une fois la configuration terminée, vous pouvez tester :

1. Lancer l'app avec `npm start`
2. Créer un compte utilisateur
3. Compléter l'onboarding
4. Vérifier que les données sont bien sauvegardées dans Firestore

## 9. Sécurité

Les règles de sécurité garantissent que :
- Seuls les utilisateurs authentifiés peuvent accéder aux données
- Chaque utilisateur ne peut accéder qu'à ses propres données
- Les plans quotidiens ne sont accessibles que par leur propriétaire

## 10. Débogage

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans la console Firebase
2. Assurez-vous que les règles de sécurité sont correctement déployées
3. Vérifiez que les clés de configuration sont correctes
4. Consultez les erreurs dans la console de développement Expo
