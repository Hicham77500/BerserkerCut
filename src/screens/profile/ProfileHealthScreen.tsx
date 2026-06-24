/**
 * Module: src/screens/profile/ProfileHealthScreen.tsx
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Input, Card, IOSButton } from '@/components';
import { Typography, Spacing, BorderRadius, ThemePalette } from '@/utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';
import { HealthProfile } from '@/types';
import { HealthService } from '@/services/healthService';

/**
 * Composant: ProfileHealthScreen
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
export const ProfileHealthScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { colors } = useThemeMode();
  const defaultHealth: HealthProfile = {
    weight: 0,
    height: 0,
    age: 0,
    gender: 'male',
    activityLevel: 'moderate',
    averageSleepHours: 8,
    dataSource: {
      type: 'manual',
      isConnected: false,
      permissions: [],
    },
    lastUpdated: new Date(),
    isManualEntry: true,
  };

  const health = user?.profile?.health ?? defaultHealth;
  const isIOS = Platform.OS === 'ios';
  const isAppleHealthConnected = health.dataSource.type === 'apple_healthkit' && health.dataSource.isConnected;

  const [form, setForm] = useState({
    weight: String(health.weight || ''),
    height: String(health.height || ''),
    age: String(health.age || ''),
    averageSleepHours: String(health.averageSleepHours || ''),
  });
  const [processingHealthKit, setProcessingHealthKit] = useState(false);

/**
 * Fonction: handleSave
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const handleSave = async () => {
    await updateProfile({
      health: {
        ...health,
        weight: Number(form.weight) || 0,
        height: Number(form.height) || 0,
        age: Number(form.age) || 0,
        averageSleepHours: Number(form.averageSleepHours) || 0,
        isManualEntry: health.dataSource.type !== 'apple_healthkit',
        lastUpdated: new Date(),
      },
    });
  };

  const handleConnectAppleHealth = async () => {
    setProcessingHealthKit(true);
    try {
      const granted = await HealthService.connectAppleHealthKit();
      if (!granted) {
        Alert.alert(
          'Apple Santé indisponible',
          'La connexion n\'a pas pu être activée. Vérifie les autorisations iOS et utilise un build iOS avec HealthKit activé.'
        );
        return;
      }

      await updateProfile({
        health: {
          ...health,
          dataSource: {
            type: 'apple_healthkit',
            isConnected: true,
            permissions: ['Weight', 'StepCount', 'HeartRate'],
            lastSyncDate: health.dataSource.lastSyncDate,
          },
          isManualEntry: false,
          lastUpdated: new Date(),
        },
      });

      Alert.alert('Apple Santé connectée', 'Tu peux maintenant synchroniser ton poids automatiquement.');
    } catch (error) {
      Alert.alert('Erreur', "Impossible de connecter Apple Santé pour l'instant.");
    } finally {
      setProcessingHealthKit(false);
    }
  };

  const handleSyncAppleWeight = async () => {
    setProcessingHealthKit(true);
    try {
      const sourceHealth: HealthProfile = {
        ...health,
        dataSource: {
          ...health.dataSource,
          type: 'apple_healthkit',
          isConnected: true,
          permissions: health.dataSource.permissions ?? ['Weight', 'StepCount', 'HeartRate'],
        },
      };

      const syncedProfile = await HealthService.syncHealthDataFromSource(sourceHealth);
      if (!syncedProfile) {
        Alert.alert('Aucune donnée', 'Impossible de lire le poids depuis Apple Santé.');
        return;
      }

      await updateProfile({ health: syncedProfile });
      setForm((prev) => ({
        ...prev,
        weight: String(syncedProfile.weight || ''),
      }));

      Alert.alert('Poids synchronisé', `Poids mis à jour: ${syncedProfile.weight} kg`);
    } catch (error) {
      Alert.alert('Erreur', 'La synchronisation du poids a échoué.');
    } finally {
      setProcessingHealthKit(false);
    }
  };

  const handleDisconnectAppleHealth = async () => {
    try {
      const disconnected = HealthService.disconnectHealthSource(health);
      await updateProfile({ health: disconnected });
      Alert.alert('Apple Santé désactivée', 'Le suivi repasse en mode manuel.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de désactiver Apple Santé.');
    }
  };

  const handleOpenNativeSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      Alert.alert('Réglages indisponibles', 'Ouvre Réglages iOS > Santé > Accès aux données et appareils.');
    }
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

/**
 * Fonction: handleSaveSuccess
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const handleSaveSuccess = () => {
    Alert.alert('Profil mis à jour', 'Vos données biométriques ont été enregistrées avec succès.');
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Mesures biométriques</Text>
          
          <Input
            label="Poids (kg)"
            value={form.weight}
            keyboardType="decimal-pad"
            testID="profile-health-weight"
            onChangeText={(weight) => setForm((prev) => ({ ...prev, weight }))}
          />
          <Text style={styles.helpText}>Votre poids actuel en kilogrammes</Text>
          
          <Input
            label="Taille (cm)"
            value={form.height}
            keyboardType="decimal-pad"
            testID="profile-health-height"
            onChangeText={(height) => setForm((prev) => ({ ...prev, height }))}
          />
          <Text style={styles.helpText}>Votre taille en centimètres</Text>
          
          <Input
            label="Âge"
            value={form.age}
            keyboardType="number-pad"
            testID="profile-health-age"
            onChangeText={(age) => setForm((prev) => ({ ...prev, age }))}
          />
          
          <Input
            label="Sommeil moyen (h)"
            value={form.averageSleepHours}
            keyboardType="decimal-pad"
            testID="profile-health-sleep"
            onChangeText={(value) => setForm((prev) => ({ ...prev, averageSleepHours: value }))}
          />
          <Text style={styles.helpText}>Nombre d'heures de sommeil par nuit en moyenne</Text>
          
          <View style={styles.activityContainer}>
            <Text style={styles.activityTitle}>Niveau d'activité</Text>
            <Text style={styles.helpText}>Sélectionnez le niveau qui correspond le mieux à votre mode de vie actuel</Text>
            {/* TODO: Implement activity level selection */}
          </View>

          {isIOS ? (
            <View style={styles.weightTrackingContainer}>
              <Text style={styles.activityTitle}>Suivi du poids iPhone Santé</Text>
              <Text style={styles.helpText}>
                Autorise BerserkerCut à lire ton poids depuis Apple Santé. Tu peux retirer l'accès à tout moment dans les réglages iOS.
              </Text>
              <Text style={styles.helpText}>
                Statut actuel: {isAppleHealthConnected ? 'connecté' : 'non connecté'}
              </Text>

              {!isAppleHealthConnected ? (
                <IOSButton
                  label={processingHealthKit ? 'Connexion...' : 'Connecter Apple Santé'}
                  onPress={handleConnectAppleHealth}
                  disabled={processingHealthKit}
                />
              ) : (
                <View style={styles.actionGroup}>
                  <IOSButton
                    label={processingHealthKit ? 'Synchronisation...' : 'Synchroniser mon poids'}
                    onPress={handleSyncAppleWeight}
                    disabled={processingHealthKit}
                  />
                  <IOSButton
                    label="Désactiver Apple Santé"
                    onPress={handleDisconnectAppleHealth}
                    variant="secondary"
                    disabled={processingHealthKit}
                  />
                </View>
              )}

              <IOSButton
                label="Ouvrir les réglages iOS"
                onPress={handleOpenNativeSettings}
                variant="secondary"
              />
            </View>
          ) : null}

          <IOSButton label="Enregistrer" onPress={() => {
            handleSave().then(handleSaveSuccess).catch(() => {
              Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
            });
          }} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Fonction: createStyles
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    card: {
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      backgroundColor: colors.surface,
      gap: Spacing.md,
    },
    cardTitle: {
      ...Typography.h3,
      marginBottom: Spacing.md,
      color: colors.text,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    radioContainer: {
      flexDirection: 'row',
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    activityContainer: {
      marginBottom: Spacing.md,
    },
    weightTrackingContainer: {
      marginBottom: Spacing.md,
      gap: Spacing.sm,
    },
    actionGroup: {
      gap: Spacing.sm,
    },
    activityTitle: {
      ...Typography.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    helpText: {
      ...Typography.caption,
      color: colors.textLight,
      marginTop: -Spacing.xs,
      marginBottom: Spacing.sm,
    },
  });

export default ProfileHealthScreen;
