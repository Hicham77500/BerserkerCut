import React from 'react';
import DashboardScreen from '../DashboardScreen';

/**
 * Wrapper pour accéder à l'ancienne interface sans casser la navigation.
 */
const LegacyHomeScreen: React.FC = () => {
  return <DashboardScreen />;
};

export default LegacyHomeScreen;
