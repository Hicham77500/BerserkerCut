import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PlanProvider } from '@/hooks/usePlan';
import {
  LoginScreen,
  OnboardingScreen,
} from '@/screens';
import { AppToolbar } from '@/components';
import AppConfig from '@/utils/config';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Spacing } from '@/utils/theme';
import { MainNavigator } from './DrawerNavigator';

type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  MainDrawer: undefined;
};
const RootStack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const { colors } = useThemeMode();
  const isWebPlatform = Platform.OS === 'web';
  const isNewUiEnabled = AppConfig.NEW_UI_ENABLED;

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
