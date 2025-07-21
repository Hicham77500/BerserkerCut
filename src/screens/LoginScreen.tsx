 /**
 * Écran de connexion avec design moderne
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Button, Input, Card } from '../components';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>BerserkerCut</Text>
            <Text style={styles.subtitle}>
              Votre coach personnel pour la sèche
            </Text>
          </View>

          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>
              {isLogin ? 'Connexion' : 'Inscription'}
            </Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            <Button
              title={isLogin ? 'Se connecter' : 'S\'inscrire'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />

            <Button
              title={isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
              onPress={() => setIsLogin(!isLogin)}
              variant="secondary"
              style={styles.switchButton}
            />
          </Card>

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Mode démo</Text>
            <Text style={styles.demoSubtitle}>
              Testez l'application sans créer de compte
            </Text>
            <Button
              title="Essayer en mode démo"
              onPress={() => {
                setEmail('demo@berserkercut.com');
                setPassword('demo123');
                handleSubmit();
              }}
              variant="outline"
              style={[styles.demoButton, Platform.OS === 'android' && {
                borderColor: Colors.primary,
                borderWidth: 2.5,
              }]}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  formTitle: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  switchButton: {
    marginTop: Spacing.md,
  },
  demoSection: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    // Suppression de l'effet carré blanc sur Android
    ...(Platform.OS === 'android' ? {
      borderWidth: 1,
      borderColor: Colors.primary + '20', // Bordure très légère
      elevation: 0, // Suppression de l'élévation
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
    } : {}),
  },
  demoTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  demoSubtitle: {
    ...Typography.caption,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  demoButton: {
    minWidth: 200,
    // Styles spécifiques Android pour le bouton démo
    ...(Platform.OS === 'android' ? {
      marginTop: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
    } : {}),
  },
});
