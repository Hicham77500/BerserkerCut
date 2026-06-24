/**
 * Module: src/screens/profile/ProfilePrivacyScreen.tsx
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, StyleSheet, Switch, Alert, Linking, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Card, Button } from '@/components';
import { Typography, Spacing, BorderRadius, ThemePalette } from '@/utils/theme';
import { CLOUD_CONSENT_STORAGE_KEY, CLOUD_CONSENT_AUDIT_STORAGE_KEY } from '@/constants/storageKeys';
import { getSecureItem, setSecureItem, clearAllSensitiveData, getSecureJSON, setSecureJSON } from '@/utils/storage/secureStorage';
import { useThemeMode } from '@/hooks/useThemeMode';
import PhotoService from '@/services/photo';
import photoStorage from '@/services/photoStorage';
import { exportAIRecapToJsonFile } from '@/services/aiExport';

type ConsentAuditAction = 'enabled' | 'disabled';

type ConsentAuditEntry = {
  at: number;
  action: ConsentAuditAction;
  removeCloudAlbum: boolean;
};

const MAX_AUDIT_ENTRIES = 10;

// Liste des clés à préserver lors du nettoyage des données sensibles
const CLOUD_KEYS = [CLOUD_CONSENT_STORAGE_KEY, CLOUD_CONSENT_AUDIT_STORAGE_KEY];

/**
 * Composant: ProfilePrivacyScreen
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
export const ProfilePrivacyScreen: React.FC = () => {
  const { user, deleteAccount } = useAuth();
  const { colors } = useThemeMode();
  const [cloudConsent, setCloudConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consentAudit, setConsentAudit] = useState<ConsentAuditEntry[]>([]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    (async () => {
      const [stored, audit] = await Promise.all([
        getSecureItem(CLOUD_CONSENT_STORAGE_KEY),
        getSecureJSON<ConsentAuditEntry[]>(CLOUD_CONSENT_AUDIT_STORAGE_KEY, []),
      ]);
      setCloudConsent(stored === 'true');
      setConsentAudit(Array.isArray(audit) ? audit : []);
    })();
  }, []);

/**
 * Fonction: logConsentAction
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const logConsentAction = async (entry: ConsentAuditEntry) => {
    const current = await getSecureJSON<ConsentAuditEntry[]>(CLOUD_CONSENT_AUDIT_STORAGE_KEY, []);
    const safeCurrent = Array.isArray(current) ? current : [];
    const next = [entry, ...safeCurrent].slice(0, MAX_AUDIT_ENTRIES);
    setConsentAudit(next);
    await setSecureJSON(CLOUD_CONSENT_AUDIT_STORAGE_KEY, next);
  };

/**
 * Fonction: disableCloudConsent
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const disableCloudConsent = async (clearCloudAlbum: boolean) => {
    await setSecureItem(CLOUD_CONSENT_STORAGE_KEY, 'false');
    setCloudConsent(false);
    await logConsentAction({
      at: Date.now(),
      action: 'disabled',
      removeCloudAlbum: clearCloudAlbum,
    });

    if (!clearCloudAlbum) {
      return;
    }

    setLoading(true);
    try {
      const removed = await PhotoService.clearAlbum();
      const localGallery = await photoStorage.loadGallery();
      const updated = localGallery.map((item) => ({ ...item, cloudSynced: false }));
      await photoStorage.setGallery(updated);

      Alert.alert(
        'Consentement retiré',
        removed
          ? `${removed} photo${removed > 1 ? 's' : ''} retirée${removed > 1 ? 's' : ''} de l'album BerserkerCut.`
          : "Consentement retiré. Aucune photo n'était présente dans l'album BerserkerCut."
      );
    } catch (error) {
      console.warn('[ProfilePrivacyScreen] disable cloud + clear error', error);
      Alert.alert('Erreur', "Le consentement a été retiré mais la suppression iCloud a échoué.");
    } finally {
      setLoading(false);
    }
  };

/**
 * Fonction: updateConsent
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
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
              await logConsentAction({
                at: Date.now(),
                action: 'enabled',
                removeCloudAlbum: false,
              });
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Désactiver le stockage cloud ?',
      "Vous pouvez simplement arrêter les futurs envois iCloud, ou retirer aussi les photos déjà présentes dans l'album BerserkerCut.",
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver seulement',
          onPress: async () => {
            await disableCloudConsent(false);
          },
        },
        {
          text: 'Désactiver et retirer iCloud',
          style: 'destructive',
          onPress: async () => {
            await disableCloudConsent(true);
          },
        },
      ]
    );
  };

/**
 * Fonction: handleClearCloudData
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
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

/**
 * Fonction: handleClearLocalData
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
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

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Supprimer le compte ? ',
      'Cette action est irréversible. Votre compte et ses données seront supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer définitivement',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await photoStorage.clearAll();
              await clearAllSensitiveData(CLOUD_KEYS);
              await deleteAccount();
            } catch (error) {
              Alert.alert('Erreur', "Impossible de supprimer le compte pour le moment.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [deleteAccount]);

  const handleExportAIData = useCallback(async () => {
    if (!user) {
      Alert.alert('Compte requis', 'Connectez-vous pour exporter vos données IA.');
      return;
    }

    setLoading(true);
    try {
      const result = await exportAIRecapToJsonFile(user);
      Alert.alert(
        'Export prêt',
        `Votre dossier IA a été généré.\n\nFichier: ${result.uri}\nTaille: ${result.size} caractères JSON.\n\nCe fichier peut être transmis à une IA pour un récap et des recommandations d\'objectif.`
      );
    } catch (error) {
      console.warn('[ProfilePrivacyScreen] export AI data error', error);
      Alert.alert('Erreur', "Impossible d'exporter les données IA pour le moment.");
    } finally {
      setLoading(false);
    }
  }, [user]);

/**
 * Fonction: formatAuditLabel
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const formatAuditLabel = (entry: ConsentAuditEntry): string => {
    const actionLabel = entry.action === 'enabled'
      ? 'Consentement activé'
      : entry.removeCloudAlbum
      ? 'Consentement retiré + album iCloud nettoyé'
      : 'Consentement retiré';

    const when = new Date(entry.at).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${actionLabel} le ${when}`;
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Confidentialité & RGPD</Text>
          <Text style={styles.subtitle}>
            BerserkerCut traite vos données de santé avec soin. Par défaut, les photos restent dans le stockage local
            de l'application sur votre appareil. Vous pouvez activer ou retirer la synchronisation iCloud à tout moment.
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

          <Button
            title={loading ? 'Export en cours...' : 'Exporter mon dossier IA (JSON)'}
            variant="outline"
            onPress={handleExportAIData}
            disabled={loading}
            style={styles.button}
          />

          <View style={styles.accountActions}>
            <Button
              title="Supprimer le compte"
              variant="danger"
              onPress={handleDeleteAccount}
              disabled={loading}
              style={styles.button}
            />
          </View>

          <View style={styles.auditBlock}>
            <Text style={styles.auditTitle}>Journal du consentement cloud</Text>
            {consentAudit.length === 0 ? (
              <Text style={styles.auditEmpty}>Aucun événement enregistré pour le moment.</Text>
            ) : (
              consentAudit.map((entry) => (
                <Text
                  key={`${entry.at}-${entry.action}-${entry.removeCloudAlbum ? 'clear' : 'keep'}`}
                  style={styles.auditItem}
                >
                  • {formatAuditLabel(entry)}
                </Text>
              ))
            )}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Politique de confidentialité</Text>
          <Text style={styles.sectionText}>
            • Consentement photo : aucune image n'est envoyée sans activation explicite du cloud.
          </Text>
          <Text style={styles.sectionText}>
            • Conservation : les photos locales restent présentes jusqu'à suppression manuelle par l'utilisateur.
          </Text>
          <Text style={styles.sectionText}>
            • Cloud iOS : si activé, les photos sont copiées dans l'album iCloud BerserkerCut et supprimables depuis l'app.
          </Text>
          <Text style={styles.sectionText}>
            • Usage commercial : aucune donnée personnelle, de santé, de nutrition ou de photo n'est récupérée, analysée ou traitée à des fins commerciales, publicitaires ou de revente.
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
    accountActions: {
      marginTop: Spacing.xs,
      gap: Spacing.sm,
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
    auditBlock: {
      marginTop: Spacing.xs,
      paddingTop: Spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      gap: Spacing.xs,
    },
    auditTitle: {
      ...Typography.h4,
      color: colors.text,
    },
    auditEmpty: {
      ...Typography.caption,
      color: colors.textLight,
    },
    auditItem: {
      ...Typography.caption,
      color: colors.textLight,
    },
  });

export default ProfilePrivacyScreen;
