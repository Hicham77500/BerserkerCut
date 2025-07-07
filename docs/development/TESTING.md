# 🧪 Tests Manuel pour BerserkerCut

## Checklist de Test

### ✅ Configuration Initiale
- [ ] Le projet compile sans erreur avec `npx tsc --noEmit`
- [ ] L'application démarre avec `npm start`
- [ ] Aucune erreur dans les logs de la console

### ✅ Authentification
- [ ] Écran de connexion s'affiche correctement
- [ ] Possibilité de basculer entre connexion et inscription
- [ ] Validation des champs (email, mot de passe)
- [ ] Messages d'erreur appropriés pour les champs invalides
- [ ] Création de compte fonctionnelle
- [ ] Connexion avec un compte existant
- [ ] Déconnexion depuis le profil

### ✅ Onboarding
- [ ] L'onboarding s'affiche après la première connexion
- [ ] Navigation entre les étapes (précédent/suivant)
- [ ] Validation des étapes (impossible de passer sans remplir)
- [ ] Barre de progression mise à jour
- [ ] Formulaire d'informations personnelles
- [ ] Sélection du genre et objectif
- [ ] Choix du niveau d'activité
- [ ] Sélection des jours d'entraînement
- [ ] Choix des suppléments disponibles
- [ ] Sauvegarde du profil en base

### ✅ Dashboard
- [ ] Chargement du dashboard après onboarding
- [ ] Affichage des informations personnalisées (nom, date)
- [ ] Badge du type de jour (entraînement/repos)
- [ ] Conseil du jour affiché
- [ ] Résumé nutritionnel avec macros
- [ ] Liste des repas avec détails
- [ ] Section suppléments par créneaux horaires
- [ ] Possibilité de marquer les suppléments comme pris
- [ ] Refresh du plan avec pull-to-refresh
- [ ] Génération automatique d'un nouveau plan si inexistant

### ✅ Profil
- [ ] Affichage des informations personnelles
- [ ] Affichage des jours d'entraînement configurés
- [ ] Affichage des suppléments disponibles
- [ ] Bouton de déconnexion fonctionnel
- [ ] Confirmation avant déconnexion

### ✅ Navigation
- [ ] Navigation entre les onglets (Dashboard/Profil)
- [ ] Icônes des onglets visibles
- [ ] Couleurs actives/inactives
- [ ] Pas de crash lors de la navigation

### ✅ Logique Métier
- [ ] Calcul correct des calories selon le profil
- [ ] Adaptation des macros selon l'objectif
- [ ] Plans différents les jours d'entraînement vs repos
- [ ] Suppléments adaptés selon le contexte
- [ ] Timing des suppléments cohérent avec l'entraînement

### ✅ Données et Persistence
- [ ] Sauvegarde du profil utilisateur
- [ ] Génération et sauvegarde des plans quotidiens
- [ ] Persistance des suppléments marqués comme pris
- [ ] Synchronisation correcte avec Firebase

### ✅ UI/UX
- [ ] Interface responsive sur différentes tailles d'écran
- [ ] Animations fluides lors de la navigation
- [ ] Feedback visuel lors des actions (loading, success, error)
- [ ] Couleurs cohérentes avec le thème
- [ ] Textes lisibles et bien contrastés
- [ ] Espacement et alignement corrects

### ✅ Gestion d'Erreurs
- [ ] Messages d'erreur clairs pour les problèmes réseau
- [ ] Gestion des erreurs Firebase (auth, firestore)
- [ ] Boutons de retry fonctionnels
- [ ] Pas de crash de l'application en cas d'erreur
- [ ] Logs d'erreur dans la console pour le debug

## 🔥 Scenarios de Test Avancés

### Scenario 1: Nouvel Utilisateur
1. Lancer l'app
2. Créer un nouveau compte
3. Compléter l'onboarding
4. Vérifier la génération du premier plan
5. Marquer des suppléments comme pris
6. Se déconnecter et se reconnecter
7. Vérifier la persistance des données

### Scenario 2: Différents Types de Jours
1. Configurer des jours d'entraînement spécifiques
2. Générer des plans pour un jour d'entraînement
3. Générer des plans pour un jour de repos
4. Comparer les différences (calories, suppléments)

### Scenario 3: Différents Objectifs
1. Tester avec objectif "sèche"
2. Tester avec objectif "recomposition"
3. Comparer les plans générés
4. Vérifier l'adaptation des macros

### Scenario 4: Edge Cases
1. Tester avec 0 jours d'entraînement
2. Tester avec 7 jours d'entraînement
3. Tester sans suppléments
4. Tester avec tous les suppléments
5. Tester avec des valeurs extrêmes (poids, taille, âge)

## 🐛 Bugs Connus à Vérifier

- [ ] Gestion des jours de la semaine (dimanche = 0)
- [ ] Calcul des macros avec des valeurs décimales
- [ ] Affichage des emojis sur tous les appareils
- [ ] Performance avec de nombreux suppléments
- [ ] Synchronisation des données en temps réel

## 📝 Notes de Test

Utilisez cet espace pour noter les problèmes trouvés :

```
Date: 
Problème: 
Steps to reproduce: 
Expected: 
Actual: 
Priority: 
```

## ✅ Validation Finale

- [ ] Tous les tests passent
- [ ] Aucun crash pendant 30 minutes d'utilisation
- [ ] Performance acceptable sur appareil test
- [ ] Prêt pour les tests utilisateur
