/**
 * DrawerNavigator.tsx
 * 
 * Implémentation personnalisée d'un navigateur à tiroir latéral (Drawer) avec TabNavigator intégré
 * pour l'application BerserkerCut.
 * 
 * Architecture :
 * - DrawerNavigator : Composant wrapper qui gère l'ouverture/fermeture du menu latéral
 * - TabNavigator : Composant de navigation par onglets en bas de l'écran
 * - DrawerContent : Contenu du menu latéral (liste des sections)
 * - MainNavigator : Point d'entrée qui combine Drawer + Tabs
 * 
 * Fonctionnalités :
 * - Animation fluide du drawer (glissement depuis la gauche)
 * - Navigation globale exposée via global.navigation
 * - Intégration des Stack Navigators pour chaque section
 * - Gestion du thème sombre
 */

// Bibliothèques React & hooks natifs pour gérer l'état et les animations du drawer.
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
// Hook de navigation pour déclencher des transitions vers les différents stacks.
import { useNavigation } from '@react-navigation/native';
// Hook thème maison pour adapter le style au mode sombre/clair.
import { useThemeMode } from '@/hooks/useThemeMode';
// Gestion des zones sûres iOS/Android (encoches, barres système).
import { SafeAreaView } from 'react-native-safe-area-context';
// Hook d'authentification pour récupérer l'utilisateur et la fonction logout.
import { useAuth } from '@/hooks/useAuth';
// Typographies, espacements et palette appliqués dynamiquement aux styles.
import { Typography, Spacing, ThemePalette } from '@/utils/theme';
// Génère un Bottom Tab Navigator pour les sections principales.
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import des navigateurs de pile pour chaque section principale.
import {
  HomeStackNavigator,
  NutritionStackNavigator,
  ProfileStackNavigator,
  TrainingStackNavigator,
  AgendaStackNavigator,
} from './StackNavigators';

/**
 * Type définissant la structure d'un élément du menu drawer
 */
type DrawerItem = {
  key: string;           // Identifiant unique de l'élément
  label: string;         // Texte affiché dans le menu
  onPress: () => void;   // Action déclenchée au clic
  icon?: string;         // Emoji ou icône affichée
  screen?: string;       // Nom de l'écran cible (optionnel)
  stack?: string;        // Nom du stack cible (optionnel)
};

/**
 * Props du composant DrawerContent
 */
interface DrawerContentProps {
  closeDrawer: () => void;  // Fonction pour fermer le drawer
}

// Création du navigateur à onglets en bas de l'écran.
const Tab = createBottomTabNavigator();

/**
 * DrawerContent
 * 
 * Composant qui affiche le contenu du menu latéral (drawer).
 * Comprend :
 * - En-tête avec le logo et le nom de l'utilisateur
 * - Liste des sections de l'application (Accueil, Nutrition, Entraînement, etc.)
 * - Pied de page avec la version de l'application
 * 
 * @param closeDrawer - Fonction pour fermer le drawer après navigation
 */
