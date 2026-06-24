/**
 * Module: src/navigation/Navigation.tsx
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
// Navigation racine : orchestre le theme et affiche uniquement l'ecran de connexion.

// Bibliothèques React & React Native pour le rendu et les indicateurs de chargement.
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  View,
} from 'react-native';
// Conteneur principal de React Navigation conserve pour le theme global.
import { NavigationContainer } from '@react-navigation/native';
// Gestion des safe areas pour harmoniser le rendu sur iOS et Android.
import { SafeAreaView } from 'react-native-safe-area-context';

// Providers et hooks metiers pour l'authentification.
import { AuthProvider, useAuth } from '@/hooks/useAuth';
// Ecran d'entree principal.
import { DashboardScreen, LoginScreen } from '@/screens';
// Hook de thème pour synchroniser la navigation avec le mode actuel.
import { useThemeMode } from '@/hooks/useThemeMode';
// Échelle d'espacement partagée.
import { Spacing } from '@/utils/theme';

// Composant qui affiche l'ecran de chargement puis l'ecran de connexion.
const AppNavigator: React.FC = () => {
  const { loading, user } = useAuth();
  const { colors } = useThemeMode();
  const isWebPlatform = Platform.OS === 'web';

  // Écran de chargement global affiché tant que l'état auth n'est pas déterminé.
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 18, marginBottom: 20, color: colors.primary }}>
          BerserkerCut
        </Text>
        <Text style={{ marginBottom: 20, color: colors.text }}>
          {isWebPlatform
            ? 'Initialisation de la version web...'
            : 'Chargement de l’application...'}
        </Text>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return <DashboardScreen />;
  }

  return <LoginScreen />;
};

/**
 * Composant: Navigation
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
export const Navigation: React.FC = () => {
  const { navigationTheme, colors, ready } = useThemeMode();

  // Empêche le rendu du container tant que la palette de couleurs n'est pas prête.
  if (!ready) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: Spacing.sm }}>
          Initialisation du thème…
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer
        // Injecte le thème de navigation synchronisé avec notre design system.
        theme={navigationTheme}
        fallback={
          <SafeAreaView
            edges={['top', 'bottom']}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: colors.background,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.text }}>
              Initialisation de la navigation...
            </Text>
          </SafeAreaView>
        }
      >
        <AuthProvider>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
              <AppNavigator />
            </View>
        </AuthProvider>
      </NavigationContainer>
    </View>
  );
};
