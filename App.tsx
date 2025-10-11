// Point d'entrée principal de l'application React Native (Expo).
// Configure la typographie globale et installe les providers nécessaires.

// Importe React pour exploiter les hooks et le JSX.
import React from 'react';
// Contrôle l'apparence de la status bar (Expo StatusBar).
import { StatusBar } from 'expo-status-bar';
// Importe les API natives nécessaires à la configuration de la typographie et du layout.
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
// Types des composants Text et TextInput pour typer les defaultProps.
import type { TextProps, TextInputProps } from 'react-native';
// Fournit un contexte Safe Area compatible iOS/Android.
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Navigation racine combinant Auth, Plans et Drawer.
import { Navigation } from '@/navigation/Navigation';
// Provider custom qui gère le thème clair/sombre de l'application.
import { ThemeModeProvider } from '@/hooks/useThemeMode';
// Palette de couleurs partagée par l'ensemble du projet.
import { Colors } from '@/utils/theme';

// Hook utilitaire : applique des styles par défaut aux composants Text/TextInput
// pour harmoniser la typographie sur toutes les plateformes.
const useConfigureDefaultTypography = () => {
  React.useEffect(() => {
    // Sélectionne la police système en fonction de la plateforme.
    const fontFamily = Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    });

    // Crée un style de base partagé par tous les Text/TextInput.
    const baseStyle = StyleSheet.create({
      text: {
        fontFamily,
      },
    }).text;

    // Étend les types React Native avec la possibilité d'avoir des defaultProps typés.
    const TextComponent = Text as typeof Text & {
      defaultProps?: Partial<TextProps>;
    };
    const TextInputComponent = TextInput as typeof TextInput & {
      defaultProps?: Partial<TextInputProps>;
    };

    // Fusionne les defaultProps existantes avec la configuration souhaitée.
    TextComponent.defaultProps = {
      ...TextComponent.defaultProps,
      allowFontScaling: TextComponent.defaultProps?.allowFontScaling ?? false,
      style: StyleSheet.flatten([
        TextComponent.defaultProps?.style,
        baseStyle,
      ]) as TextProps['style'],
    };

    // Applique la même logique aux champs de saisie.
    TextInputComponent.defaultProps = {
      ...TextInputComponent.defaultProps,
      allowFontScaling:
        TextInputComponent.defaultProps?.allowFontScaling ?? false,
      style: StyleSheet.flatten([
        TextInputComponent.defaultProps?.style,
        baseStyle,
      ]) as TextInputProps['style'],
    };
  }, []);
};

// Conteneur principal qui configure la typographie et injecte la navigation.
const AppShell: React.FC = () => {
  useConfigureDefaultTypography();

  return (
    <View style={styles.appContainer}>
      <Navigation />
      <StatusBar style="light" />
    </View>
  );
};

// Composant racine : installe les providers globaux avant de rendre l'app.
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeModeProvider>
        <AppShell />
      </ThemeModeProvider>
    </SafeAreaProvider>
  );
}

// Styles globaux appliqués à la racine de l'application.
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
