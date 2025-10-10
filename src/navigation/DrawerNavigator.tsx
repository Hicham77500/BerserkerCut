/**
 * DrawerNavigator.tsx
 * Implémentation personnalisée d'un navigateur à tiroir latéral avec TabNavigator intégré
 * pour l'application BerserkerCut.
 */

import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeMode } from '@/hooks/useThemeMode';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Typography, Spacing, ThemePalette } from '@/utils/theme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {
  HomeStackNavigator,
  NutritionStackNavigator,
  ProfileStackNavigator,
  TrainingStackNavigator,
} from './StackNavigators';

type DrawerItem = {
  key: string;
  label: string;
  onPress: () => void;
  icon?: string;
  screen?: string;
  stack?: string;
};

interface DrawerContentProps {
  closeDrawer: () => void;
}

// Crée un navigateur à onglets
const Tab = createBottomTabNavigator();

// Composant pour le contenu du tiroir latéral
const DrawerContent: React.FC<DrawerContentProps> = ({ closeDrawer }) => {
  const navigation = useNavigation<any>();
  const { colors } = useThemeMode();
  const { logout, user } = useAuth();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const navigateTo = useCallback(
    (stack: string, screen?: string) => {
      closeDrawer();
      if (screen) {
        navigation.navigate(stack, { screen });
      } else {
        navigation.navigate(stack);
      }
    },
    [closeDrawer, navigation],
  );

  const handleLogout = useCallback(async () => {
    closeDrawer();
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  }, [closeDrawer, logout]);

  const drawerItems: DrawerItem[] = [
    {
      key: 'home',
      label: 'Accueil',
      icon: '🏠',
      onPress: () => navigateTo('HomeStack'),
    },
    {
      key: 'nutrition',
      label: 'Nutrition',
      icon: '🥗',
      onPress: () => navigateTo('NutritionStack'),
    },
    {
      key: 'training',
      label: 'Entraînement',
      icon: '🏋️',
      onPress: () => navigateTo('TrainingStack'),
    },
    {
      key: 'profile',
      label: 'Profil',
      icon: '👤',
      onPress: () => navigateTo('ProfileStack', 'Profil'),
    },
    {
      key: 'privacy',
      label: 'Confidentialité',
      icon: '🔒',
      onPress: () => navigateTo('ProfileStack', 'Confidentialité'),
    },
    {
      key: 'settings',
      label: 'Paramètres',
      icon: '⚙️',
      onPress: () => navigateTo('ProfileStack', 'Profil'),
    },
    {
      key: 'logout',
      label: 'Déconnexion',
      icon: '🚪',
      onPress: handleLogout,
    },
  ];

  const userName = user?.profile?.name || user?.email?.split('@')[0] || 'Viking';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BerserkerCut</Text>
        <Text style={styles.headerSubtitle}>Bonjour, {userName}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={styles.menuItems}>
          {drawerItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              {item.icon && <Text style={styles.menuItemIcon}>{item.icon}</Text>}
              <Text style={styles.menuItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.4</Text>
      </View>
    </SafeAreaView>
  );
};

interface DrawerNavigatorProps {
  children: React.ReactNode;
}

export const DrawerNavigator: React.FC<DrawerNavigatorProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const translateX = React.useRef(new Animated.Value(-300)).current;

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  const closeDrawer = useCallback(() => {
    Animated.spring(translateX, {
      toValue: -300,
      useNativeDriver: true,
    }).start(() => {
      setDrawerOpen(false);
    });
  }, [translateX]);

  React.useEffect(() => {
    // Expose le drawer à la navigation globale de façon sécurisée
    if (typeof global !== 'undefined') {
      if (!global.navigation) {
        global.navigation = {};
      }
      global.navigation.openDrawer = openDrawer;
      global.navigation.closeDrawer = closeDrawer;
    }
    
    return () => {
      if (typeof global !== 'undefined' && global.navigation) {
        global.navigation.openDrawer = undefined;
        global.navigation.closeDrawer = undefined;
      }
    };
  }, [openDrawer, closeDrawer]);

  const drawerWidth = 280;
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.navigatorContainer}>
      {drawerOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      )}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            transform: [{ translateX }],
          },
        ]}
      >
        <DrawerContent closeDrawer={closeDrawer} />
      </Animated.View>
      <View
        style={[
          styles.content,
          drawerOpen && {
            opacity: Platform.OS === 'ios' ? 0.9 : 0.8,
            transform: [{ scale: 0.95 }],
            overflow: 'hidden',
            borderRadius: 10,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const TabNavigator: React.FC = () => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  
  const tabIcons: Record<string, string> = {
    HomeStack: '🏠',
    NutritionStack: '🥗',
    TrainingStack: '🏋️',
    ProfileStack: '👤',
  };

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
            paddingBottom: Spacing.sm,
            paddingTop: Spacing.xs,
            height: 70,
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
              <Text style={{ fontSize: 20, color }}>
                {tabIcons[route.name] ?? '•'}
              </Text>
            </View>
          ),
        })}
      >
        <Tab.Screen
          name="HomeStack"
          component={HomeStackNavigator}
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

export const MainNavigator: React.FC = () => {
  return (
    <DrawerNavigator>
      <TabNavigator />
    </DrawerNavigator>
  );
};

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    navigatorContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    drawer: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: colors.surface,
      zIndex: 2,
    },
    backdrop: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1,
    },
    content: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      padding: Spacing.md,
      paddingTop: Spacing.xl,
      backgroundColor: colors.secondary,
    },
    headerTitle: {
      ...Typography.h2,
      color: colors.primary,
      marginBottom: Spacing.xs,
    },
    headerSubtitle: {
      ...Typography.bodySmall,
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    menuItems: {
      paddingVertical: Spacing.sm,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
    },
    menuItemIcon: {
      fontSize: 20,
      marginRight: Spacing.md,
    },
    menuItemText: {
      ...Typography.body,
      color: colors.text,
    },
    footer: {
      padding: Spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    footerText: {
      ...Typography.caption,
      color: colors.textLight,
      textAlign: 'center',
    },
  });