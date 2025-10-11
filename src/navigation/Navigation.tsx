// Navigation racine : orchestrate les providers, l'écran de chargement et le routage auth.

// Bibliothèques React & React Native pour le rendu et les indicateurs de chargement.
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  View,
} from 'react-native';
// Conteneur principal et stack navigator issus de React Navigation.
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
// Gestion des safe areas pour harmoniser le rendu sur iOS et Android.
import { SafeAreaView } from 'react-native-safe-area-context';

// Providers et hooks métiers pour l'authentification et les plans nutritionnels.
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PlanProvider } from '@/hooks/usePlan';
// Écrans d'entrée (authentification et onboarding).
import {
  LoginScreen,
  OnboardingScreen,
} from '@/screens';
// Barre d'outils affichée globalement en haut de l'application.
import { AppToolbar } from '@/components';
// Configuration applicative (feature flags, etc.).
import AppConfig from '@/utils/config';
// Hook de thème pour synchroniser la navigation avec le mode actuel.
import { useThemeMode } from '@/hooks/useThemeMode';
// Échelle d'espacement partagée.
import { Spacing } from '@/utils/theme';
// Navigateur principal combinant Drawer + Tabs.
import { MainNavigator } from './DrawerNavigator';

// Typage des routes du stack racine : login, onboarding et application principale.
type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  MainDrawer: undefined;
};
const RootStack = createStackNavigator<RootStackParamList>();

// Composant qui gère la logique de redirection en fonction de l'état d'authentification.
const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const { colors } = useThemeMode();
  const isWebPlatform = Platform.OS === 'web';
  const isNewUiEnabled = AppConfig.NEW_UI_ENABLED;

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

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.ScaleFromCenterAndroid,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Décision de routage : login, onboarding ou drawer principal. */}
      {user ? (
        user.profile?.name && isNewUiEnabled ? (
          <RootStack.Screen name="MainDrawer" component={MainNavigator} />
        ) : user.profile?.name ? (
          <RootStack.Screen name="MainDrawer" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        )
      ) : (
        <RootStack.Screen name="Login" component={LoginScreen} />
      )}
    </RootStack.Navigator>
  );
};

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
          <PlanProvider>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
              {/* Barre d'outils persistante sur l'ensemble de l'application. */}
              <AppToolbar />
              <View style={{ flex: 1 }}>
                <AppNavigator />
              </View>
            </View>
          </PlanProvider>
        </AuthProvider>
      </NavigationContainer>
    </View>
  );
};
