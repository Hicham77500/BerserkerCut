# Recap Design Technique - BerserkerCut

Date: 2026-06-21
Scope: UX produit, architecture d'interaction, coherence strategico-fonctionnelle
Base d'analyse: navigation, ecrans, hooks metiers, contexte projet

## 1) Positionnement Produit

BerserkerCut est une application mobile iOS-first de coaching nutrition et entrainement pour phase de seche, avec architecture hybride cloud/demo mode.

Objectif primaire actuel:
- Piloter un plan quotidien nutrition + supplementation
- Suivre execution des repas et prise des supplements
- Aligner la planification entrainement selon profil utilisateur
- Orchestrer des rappels locaux (notifications + agenda)

Objectif cible evolutif:
- Ajouter un coach IA local on-device specialise nutrition, entrainement, et lecture contextuelle du bien-etre mental.

## 2) Modele d'Experience Utilisateur

Le design actuel suit un paradigme de boucle quotidienne:

Acquisition profil -> Generation plan journalier -> Execution terrain -> Feedback utilisateur -> Ajustement plan.

Ce modele est coherent avec un produit de comportement/adhesion, car il structure l'interaction autour d'une routine et non d'un usage ponctuel.

## 3) Cartographie Fonctionnelle

### 3.1 Domaines fonctionnels

- Authentification et consentement
  - Connexion/inscription
  - Mode demo consent-first
  - Consentement cloud RGPD

- Onboarding et profilage
  - Infos identitaires minimales
  - Donnees sante (poids, taille, age, niveau activite, sommeil)
  - Preferences entrainement hebdomadaires
  - Preferences supplementation

- Suivi nutrition
  - Objectifs calories/macros
  - Edition repas (contenu, horaire)
  - Capture photo repas et galerie locale
  - Ajustement dynamique des objectifs nutritionnels

- Suivi entrainement
  - Seance du jour
  - Planning hebdomadaire derive du profil
  - Lien direct vers parametrage entrainement

- Notifications et agenda
  - Rappels journaliers (matin/soir)
  - Notification de test
  - Reset rappels
  - Evenements calendrier (via agenda screen)

- Parametrage systeme
  - Theme clair/sombre persistant
  - Confidentialite
  - Notifications

## 4) Schema Parcours Utilisateur (Inscription -> Regime -> Tracking)

Schema textuel de reference:

1. Landing Auth
2. Choix inscription ou connexion
3. Consentement eventuel mode demo (si active)
4. Onboarding step 1: identite + objectif
5. Onboarding step 2: profil sante
6. Onboarding step 3: profil entrainement
7. Onboarding step 4: profil supplementation
8. Creation profil final
9. Generation plan quotidien
10. Dashboard: vue pilotage du jour
11. Nutrition: edition repas/objectifs + suivi
12. Training: verification execution seance
13. Settings: rappels/permissions/theme
14. Boucle quotidienne de reevaluation

## 5) Schema d'Architecture d'Interaction

Niveau presentation:
- Root Navigation conditionnelle (auth state)
- MainTabs: Accueil, Nutrition, Entrainement, Agenda, Parametres
- ProfileStack interne hors tab visible

Niveau orchestration:
- useAuth: session, profil, consentement
- usePlan: plan du jour, updates optimistes, progression supplements
- useNotifications: permission gating et scheduling

Niveau services:
- AuthService / DemoAuthService
- PlanService
- Photo services
- Notification utilities
- Stockage local AsyncStorage + SecureStore

## 6) Evaluation de Coherence avec l'Objectif Principal

Objectif principal rappele:
- Aider l'utilisateur a tracker aliments + entrainements + rappels.

Verdict coherence actuelle: ELEVE

Justification:
- Tracking aliments: robuste (meal edit, objectifs macros/calories, photos repas).
- Tracking entrainement: present (seance du jour + planning hebdo).
- Rappels: present (notifications programmables + agenda).
- Boucle comportementale: claire (dashboard vers actions critiques du jour).

Points a renforcer:
- Correlation explicite nutrition <-> entrainement au niveau scoring adherence.
- Journal d'auto-perception mentale pour enrichir recommandations futures.
- Instrumentation analytique locale de l'adhesion (compliance nutrition/entrainement/sommeil).

## 7) Readiness pour Coach IA Local On-Device

Le socle applicatif est favorable a une integration LLM locale, sous reserve d'une couche d'orchestration supplementaire.

### 7.1 Capacites deja en place utiles pour IA

- Donnees structurees de profil sante et training
- Historique d'execution nutrition/supplements
- Triggers temporels via notifications/agenda
- Consentement et segmentation cloud/local

### 7.2 Capacites manquantes pour IA coaching psy/mental

- Signal mental explicite (humeur, stress, motivation, fatigue mentale)
- Taxonomie d'etat psycho-physiologique exploitable en inference
- Politique de garde-fous pour recommandations sensibles
- Escalade de securite en cas de signaux de detresse

### 7.3 Proposition d'architecture IA locale minimale

- Couche Local Coach Runtime (on-device)
  - Moteur LLM compact quantized
  - Prompt templates specialises nutrition/training/recovery
  - Policy engine de securite

- Couche Feature Extraction
  - Agregation quotidienne des signaux app
  - Features derivees: adherence score, charge percue, regularite sommeil

- Couche Dialogue + Action
  - Chat coach contextualise
  - Suggestions actionnables reliees aux ecrans existants
  - Journal de recommandations et suivi d'impact

## 8) Recommandations Design Produit (Prioritees)

P1 - Consolider la boucle de tracking
- Ajouter un score d'adherence quotidien unique (nutrition + training + supplements).
- Afficher tendance sur 7 jours dans Dashboard.

P1 - Preparer le terrain IA
- Introduire check-in mental quotidien en 15 secondes (humeur, stress, energie).
- Stockage local par defaut avec consentement explicite.

P2 - Renforcer l'explicabilite
- Exposer pourquoi une recommandation est faite (macro gap, seance prevue, sommeil faible).

P2 - UX decisionnelle
- CTA contextuels en Home: "Corriger mes macros", "Adapter ma seance", "Reporter rappel".

P3 - Securite IA
- Ajouter politiques de reponse: no diagnostic medical, no advice hors perimetre.
- Routage vers aide humaine si detresse psychologique detectee.

## 9) Checklist de Coherence Produit

- Le parcours d'onboarding collecte les signaux necessaires au plan initial: OUI
- Les surfaces de tracking quotidien sont accessibles en moins de 2 interactions: OUI
- Les rappels ont un point de controle utilisateur centralise: OUI
- Le mode demo respecte un mecanisme de consentement explicite: OUI
- Le socle de donnees est suffisant pour un coach IA local v1: PARTIEL

## 10) Plan de Capture Recommande

Place les captures dans captures-app-design selon l'ordre de parcours:

- Auth: login + inscription + demo toggle
- Onboarding: 4 etapes completes
- Dashboard journalier
- Nutrition screen + modal edition repas + modal objectifs
- Training screen
- Agenda screen
- System settings notifications
- Profile health + privacy

## 11) Conclusion Technique

BerserkerCut presente une architecture d'experience mature pour le tracking nutrition/entrainement, avec une cohesion forte entre navigation, orchestration metier et surfaces d'action quotidiennes.

La trajectoire vers un coach IA local est realiste, a condition d'ajouter une couche de signal mental structuree, un moteur de politiques de securite, et une logique d'explicabilite des recommandations.
