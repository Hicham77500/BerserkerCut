/**
 * Écran de connexion avec design moderne
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { Typography, Spacing, BorderRadius, ThemePalette } from '../utils/theme';
import { Button, Input, Card } from '../components';
import { isDemoMode, setDemoMode } from '../services/appModeService';
import { getSecureItem, setSecureItem } from '@/utils/storage/secureStorage';
import { DEMO_MODE_CONSENT_STORAGE_KEY } from '@/constants/storageKeys';
import { useThemeMode } from '@/hooks/useThemeMode';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [demoModeEnabled, setDemoModeEnabled] = useState(false);
  const [demoConsentAccepted, setDemoConsentAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { colors } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const { login, register } = useAuth();
  
  // Initialiser l'état du mode démo lors du chargement du composant
  useEffect(() => {
    (async () => {
      const consentStored = await getSecureItem(DEMO_MODE_CONSENT_STORAGE_KEY);
      setDemoConsentAccepted(consentStored === 'true');
      setDemoModeEnabled(isDemoMode());
    })();
  }, []);

  useEffect(() => {
    setSubmitted(false);
  }, [isLogin]);

  const emailError = useMemo(() => {
    if (!email) return 'Veuillez renseigner votre email';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email) ? null : 'Email invalide';
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return 'Veuillez saisir votre mot de passe';
    if (!isLogin && password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    return null;
  }, [password, isLogin]);

  const handleSubmit = async () => {
    setSubmitted(true);

    if (emailError || passwordError) {
      Alert.alert('Informations manquantes', emailError || passwordError || '');
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

  const enableDemoModeWithConsent = async (showEnabledAlert: boolean): Promise<boolean> => {
    if (demoConsentAccepted) {
      await setDemoMode(true);
      setDemoModeEnabled(true);
      if (showEnabledAlert) {
        Alert.alert(
          'Mode démo activé',
          'Aucune donnée personnelle de base n\'est requise. Un profil fictif local est utilisé sur cet appareil.'
        );
      }
      return true;
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Activer le mode démo ? ',
        'Le mode démo utilise un profil fictif local et ne nécessite aucune donnée personnelle de base. Souhaitez-vous activer ce mode ? ',
        [
          { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Accepter et activer',
            onPress: () => {
              (async () => {
                await setSecureItem(DEMO_MODE_CONSENT_STORAGE_KEY, 'true');
                setDemoConsentAccepted(true);
                await setDemoMode(true);
                setDemoModeEnabled(true);
                if (showEnabledAlert) {
                  Alert.alert(
                    'Mode démo activé',
                    'Profil fictif local activé. Vous pourrez revenir en mode production à tout moment.'
                  );
                }
                resolve(true);
              })().catch(() => resolve(false));
            },
          },
        ]
      );
    });
  };

  const handleDemoLogin = async () => {
    if (!demoModeEnabled) {
      const activated = await enableDemoModeWithConsent(true);
      if (!activated) return;
    }

    setEmail('demo@berserkercut.com');
    setPassword('demo123');

    setTimeout(() => {
      handleSubmit();
    }, 300);
  };

  const toggleDemoMode = async (value: boolean) => {
    if (value) {
      await enableDemoModeWithConsent(true);
      return;
    }

    await setDemoMode(false);
    setDemoModeEnabled(false);
    Alert.alert(
      'Mode production activé',
      'Le mode démo est désactivé. Connectez-vous avec votre compte pour utiliser vos données réelles.'
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.container}>
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
              error={submitted && emailError ? emailError : undefined}
            />

            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              isPassword
              helper={!isLogin ? '8 caractères minimum' : undefined}
              error={submitted && passwordError ? passwordError : undefined}
            />

            <Button
              title={isLogin ? 'Se connecter' : 'S\'inscrire'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
              disabled={Boolean(emailError || passwordError)}
              accessibilityLabel={isLogin ? 'Se connecter au compte' : 'Creer un compte'}
            />

            <Button
              title={isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
              onPress={() => setIsLogin(!isLogin)}
              variant="secondary"
              style={styles.switchButton}
              accessibilityLabel={isLogin ? 'Basculer vers le formulaire inscription' : 'Basculer vers le formulaire connexion'}
            />
          </Card>

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Mode démo</Text>
            <Text style={styles.demoSubtitle}>
              Testez l'application sans compte réel ni données personnelles de base
            </Text>
            <Text style={styles.demoPrivacyNote}>
              Utilise un profil fictif local sur cet appareil, activé uniquement avec votre accord.
            </Text>
            
            <View style={styles.demoToggleContainer}>
              <Text style={styles.demoToggleLabel}>
                Mode démo {demoModeEnabled ? 'activé' : 'désactivé'}
              </Text>
              <Switch
                value={demoModeEnabled}
                onValueChange={toggleDemoMode}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={demoModeEnabled ? colors.primary : colors.textMuted}
                accessibilityLabel="Activer ou desactiver le mode demo"
                accessibilityHint="Bascule entre le mode de demonstration local et le mode production"
              />
            </View>
            
            <Button
              title="Essayer en mode démo"
              onPress={handleDemoLogin}
              variant="outline"
              style={[styles.demoButton, Platform.OS === 'android' && {
                borderColor: colors.primary,
                borderWidth: 2.5,
              }]}
              accessibilityLabel="Essayer l'application en mode demo"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: Spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    title: {
      ...Typography.h1,
      color: colors.primary,
      marginBottom: Spacing.sm,
    },
    subtitle: {
      ...Typography.body,
      color: colors.textLight,
      textAlign: 'center',
    },
    formCard: {
      marginBottom: Spacing.xl,
    },
    formTitle: {
      ...Typography.h2,
      color: colors.text,
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
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...(Platform.OS === 'android'
        ? {
            elevation: 0,
            shadowOpacity: 0,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 0,
          }
        : {}),
    },
    demoTitle: {
      ...Typography.h3,
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    demoSubtitle: {
      ...Typography.caption,
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    demoPrivacyNote: {
      ...Typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: Spacing.md,
    },
    demoButton: {
      minWidth: 200,
      ...(Platform.OS === 'android'
        ? {
            marginTop: 8,
            paddingVertical: 14,
            paddingHorizontal: 24,
          }
        : {}),
    },
    demoToggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.md,
    },
    demoToggleLabel: {
      ...Typography.bodySmall,
      color: colors.text,
      flex: 1,
      marginRight: Spacing.md,
    },
  });
