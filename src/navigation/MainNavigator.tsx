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
          tabBarActiveTintColor: colors.primaryLight,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, Spacing.sm),
            paddingTop: Spacing.xs,
            height: 56 + Math.max(insets.bottom, Spacing.sm) + Spacing.xs,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                padding: 6,
                borderRadius: 16,
                backgroundColor: focused ? colors.secondaryLight : 'transparent',
              }}
            >
              <Text style={{ fontSize: 20, color }}>{tabIcons[route.name] ?? '•'}</Text>
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
