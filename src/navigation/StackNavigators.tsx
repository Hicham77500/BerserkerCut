// Déclare les navigateurs de pile liés aux différentes sections de l'app.

// React requis pour déclarer des composants fonctionnels.
import React from 'react';
// Stack Navigator et presets de transitions fournis par React Navigation.
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
// Hook maison pour récupérer la palette de couleurs en fonction du thème.
import { useThemeMode } from '@/hooks/useThemeMode';

// Écrans rattachés à chaque pile (home, profil, nutrition, entraînement).
import {
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
  AgendaScreen,
} from '@/screens';

// Types pour les navigateurs de pile (définissent les routes autorisées et leurs params).
export type ProfileStackParamList = {
  Profil: undefined;
  'Profil santé': undefined;
  Objectifs: undefined;
  Entraînement: undefined;
  Suppléments: undefined;
  Photos: undefined;
  Confidentialité: undefined;
};

export type NutritionStackParamList = {
  Nutrition: undefined;
  Calendrier: undefined;
};

export type TrainingStackParamList = {
  Entraînement: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type AgendaStackParamList = {
  Agenda: undefined;
};

// Création des navigateurs typés pour assurer la sécurité des routes.
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const NutritionStack = createStackNavigator<NutritionStackParamList>();
const TrainingStack = createStackNavigator<TrainingStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const AgendaStack = createStackNavigator<AgendaStackParamList>();

/**
 * Navigateur de pile pour l'écran d'accueil
 */
export const HomeStackNavigator: React.FC = () => {
  const { colors } = useThemeMode();

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        ...TransitionPresets.SlideFromRightIOS,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <HomeStack.Screen name="Home" component={HomeDashboardScreen} options={{ title: 'Accueil' }} />
    </HomeStack.Navigator>
  );
};

/**
 * Navigateur de pile pour la section Profil
 */
export const ProfileStackNavigator: React.FC = () => {
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

/**
 * Navigateur de pile pour la section Nutrition
 */
export const NutritionStackNavigator: React.FC = () => {
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

/**
 * Navigateur de pile pour la section Entraînement
 */
export const TrainingStackNavigator: React.FC = () => {
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

export const AgendaStackNavigator: React.FC = () => {
  const { colors } = useThemeMode();

  return (
    <AgendaStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        ...TransitionPresets.SlideFromRightIOS,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <AgendaStack.Screen name="Agenda" component={AgendaScreen} />
    </AgendaStack.Navigator>
  );
};