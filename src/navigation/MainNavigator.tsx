/**
 * Module: src/navigation/MainNavigator.tsx
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Spacing } from '@/utils/theme';
import {
  HomeStackNavigator,
  NutritionStackNavigator,
  ProfileStackNavigator,
  SettingsStackNavigator,
  TrainingStackNavigator,
  AgendaStackNavigator,
} from './StackNavigators';

const Tab = createBottomTabNavigator();
const MainStack = createStackNavigator();

const tabIcons: Record<string, string> = {
  HomeStack: '🏠',
  NutritionStack: '🥗',
  TrainingStack: '🏋️',
  AgendaStack: '📅',
  SettingsStack: '⚙️',
};

const MainTabNavigator: React.FC = () => {
  const { colors } = useThemeMode();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.primary,
            paddingBottom: Math.max(insets.bottom, Spacing.sm),
            paddingTop: Spacing.sm,
            height: 64 + Math.max(insets.bottom, Spacing.sm) + Spacing.sm,
          },
          tabBarItemStyle: {
            paddingVertical: Spacing.xs,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            lineHeight: 14,
            marginTop: 2,
          },
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 34,
                height: 34,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                backgroundColor: focused ? colors.surfaceDark : 'transparent',
                borderWidth: focused ? 1 : 0,
                borderColor: focused ? colors.border : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  lineHeight: 24,
                  color,
                  includeFontPadding: false,
                  textAlignVertical: 'center',
                }}
              >
                {tabIcons[route.name] ?? '•'}
              </Text>
            </View>
          ),
        })}
      >
        <Tab.Screen
          name="HomeStack"
          component={HomeStackNavigator}
          options={{
            tabBarLabel: 'Accueil',
            tabBarAccessibilityLabel: "Onglet Accueil",
          }}
        />
        <Tab.Screen
          name="NutritionStack"
          component={NutritionStackNavigator}
          options={{
            tabBarLabel: 'Nutrition',
            tabBarAccessibilityLabel: 'Onglet Nutrition',
          }}
        />
        <Tab.Screen
          name="TrainingStack"
          component={TrainingStackNavigator}
          options={{
            tabBarLabel: 'Entraînement',
            tabBarAccessibilityLabel: "Onglet Entraînement",
          }}
        />
        <Tab.Screen
          name="AgendaStack"
          component={AgendaStackNavigator}
          options={{
            tabBarLabel: 'Agenda',
            tabBarAccessibilityLabel: 'Onglet Agenda',
          }}
        />
        <Tab.Screen
          name="SettingsStack"
          component={SettingsStackNavigator}
          options={{
            tabBarLabel: 'Paramètres',
            tabBarAccessibilityLabel: 'Onglet Paramètres',
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

/**
 * Composant: MainNavigator
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
export const MainNavigator: React.FC = () => {
  const { colors } = useThemeMode();

  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <MainStack.Screen name="MainTabs" component={MainTabNavigator} />
      <MainStack.Screen name="ProfileStack" component={ProfileStackNavigator} />
    </MainStack.Navigator>
  );
};
