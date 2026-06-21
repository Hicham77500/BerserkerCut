/**
 * Module: src/screens/home/LegacyHomeScreen.tsx
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import React from 'react';
import DashboardScreen from '../DashboardScreen';

/**
 * Wrapper pour accéder à l'ancienne interface sans casser la navigation.
 */
const LegacyHomeScreen: React.FC = () => {
  return <DashboardScreen />;
};

export default LegacyHomeScreen;
