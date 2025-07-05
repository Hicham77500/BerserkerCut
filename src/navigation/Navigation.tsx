/**
 * Navigation principale de l'application
 */

import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from '../hooks/useAuth';
import { PlanProvider } from '../hooks/usePlan';
import { LoginScreen, OnboardingScreen, ProfileScreen } from '../screens';
import { DashboardScreen } from '../screens/DashboardScreenFixed';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Navigation des onglets principaux
 */
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#ecf0f1',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Navigation conditionnelle basée sur l'état d'authentification
 */
const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Ou un écran de chargement
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Utilisateur connecté
        user.profile.name ? (
          // Profil configuré
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          // Profil non configuré
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )
      ) : (
        // Utilisateur non connecté
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

/**
 * Navigation racine avec providers
 */
export const Navigation: React.FC = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <PlanProvider>
          <AppNavigator />
        </PlanProvider>
      </AuthProvider>
    </NavigationContainer>
  );
};
