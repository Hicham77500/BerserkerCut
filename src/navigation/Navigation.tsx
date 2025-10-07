/**
 * Navigation principale de l'application
 */

import React from 'react';
import { Text, View, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthProvider, useAuth } from '../hooks/useAuth';
import { PlanProvider } from '../hooks/usePlan';
import { LoginScreen, ProfileScreen, OnboardingScreen, DashboardScreen } from '../screens';
import { ModeBadge } from '../components';

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
          paddingBottom: 20, // Augmenté pour plus d'espace avec la barre native
          paddingTop: 15,    // Augmenté pour remonter les icônes/textes
          height: 85,        // Augmenté pour compenser les paddings
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
  const isWebPlatform = Platform.OS === 'web';

  if (loading) {
    return (
      <View style={{
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#fff'
      }}>
        <Text style={{fontSize: 18, marginBottom: 20, color: '#e74c3c'}}>
          BerserkerCut
        </Text>
        <Text style={{marginBottom: 20, color: '#333'}}>
          {isWebPlatform ? 'Initialisation de la version web...' : 'Chargement de l\'application...'}
        </Text>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
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
  // Log platform info for debugging
  React.useEffect(() => {
    console.log(`Current platform: ${Platform.OS}`);
    console.log('Initializing app navigation...');
  }, []);
  
  return (
    <NavigationContainer
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#e74c3c" />
          <Text>Initialisation de la navigation...</Text>
        </View>
      }
    >
      <AuthProvider>
        <PlanProvider>
          <View style={{ flex: 1 }}>
            <AppNavigator />
            <ModeBadge />
          </View>
        </PlanProvider>
      </AuthProvider>
    </NavigationContainer>
  );
};
