import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PlanProvider } from '@/hooks/usePlan';
import {
  LoginScreen,
  OnboardingScreen,
  HomeDashboardScreen,
  ProfileOverviewScreen,
  ProfileHealthScreen,
  ProfileGoalsScreen,
  ProfileTrainingScreen,
  ProfileSupplementsScreen,
  ProfilePhotosScreen,
  ProfilePrivacyScreen,
  NutritionScreen,
  NutritionCalendarScreen,
  TrainingScreen,
} from '@/screens';
import { AppToolbar } from '@/components';
import AppConfig from '@/utils/config';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Spacing } from '@/utils/theme';

type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
};

type ProfileStackParamList = {
  Profil: undefined;
  'Profil santé': undefined;
  Objectifs: undefined;
  Entraînement: undefined;
  Suppléments: undefined;
  Photos: undefined;
  Confidentialité: undefined;
};

type NutritionStackParamList = {
  Nutrition: undefined;
  Calendrier: undefined;
};

type TrainingStackParamList = {
  Entraînement: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const NutritionStack = createStackNavigator<NutritionStackParamList>();
const TrainingStack = createStackNavigator<TrainingStackParamList>();

const tabIcons: Record<string, string> = {
  Home: '🏠',
  NutritionStack: '🥗',
  TrainingStack: '🏋️',
  ProfileStack: '👤',
};

const ProfileStackNavigator: React.FC = () => {
  const { colors } = useThemeMode();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        ...TransitionPresets.SlideFromRightIOS,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <ProfileStack.Screen name="Profil" component={ProfileOverviewScreen} />
      <ProfileStack.Screen name="Profil santé" component={ProfileHealthScreen} />
      <ProfileStack.Screen name="Objectifs" component={ProfileGoalsScreen} />
      <ProfileStack.Screen name="Entraînement" component={ProfileTrainingScreen} />
      <ProfileStack.Screen name="Suppléments" component={ProfileSupplementsScreen} />
      <ProfileStack.Screen name="Photos" component={ProfilePhotosScreen} />
      <ProfileStack.Screen name="Confidentialité" component={ProfilePrivacyScreen} />
    </ProfileStack.Navigator>
  );
};

const NutritionStackNavigator: React.FC = () => {
  const { colors } = useThemeMode();
  return (
    <NutritionStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        ...TransitionPresets.ModalSlideFromBottomIOS,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <NutritionStack.Screen name="Nutrition" component={NutritionScreen} />
      <NutritionStack.Screen name="Calendrier" component={NutritionCalendarScreen} />
    </NutritionStack.Navigator>
  );
};

const TrainingStackNavigator: React.FC = () => {
  const { colors } = useThemeMode();
  return (
    <TrainingStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        ...TransitionPresets.SlideFromRightIOS,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <TrainingStack.Screen name="Entraînement" component={TrainingScreen} />
    </TrainingStack.Navigator>
  );
};

const TabNavigator: React.FC = () => {
  const { colors } = useThemeMode();
  const sceneContainerStyle = useMemo(
    () => ({ backgroundColor: colors.background }),
    [colors.background],
  );
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tab.Navigator
        {...({ sceneContainerStyle } as Record<string, unknown>)}
        screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Spacing.sm,
          paddingTop: Spacing.xs,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        sceneStyle: { backgroundColor: colors.background },
        tabBarIcon: ({ color, focused }) => (
          <View
            style={{
              padding: 6,
              borderRadius: 16,
              backgroundColor: focused ? colors.secondaryLight : 'transparent',
            }}
          >
            <Text style={{ fontSize: 20, color }}>
              {tabIcons[route.name] ?? '•'}
            </Text>
          </View>
        ),
      })}
      >
        <Tab.Screen
          name="Home"
          component={HomeDashboardScreen}
          options={{ tabBarLabel: 'Accueil' }}
        />
        <Tab.Screen
          name="NutritionStack"
          component={NutritionStackNavigator}
          options={{ tabBarLabel: 'Nutrition' }}
        />
        <Tab.Screen
          name="TrainingStack"
          component={TrainingStackNavigator}
          options={{ tabBarLabel: 'Entraînement' }}
        />
        <Tab.Screen
          name="ProfileStack"
          component={ProfileStackNavigator}
          options={{ tabBarLabel: 'Profil' }}
        />
      </Tab.Navigator>
    </View>
  );
};

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
          <RootStack.Screen name="MainTabs" component={TabNavigator} />
        ) : user.profile?.name ? (
          <RootStack.Screen name="MainTabs" component={TabNavigator} />
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
