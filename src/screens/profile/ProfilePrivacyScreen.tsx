import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, StyleSheet, Switch, Alert, Linking, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button } from '@/components';
import { Typography, Spacing, BorderRadius, ThemePalette } from '@/utils/theme';
import { CLOUD_CONSENT_STORAGE_KEY } from '@/constants/storageKeys';
import { getSecureItem, setSecureItem, clearAllSensitiveData } from '@/utils/storage/secureStorage';
import { useThemeMode } from '@/hooks/useThemeMode';
import PhotoService from '@/services/photo';
import photoStorage from '@/services/photoStorage';

// Liste des clés à préserver lors du nettoyage des données sensibles
const CLOUD_KEYS = ['BERSERKERCUT_CLOUD_CONSENT_V1'];

export const ProfilePrivacyScreen: React.FC = () => {
  const { user } = useAuth();
  const { colors } = useThemeMode();
  const [cloudConsent, setCloudConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    (async () => {
      const stored = await getSecureItem(CLOUD_CONSENT_STORAGE_KEY);
      setCloudConsent(stored === 'true');
    })();
  }, []);

  const updateConsent = async (nextValue: boolean) => {
    if (nextValue) {
      Alert.alert(
        'Activer le stockage cloud ?',
        "Vos photos seront synchronisées avec la photothèque iCloud (album BerserkerCut). Vous pourrez retirer votre consentement à tout moment.",
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: "Activer",
            onPress: async () => {
              await setSecureItem(CLOUD_CONSENT_STORAGE_KEY, 'true');
              setCloudConsent(true);
            },
          },
        ]
      );
      return;
    }

    await setSecureItem(CLOUD_CONSENT_STORAGE_KEY, 'false');
    setCloudConsent(false);
  };

  const handleClearCloudData = () => {
    Alert.alert(
      'Retirer les photos iCloud ?',
      "Les photos seront retirées de l'album BerserkerCut dans votre Photothèque iCloud. Elles resteront disponibles dans votre bibliothèque personnelle.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const removed = await PhotoService.clearAlbum();
              const localGallery = await photoStorage.loadGallery();
              const updated = localGallery.map((item) => ({ ...item, cloudSynced: false }));
              await photoStorage.setGallery(updated);

              Alert.alert(
                'Album iCloud mis à jour',
                removed
                  ? `${removed} photo${removed > 1 ? 's' : ''} retirée${removed > 1 ? 's' : ''} de l'album BerserkerCut.`
                  : 'Aucune photo à retirer pour le moment.'
              );
            } catch (error) {
              console.warn('[ProfilePrivacyScreen] clear iCloud error', error);
              Alert.alert('Erreur', "Impossible de retirer les photos iCloud pour le moment.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearLocalData = () => {
    Alert.alert(
      'Supprimer les données locales sensibles ?',
      'Toutes les photos et données biométriques stockées localement seront effacées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await photoStorage.clearAll();
              await clearAllSensitiveData(CLOUD_KEYS);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenPolicy = useCallback(() => {
    const url = 'https://berserkercut.com/privacy';
    Linking.openURL(url).catch(() =>
      Alert.alert('Lien indisponible', "Consultez berserkercut.com/privacy depuis votre navigateur.")
    );
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Confidentialité & RGPD</Text>
          <Text style={styles.subtitle}>
            BerserkerCut traite vos données de santé avec soin. Par défaut, vos photos et informations biométriques
            restent chiffrées sur votre appareil. Vous pouvez activer la synchronisation cloud à tout moment.
          </Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelGroup}>
              <Text style={styles.sectionTitle}>Stockage cloud des photos</Text>
              <Text style={styles.sectionText}>Compte : {user?.email ?? 'non connecté'}</Text>
            </View>
            <Switch
              value={cloudConsent}
              onValueChange={updateConsent}
              thumbColor={cloudConsent ? colors.primary : colors.textMuted}
              trackColor={{ true: colors.primary + '55', false: colors.border }}
            />
          </View>

          <Button
            title="Supprimer mes données cloud"
            variant="outline"
            onPress={handleClearCloudData}
            style={styles.button}
          />

          <Button
            title={loading ? 'Suppression...' : 'Supprimer mes données locales sensibles'}
            variant="danger"
            onPress={handleClearLocalData}
            disabled={loading}
            loading={loading}
            style={styles.button}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Politique de confidentialité</Text>
          <Text style={styles.sectionText}>
            • Consentement photo : aucune image n'est envoyée sans activation explicite du cloud.
          </Text>
          <Text style={styles.sectionText}>
            • Conservation : localement sans limitation (chiffré), cloud 90 jours maximum avant purge automatique (TODO backend).
          </Text>
          <Text style={styles.sectionText}>
            • Données partagées : uniquement macros agrégées et anonymisées pour les recommandations IA futures.
          </Text>
          <Button
            title="Consulter la politique complète"
            variant="ghost"
            onPress={handleOpenPolicy}
            style={styles.button}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: Spacing.lg,
      gap: Spacing.lg,
    },
    card: {
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      backgroundColor: colors.surface,
      gap: Spacing.md,
    },
    title: {
      ...Typography.h2,
    },
    subtitle: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
    sectionTitle: {
      ...Typography.h3,
      color: colors.text,
    },
    sectionText: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
    button: {
      width: '100%',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.md,
    },
    switchLabelGroup: {
      flex: 1,
      gap: Spacing.xs,
    },
  });

export default ProfilePrivacyScreen;