const DrawerContent: React.FC<DrawerContentProps> = ({ closeDrawer }) => {
  const navigation = useNavigation<any>();
  const { colors } = useThemeMode();
  const { logout, user } = useAuth();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  /**
   * Fonction de navigation vers un stack et optionnellement un écran spécifique
   * Ferme automatiquement le drawer après la navigation
   * 
   * @param stack - Nom du stack cible (ex: 'HomeStack', 'ProfileStack')
   * @param screen - Nom de l'écran dans le stack (optionnel)
   */
  const navigateTo = useCallback(
    (stack: string, screen?: string) => {
      closeDrawer();
      if (screen) {
        // Navigation vers un écran spécifique dans un stack
        navigation.navigate(stack, { screen });
      } else {
        // Navigation vers le premier écran du stack
        navigation.navigate(stack);
      }
    },
    [closeDrawer, navigation],
  );

  /**
   * Gère la déconnexion de l'utilisateur
   * Ferme le drawer et appelle la fonction logout
   */
  const handleLogout = useCallback(async () => {
    closeDrawer();
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  }, [closeDrawer, logout]);

  /**
   * Liste des éléments du menu drawer
   * Chaque élément définit une section de l'application
   */
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
      key: 'agenda',
      label: 'Agenda',
      icon: '📅',
      onPress: () => navigateTo('AgendaStack'),
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

  // Récupère le nom de l'utilisateur pour l'afficher dans l'en-tête
  // Fallback sur l'email ou "Viking" si aucun nom n'est défini
  const userName = user?.profile?.name || user?.email?.split('@')[0] || 'Viking';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* En-tête du drawer avec logo et salutation */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BerserkerCut</Text>
        <Text style={styles.headerSubtitle}>Bonjour, {userName}</Text>
      </View>
      
      {/* Liste scrollable des éléments du menu */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.menuItems}>
          {drawerItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7} // Opacité réduite au toucher pour feedback visuel
            >
              {item.icon && <Text style={styles.menuItemIcon}>{item.icon}</Text>}
              <Text style={styles.menuItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {/* Pied de page avec le numéro de version */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.4</Text>
      </View>
    </SafeAreaView>
  );
};

/**
 * Props du composant DrawerNavigator
 */
interface DrawerNavigatorProps {
  children: React.ReactNode;  // Contenu à afficher (généralement le TabNavigator)
}

/**
 * DrawerNavigator
 * 
 * Composant principal qui gère l'affichage et l'animation du menu latéral.
 * 
 * Fonctionnalités :
 * - Animation fluide du drawer avec React Native Animated
 * - Backdrop semi-transparent quand le drawer est ouvert
 * - Effet de scale sur le contenu principal quand le drawer est ouvert (iOS)
 * - Exposition globale des fonctions openDrawer/closeDrawer pour y accéder depuis n'importe où
 * 
 * @param children - Contenu principal à afficher (le TabNavigator)
 */
export const DrawerNavigator: React.FC<DrawerNavigatorProps> = ({ children }) => {
  // État pour savoir si le drawer est ouvert ou fermé
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  
  // Valeur animée pour la position X du drawer (-300 = fermé, 0 = ouvert)
  const translateX = React.useRef(new Animated.Value(-300)).current;

  /**
   * Ouvre le drawer avec une animation spring
   */
  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    Animated.spring(translateX, {
      toValue: 0,                    // Position finale (complètement visible)
      useNativeDriver: true,         // Utilise le driver natif pour de meilleures performances
    }).start();
  }, [translateX]);

  /**
   * Ferme le drawer avec une animation spring
   */
  const closeDrawer = useCallback(() => {
    Animated.spring(translateX, {
      toValue: -300,                 // Position finale (caché à gauche)
      useNativeDriver: true,
    }).start(() => {
      setDrawerOpen(false);          // Met à jour l'état après l'animation
    });
  }, [translateX]);

  /**
   * Expose les fonctions openDrawer et closeDrawer globalement
   * Permet d'ouvrir/fermer le drawer depuis n'importe quel composant
   * via global.navigation.openDrawer() et global.navigation.closeDrawer()
   */
  React.useEffect(() => {
    // Expose le drawer à la navigation globale de façon sécurisée
    if (typeof global !== 'undefined') {
      if (!global.navigation) {
        global.navigation = {};
      }
      global.navigation.openDrawer = openDrawer;
      global.navigation.closeDrawer = closeDrawer;
    }
    
    // Nettoyage : supprime les références globales au démontage du composant
    return () => {
      if (typeof global !== 'undefined' && global.navigation) {
        global.navigation.openDrawer = undefined;
        global.navigation.closeDrawer = undefined;
      }
    };
  }, [openDrawer, closeDrawer]);

  // Dimensions du drawer et de l'écran
  const drawerWidth = 280;
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.navigatorContainer}>
      {/* Backdrop semi-transparent affiché uniquement quand le drawer est ouvert */}
      {/* Permet de fermer le drawer en cliquant en dehors */}
      {drawerOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}            // Pas d'effet d'opacité au toucher
          onPress={closeDrawer}        // Ferme le drawer au clic
        />
      )}
      
      {/* Le drawer lui-même, avec animation de translation */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            transform: [{ translateX }],  // Animation de glissement horizontal
          },
        ]}
      >
        <DrawerContent closeDrawer={closeDrawer} />
      </Animated.View>
      
      {/* Contenu principal de l'application (TabNavigator) */}
      <View
        style={[
          styles.content,
          // Applique un effet visuel quand le drawer est ouvert
          drawerOpen && {
            opacity: Platform.OS === 'ios' ? 0.9 : 0.8,  // Légère transparence
            transform: [{ scale: 0.95 }],                 // Légère réduction de taille
            overflow: 'hidden',
            borderRadius: 10,                             // Coins arrondis
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

/**
 * TabNavigator
 * 
 * Composant qui gère la navigation par onglets en bas de l'écran.
 * Intègre les 4 sections principales de l'application :
 * - HomeStack (Accueil)
 * - NutritionStack (Nutrition)
 * - TrainingStack (Entraînement)
 * - ProfileStack (Profil)
 * 
 * Chaque onglet affiche une icône emoji et change de couleur quand il est actif.
 */
const TabNavigator: React.FC = () => {
  const { colors } = useThemeMode();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  
  // Mapping des icônes pour chaque stack
  const tabIcons: Record<string, string> = {
    HomeStack: '🏠',
    NutritionStack: '🥗',
    TrainingStack: '🏋️',
    ProfileStack: '👤',
    AgendaStack: '📅',
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,                              // Cache le header par défaut (géré par AppToolbar)
          tabBarActiveTintColor: colors.primaryLight,      // Couleur de l'onglet actif
          tabBarInactiveTintColor: colors.textLight,       // Couleur des onglets inactifs
          tabBarStyle: {
            backgroundColor: colors.surface,               // Fond de la barre d'onglets
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: Spacing.sm,
            paddingTop: Spacing.xs,
            height: 70,                                    // Hauteur de la barre d'onglets
          },
          tabBarLabelStyle: {
            fontSize: 12,                                  // Taille du texte des labels
          },
          /**
           * Personnalisation de l'icône de chaque onglet
           * Affiche un emoji dans un conteneur avec fond coloré si actif
           */
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                padding: 6,
                borderRadius: 16,
                // Arrière-plan coloré uniquement pour l'onglet actif
                backgroundColor: focused ? colors.secondaryLight : 'transparent',
              }}
            >
              <Text style={{ fontSize: 20, color }}>
                {tabIcons[route.name] ?? '•'}  {/* Fallback sur '•' si pas d'icône définie */}
              </Text>
            </View>
          ),
        })}
      >
        {/* Onglet Accueil */}
        <Tab.Screen
          name="HomeStack"
          component={HomeStackNavigator}
          options={{ tabBarLabel: 'Accueil' }}
        />
        {/* Onglet Nutrition */}
        <Tab.Screen
          name="NutritionStack"
          component={NutritionStackNavigator}
          options={{ tabBarLabel: 'Nutrition' }}
        />
        {/* Onglet Entraînement */}
        <Tab.Screen
          name="TrainingStack"
          component={TrainingStackNavigator}
          options={{ tabBarLabel: 'Entraînement' }}
        />
        {/* Onglet Profil */}
        <Tab.Screen
          name="ProfileStack"
          component={ProfileStackNavigator}
          options={{ tabBarLabel: 'Profil' }}
        />
        {/* Agenda natif – accessible via le drawer uniquement */}
        <Tab.Screen
          name="AgendaStack"
          component={AgendaStackNavigator}
          options={{
            title: 'Agenda',
            tabBarButton: () => null,
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

/**
 * MainNavigator
 * 
 * Point d'entrée principal de la navigation de l'application.
 * Combine le DrawerNavigator (menu latéral) avec le TabNavigator (onglets en bas).
 * 
 * Hiérarchie de navigation :
 * MainNavigator
 *   └─ DrawerNavigator (menu latéral)
 *       └─ TabNavigator (onglets en bas)
 *           ├─ HomeStack (Accueil + écrans liés)
 *           ├─ NutritionStack (Nutrition + écrans liés)
 *           ├─ TrainingStack (Entraînement + écrans liés)
 *           └─ ProfileStack (Profil + écrans liés)
 */
export const MainNavigator: React.FC = () => {
  return (
    <DrawerNavigator>
      <TabNavigator />
    </DrawerNavigator>
  );
};

/**
 * createStyles
 * 
 * Fonction qui crée les styles pour le DrawerNavigator en fonction du thème actuel.
 * Tous les styles sont dynamiques et s'adaptent aux couleurs du thème (mode sombre).
 * 
 * @param colors - Palette de couleurs du thème actuel
 * @returns Objet StyleSheet contenant tous les styles du composant
 */
const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    // Conteneur principal du navigateur (occupe tout l'écran)
    navigatorContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // Style du drawer (menu latéral)
    drawer: {
      position: 'absolute',   // Positionné en absolu pour être au-dessus du contenu
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: colors.surface,
      zIndex: 2,              // Au-dessus du backdrop
    },
    // Backdrop semi-transparent derrière le drawer
    backdrop: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Noir à 50% d'opacité
      zIndex: 1,              // Au-dessus du contenu, en-dessous du drawer
    },
    content: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // Conteneur du contenu du drawer (SafeAreaView)
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    // En-tête du drawer avec logo et salutation
    header: {
      padding: Spacing.md,
      paddingTop: Spacing.xl,
      backgroundColor: colors.secondary,
    },
    // Titre principal dans l'en-tête (BerserkerCut)
    headerTitle: {
      ...Typography.h2,
      color: colors.primary,
      marginBottom: Spacing.xs,
    },
    // Sous-titre dans l'en-tête (Bonjour, {username})
    headerSubtitle: {
      ...Typography.bodySmall,
      color: colors.text,
    },
    // ScrollView contenant la liste des éléments du menu
    scrollView: {
      flex: 1,
    },
    // Conteneur de la liste des éléments du menu
    menuItems: {
      paddingVertical: Spacing.sm,
    },
    // Style pour chaque élément du menu
    menuItem: {
      flexDirection: 'row',       // Icône et texte côte à côte
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
    },
    // Icône (emoji) de chaque élément du menu
    menuItemIcon: {
      fontSize: 20,
      marginRight: Spacing.md,
    },
    // Texte de chaque élément du menu
    menuItemText: {
      ...Typography.body,
      color: colors.text,
    },
    // Pied de page du drawer
    footer: {
      padding: Spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,  // Ligne de séparation fine
      borderTopColor: colors.border,
    },
    // Texte du numéro de version dans le pied de page
    footerText: {
      ...Typography.caption,
      color: colors.textLight,
      textAlign: 'center',
    },
  });