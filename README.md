# BerserkerCut 🔥

Une application iOS native (React Native + Expo) pour générer des plans nutrition/suppléments personnalisés pendant une phase de sèche.

## 🎯 Objectifs

BerserkerCut calcule et délivre quotidiennement :
- un plan nutritionnel individualisé (calories, macros, repas)
- un protocole de suppléments avec timing intelligent
- des conseils contextualisés en fonction du jour (entraînement vs repos)

Le calcul du métabolisme, de l'IMC, des macros et des plans repas est effectué **localement** dans l'application : aucune IA n'est sollicitée pour les formules déterministes.

## 🚀 Fonctionnalités clés

- Authentification email/mot de passe via API Node/MongoDB
- Onboarding multi-étapes (données santé, entrainement, suppléments)
- Génération quotidienne des plans (algorithmes internes)
- Mode démo hors ligne (données stockées en AsyncStorage)
- Interface iOS moderne (Expo + React Navigation)

## 📦 Stack technique

| Couche | Technologies |
| --- | --- |
| Interface | React Native, Expo, React Navigation |
| Services | AuthService, PlanService, TrainingService (REST) |
| Backend (attendu) | Node.js / Express + MongoDB Atlas (ou cluster self-hosted) |
| Stockage local | AsyncStorage (mode démo) |
| Langage | TypeScript end-to-end |

> L’application mobile **n’accède jamais à MongoDB directement** : un backend REST sécurisé est requis (JWT recommandé). Le dépôt fourni correspond à l’application cliente Expo.

## 🏗️ Architecture

```
src/
├── components/     # UI réutilisable
├── hooks/          # AuthProvider, PlanProvider…
├── navigation/     # Routes & stacks
├── screens/        # Écrans principaux
├── services/       # AuthService, PlanService, apiClient, demo services
├── types/          # Modèles TypeScript (User, DailyPlan…)
└── utils/          # Configuration, debug helpers, thèmes
```

Documentation détaillée : `docs/ARCHITECTURE.md`.

## 🔧 Installation & configuration

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd BerserkerCut
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer l’API backend (MongoDB)**
   - Un serveur Express prêt à l'emploi est disponible dans `backend/`.
   - Étapes de démarrage :
     ```bash
     cd backend
     cp .env.example .env             # renseigner MONGODB_URI + JWT_SECRET
     npm install
     npm run dev                      # ou npm start pour la prod
     ```
   - Variables clés :
     - `MONGODB_URI` → connexion Atlas (`mongodb+srv://adminH:...@cluster0...`)
     - `JWT_SECRET` → secret de signature des tokens
     - `CORS_ORIGIN` → origines front autorisées (`http://localhost:19006` pour Expo)
   - Endpoints couverts :
     - `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
     - `GET /users/:id`, `PATCH /users/:id/profile`
     - `PUT /users/:id/training-profile`, `GET /users/:id/training-profile`
     - `PUT /plans/:planId`, `GET /plans/today?userId=`, `POST /plans/:planId/supplements/:supplementId/taken`

4. **Variables d’environnement Expo** (`.env`)
   ```bash
   EXPO_PUBLIC_API_BASE_URL=http://localhost:4000   # backend local
   # EXPO_PUBLIC_API_BASE_URL=https://api.berserkercut.com   # backend prod
   EXPO_PUBLIC_FORCE_DEMO_MODE=false  # true pour travailler 100% hors ligne
   ```
   Option alternative : renseigner `expo.extra.apiBaseUrl` dans `app.json`.

5. **Lancer l’app**
   ```bash
   npm start          # Expo dev client / Expo Go
   npm run ios        # build + lancement simulateur iOS
   npm run android    # build + lancement émulateur Android
   ```

## ☁️ Backend MongoDB – recommandations

- **Schema utilisateur** :
  ```json
  {
    "_id": "ObjectId",
    "email": "string",
    "hashedPassword": "string",
    "profile": { /* voir src/types */ },
    "createdAt": "ISO string",
    "updatedAt": "ISO string"
  }
  ```
- **Sécurité** :
  - Stocker les mots de passe hashés (bcrypt/argon2).
  - Retourner uniquement les champs nécessaires au client.
  - Protéger les routes avec un middleware JWT (Authorization: Bearer).
- **Plans quotidiens** : collection `daily_plans` indexée sur `{ userId, date }`.
- **IA & données sensibles** : seules les données nécessaires à l’IA doivent transiter. Par défaut, l’app n’envoie **aucune** donnée à un LLM ; prévoyez un microservice séparé si vous automatisez des recommandations IA. Garder BMI, macros, etc., dans le périmètre deterministic côté client.

## ♻️ Modes de fonctionnement

| Mode | Activation | Persistance |
| --- | --- | --- |
| `cloud` | `EXPO_PUBLIC_API_BASE_URL` défini & backend disponible | API REST → MongoDB |
| `demo`  | `EXPO_PUBLIC_FORCE_DEMO_MODE=true` ou aucun backend configuré | AsyncStorage (local device) |

Les services `DemoAuthService`, `DemoPlanService`, `saveTrainingProfile` (AsyncStorage) garantissent une expérience complète sans réseau.

## 🧠 Logique métier

- **Calculs énergétiques** : formule Harris-Benedict révisée, ajustements objectif + jour d’entraînement.
- **Répartition macros** : protéines (1.8–2.2 g/kg), lipides (25–30%), glucides = reste.
- **Plans repas** : base d’aliments typés (petit-déj/déjeuner/dîner/collation), quantités calculées proportionnellement.
- **Suppléments** : tri par `type` et `timing`; marquage « pris » via API.
- **Aucune IA n’est utilisée pour les calculs déterministes**. Les agents/LLM éventuels doivent être branchés depuis le backend et ne doivent recevoir que les données strictement nécessaires (ex : objectif, disponibilité de suppléments). 

## 🔒 Sécurité & conformité

- Sessions JWT stockées dans AsyncStorage (client) + Authorization header automatique (`apiClient`).
- Nettoyage complet des sessions côté client (`clearSession`).
- Validation stricte des entrées (`validateTrainingProfile`, vérifications côté backend requises).
- Pas de données médicales sensibles envoyées sans consentement explicite.

## 📊 État du projet

| Avancement | Détails |
| --- | --- |
| ✅ Architecture mobile | Hooks, services, logique métier, mode démo |
| ✅ Migration MongoDB | Suppression Firebase, nouveau client HTTP, stockage session |
| 🔄 Backend à déployer | Doit être développé/déployé (Node/Mongo) pour activer le mode cloud |
| 🔜 QA & tests | Tests automatisés + validation fonctionnelle à planifier |

## 🧭 Feuille de route courte

1. Déployer l’API Node/Mongo (auth + plans) et sécuriser les endpoints.
2. Connecter l’app Expo en mode `cloud` (vérifier `apiClient.baseUrl`).
3. Ajouter des tests (unitaires/services) + instrumentation monitoring.
4. Préparer le packaging TestFlight / Play Store.

## 🧩 Ressources utiles

- `docs/ARCHITECTURE.md` – flux détaillés (auth, plans, mode démo).
- `src/services/apiClient.ts` – configuration HTTP + auth automatique.
- `src/services/sessionStorage.ts` – gestion token/utilisateur.
- `src/utils/debug.ts` – diagnostics (`quickDiagnose()` en dev console).

---

> Besoin d’étendre la logique (agents IA, analytics) ? Ajoutez un microservice dédié côté backend pour filtre/prétraiter les données avant appel LLM. Gardez dans l’app mobile uniquement les calculs déterministes (IMC, calories, macros) et l’UX. EOF
