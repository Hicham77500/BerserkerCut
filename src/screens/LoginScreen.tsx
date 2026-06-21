/**
 * Écran de connexion avec design moderne
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { Typography, Spacing, BorderRadius, ThemePalette } from '../utils/theme';
import { Button, Input, Card } from '../components';
import { setDemoMode } from '../services/appModeService';
import { getSecureItem, setSecureItem } from '@/utils/storage/secureStorage';
import { DEMO_MODE_CONSENT_STORAGE_KEY } from '@/constants/storageKeys';
import { useThemeMode } from '@/hooks/useThemeMode';

/**
 * LoginScreen
 * Rôle: point d'entrée d'authentification (connexion/inscription) + accès mode démo.
 * Emplacement logique:
 * - État local + hooks: début du composant
 * - Validations: blocs useMemo
 * - Actions utilisateur: handleSubmit / handleTitleTap
 * - UI: bloc return (header, formulaire, footer légal)
 */
export const LoginScreen: React.FC = () => {
  // ===== État de formulaire =====
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // ===== Thème dynamique =====
  const { colors } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Easter egg: 6 taps on title → demo mode
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { login, register } = useAuth();

  // Réinitialise l'état "formulaire soumis" lors du switch Connexion/Inscription
  useEffect(() => {
    setSubmitted(false);
  }, [isLogin]);

  // Validation email (requise + format)
  const emailError = useMemo(() => {
    if (!email) return 'Veuillez renseigner votre email';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email) ? null : 'Email invalide';
  }, [email]);

  // Validation mot de passe (requis, et >= 8 caractères en inscription)
  const passwordError = useMemo(() => {
    if (!password) return 'Veuillez saisir votre mot de passe';
    if (!isLogin && password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    return null;
  }, [password, isLogin]);

  /**
   * handleSubmit
   * Utilité: soumet le formulaire avec garde-fous de validation
   * Flux: validate -> set loading -> login/register -> gestion erreurs
   */
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

  /**
   * handleTitleTap
   * Utilité: Easter egg (6 taps) pour activer le mode démo local.
   * Détail: demande consentement persistant si première activation.
   */
  const handleTitleTap = async () => {
    tapCount.current += 1;

    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    // Reset counter after 2s of inactivity
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 2000);

    if (tapCount.current >= 6) {
      tapCount.current = 0;
      if (tapTimer.current) clearTimeout(tapTimer.current);

      const consentStored = await getSecureItem(DEMO_MODE_CONSENT_STORAGE_KEY);

      Alert.alert(
        '🔓 Mode démo',
        consentStored === 'true'
          ? 'Activation du mode démo...'
          : 'Le mode démo utilise un profil fictif local sans données personnelles. Continuer ?',
        consentStored === 'true'
          ? [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Activer',
                onPress: async () => {
                  await setDemoMode(true);
                  setEmail('demo@berserkercut.com');
                  setPassword('demo123');
                  setTimeout(() => handleSubmit(), 100);
                },
              },
            ]
          : [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Accepter et activer',
                onPress: async () => {
                  await setSecureItem(DEMO_MODE_CONSENT_STORAGE_KEY, 'true');
                  await setDemoMode(true);
                  Alert.alert(
                    '✓ Mode démo activé',
                    'Profil fictif local activé.',
                    [
                      {
                        text: 'Continuer',
                        onPress: () => {
                          setEmail('demo@berserkercut.com');
                          setPassword('demo123');
                          setTimeout(() => handleSubmit(), 100);
                        },
                      },
                    ]
                  );
                },
              },
            ]
      );
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.container}>
      {/* ===== Couche de fond (image + overlay pour conserver la lisibilité) ===== */}
      {/* Background image slot — remplace assets/login-bg.png par ta propre image */}
      <ImageBackground
        source={require('../../assets/fondecran.jpeg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* ===== Contenu scrollable principal ===== */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ===== Header marque ===== */}
          {/* Header — 6 taps secret pour mode démo */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleTitleTap}
            accessibilityLabel="BerserkerCut"
            style={styles.header}
          >
            <Text style={styles.title}>BerserkerCut</Text>
            <View style={styles.subtitleContainer}>
              <View style={styles.subtitleLine} />
              <Text style={styles.subtitle}>Votre coach personnel pour la sèche</Text>
              <View style={styles.subtitleLine} />
            </View>
          </TouchableOpacity>

          <View style={styles.spacer} />

          {/* ===== Formulaire d'authentification ===== */}
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

          {/* ===== Footer conformité légale ===== */}
          {/* Legal mentions footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>En utilisant BerserkerCut, vous acceptez nos</Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.link}>Conditions d'utilisation</Text>
              </TouchableOpacity>
              <Text style={styles.separator}>•</Text>
              <TouchableOpacity>
                <Text style={styles.link}>Politique de confidentialité</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.link}>Mentions légales</Text>
              </TouchableOpacity>
              <Text style={styles.separator}>•</Text>
              <TouchableOpacity>
                <Text style={styles.link}>Charte utilisateur</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.copyright}>© 2026 BerserkerCut. Tous droits réservés.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/**
 * createStyles
 * Utilité: centralise les styles de l'écran selon la palette active (light/dark).
 * Emplacement: fin de fichier pour isoler la présentation de la logique métier.
 */
const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    // ===== Layout global =====
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backgroundImage: {
      ...StyleSheet.absoluteFillObject,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(30, 15, 15, 0.25)',
    },
    keyboardAvoidingView: {
      flex: 1,
    },

    // ===== Zone de contenu =====
    scrollContent: {
      flexGrow: 1,
      padding: Spacing.lg,
      justifyContent: 'flex-start',
      paddingBottom: Spacing.xl,
    },

    // ===== Header =====
    header: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
      paddingTop: Spacing.md,
    },
    spacer: {
      height: Spacing.xxl,
    },
    title: {
      ...Typography.h1,
      color: colors.primary,
      marginBottom: Spacing.md,
    },
    subtitle: {
      ...Typography.body,
      color: colors.textLight,
      textAlign: 'center',
      marginHorizontal: Spacing.sm,
    },
    subtitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    subtitleLine: {
      width: 60,
      height: 1.5,
      backgroundColor: colors.primary,
    },

    // ===== Carte formulaire =====
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

    // ===== Footer légal =====
    footer: {
      marginTop: Spacing.lg,
      paddingHorizontal: Spacing.md,
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    footerText: {
      ...Typography.bodySmall,
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    footerLinks: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xs,
      flexWrap: 'wrap',
    },
    link: {
      ...Typography.bodySmall,
      color: colors.primary,
      textDecorationLine: 'underline',
      marginHorizontal: Spacing.xs,
    },
    separator: {
      color: colors.textLight,
      marginHorizontal: Spacing.xs,
    },
    copyright: {
      ...Typography.caption,
      color: colors.textLight,
      textAlign: 'center',
      marginTop: Spacing.sm,
      fontSize: 11,
    },
  });
