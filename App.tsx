import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { TextProps, TextInputProps } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from '@/navigation/Navigation';
import { ThemeModeProvider } from '@/hooks/useThemeMode';
import { Colors } from '@/utils/theme';

const useConfigureDefaultTypography = () => {
  React.useEffect(() => {
    const fontFamily = Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    });

    const baseStyle = StyleSheet.create({
      text: {
        fontFamily,
      },
    }).text;

    const TextComponent = Text as typeof Text & {
      defaultProps?: Partial<TextProps>;
    };
    const TextInputComponent = TextInput as typeof TextInput & {
      defaultProps?: Partial<TextInputProps>;
    };

    TextComponent.defaultProps = {
      ...TextComponent.defaultProps,
      allowFontScaling: TextComponent.defaultProps?.allowFontScaling ?? false,
      style: StyleSheet.flatten([
        TextComponent.defaultProps?.style,
        baseStyle,
      ]) as TextProps['style'],
    };

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

const AppShell: React.FC = () => {
  useConfigureDefaultTypography();

  return (
    <View style={styles.appContainer}>
      <Navigation />
      <StatusBar style="light" />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeModeProvider>
        <AppShell />
      </ThemeModeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
