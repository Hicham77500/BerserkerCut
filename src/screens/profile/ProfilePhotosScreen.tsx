import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  Switch,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Card, Button } from '@/components';
import { Typography, Spacing, BorderRadius, ThemePalette } from '@/utils/theme';
import { getSecureItem, setSecureItem } from '@/utils/storage/secureStorage';
import { CLOUD_CONSENT_STORAGE_KEY } from '@/constants/storageKeys';
import PhotoService from '@/services/photo';
import { useThemeMode } from '@/hooks/useThemeMode';
import { SafeAreaView } from 'react-native-safe-area-context';
import photoStorage, { StoredPhoto } from '@/services/photoStorage';
import { useFocusEffect } from '@react-navigation/native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MAX_PHOTOS = photoStorage.MAX_GALLERY_PHOTOS;

export const ProfilePhotosScreen: React.FC = () => {
  const { colors } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [photos, setPhotos] = useState<StoredPhoto[]>([]);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [cloudConsent, setCloudConsent] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<string | null>(null);
  const photosRef = useRef<StoredPhoto[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        const stored = await photoStorage.loadGallery();
        const consentValue = await getSecureItem(CLOUD_CONSENT_STORAGE_KEY);
        if (isActive) {
          setPhotos(stored);
          setCloudConsent(consentValue === 'true');
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const syncFromCloud = useCallback(
    async (localFallback?: StoredPhoto[], force = false) => {
      if (!cloudConsent && !force) return;
      setSyncingCloud(true);
      setCloudStatus('Synchronisation iCloud en cours…');
      try {
        const remote = await PhotoService.listPhotos();
        if (!remote || remote.length === 0) {
          setCloudStatus('Aucune photo iCloud disponible');
          return;
        }
        const baseSource = localFallback && localFallback.length ? localFallback : photosRef.current;
        const baseList = baseSource.length ? baseSource : await photoStorage.loadGallery();
        const mergedMap = new Map<string, StoredPhoto>();

        baseList.forEach((item) => {
          const key = item.id ?? `local-${item.timestamp}`;
          mergedMap.set(key, item);
        });

        for (const record of remote) {
          const identifier = record.id ?? `remote-${record.timestamp}`;
          const timestamp = record.timestamp ?? Date.now();
          const sourceUri = record.localUri ?? record.uri;
          const managedUri = await photoStorage.ensureLocalCopy(sourceUri, identifier);

          const existing = mergedMap.get(identifier);
          mergedMap.set(identifier, {
            ...(existing ?? {}),
            id: identifier,
            uri: managedUri,
            timestamp,
            cloudSynced: true,
          });
        }

        const trimmed = Array.from(mergedMap.values())
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(-MAX_PHOTOS);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPhotos(trimmed);
        await photoStorage.setGallery(trimmed);
        setCloudStatus('Synchronisation iCloud terminée');
      } catch (error) {
        console.warn('[ProfilePhotosScreen] syncFromCloud error', error);
        setCloudStatus("Erreur lors de la synchronisation avec iCloud");
      } finally {
        setSyncingCloud(false);
        setTimeout(() => setCloudStatus(null), 2000);
      }
    },
    [cloudConsent]
  );

  useEffect(() => {
    (async () => {
      const stored = await photoStorage.loadGallery();
      setPhotos(stored);
      const consentValue = await getSecureItem(CLOUD_CONSENT_STORAGE_KEY);
      const consentEnabled = consentValue === 'true';
      setCloudConsent(consentEnabled);
      if (consentEnabled) {
        await syncFromCloud(stored);
      }
    })();
  }, [syncFromCloud]);

  const requestCameraPermission = async (): Promise<boolean> => {
    setIsRequestingPermission(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert(
          'Permission refusée',
          'La caméra est nécessaire pour prendre des photos. Vous pouvez modifier cela dans les réglages.'
        );
        return false;
      }
      return true;
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const timestamp = Date.now();
    const identifier = `profile-${timestamp}`;
    const managedUri = await photoStorage.ensureLocalCopy(result.assets[0].uri, identifier);

    const newPhoto: StoredPhoto = {
      id: identifier,
      uri: managedUri,
      timestamp,
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const trimmed = await photoStorage.pushToGallery(newPhoto);
    setPhotos(trimmed);

    if (cloudConsent) {
      setSyncingCloud(true);
      setCloudStatus('Synchronisation iCloud en cours…');
      PhotoService.uploadPhoto(newPhoto)
        .then((record) => {
          if (!record) return;
          setPhotos((prev) => {
            const updated = prev.map((item) =>
              item.timestamp === newPhoto.timestamp
                ? { ...item, id: record.id, cloudSynced: true }
                : item
            );
            void photoStorage.setGallery(updated);
            return updated;
          });
          setCloudStatus('Photo synchronisée sur iCloud');
        })
        .catch((error) => {
          console.warn('[ProfilePhotosScreen] upload error', error);
          setCloudStatus("Upload iCloud différé");
        })
        .finally(() => {
          setSyncingCloud(false);
          setTimeout(() => setCloudStatus(null), 2000);
        });
    }
  };

  const handleDeletePhoto = (timestamp: number) => {
    Alert.alert('Supprimer la photo ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          const { next, removed } = await photoStorage.removeFromGallery(timestamp);
          setPhotos(next);
          if (removed?.id && cloudConsent) {
            PhotoService.deletePhoto(removed.id).catch((error) =>
              console.warn('[ProfilePhotosScreen] delete error', error)
            );
          }
          await photoStorage.removeMealPhotosByTimestamp(timestamp);
        },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Effacer toutes les photos ?', 'Toutes vos photos locales seront supprimées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          await photoStorage.clearAll();
          setPhotos([]);
        },
      },
    ]);
  };

  const handleConsentToggle = async (nextValue: boolean) => {
    if (nextValue) {
      Alert.alert(
        'Activer la synchronisation cloud ?',
        'Vos photos seront sauvegardées dans votre photothèque iCloud (album BerserkerCut). Vous pourrez retirer votre consentement à tout moment.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Activer',
            onPress: async () => {
              await setSecureItem(CLOUD_CONSENT_STORAGE_KEY, 'true');
              setCloudConsent(true);
              setCloudStatus('Synchronisation en cours…');
              await syncFromCloud(photos, true);
            },
          },
        ]
      );
      return;
    }

    await setSecureItem(CLOUD_CONSENT_STORAGE_KEY, 'false');
    setCloudConsent(false);
    setCloudStatus(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.headerCard}>
          <Text style={styles.title}>Suivi photo</Text>
          <Text style={styles.subtitle}>
            Vos photos sont stockées localement, chiffrées sur cet appareil. Elles ne sont jamais
            envoyées sur iCloud sans votre consentement explicite.
          </Text>
          <View style={styles.switchRow}>
            <View style={styles.switchLabels}>
              <Text style={styles.sectionTitle}>Synchronisation iCloud</Text>
              <Text style={styles.switchSubtitle}>
                Activez pour sauvegarder vos photos dans l'album iCloud BerserkerCut.
              </Text>
            </View>
            <Switch
              value={cloudConsent}
              onValueChange={handleConsentToggle}
              thumbColor={cloudConsent ? colors.primary : colors.textMuted}
              trackColor={{ true: colors.primary + '55', false: colors.border }}
            />
          </View>

          <Button
            title={isRequestingPermission ? 'Obtention de la permission...' : 'Prendre une photo'}
            onPress={handleTakePhoto}
            loading={isRequestingPermission}
            fullWidth
          />
          <Button
            title="Effacer toutes les photos locales"
            variant="outline"
            onPress={handleClearAll}
            fullWidth
            style={styles.clearButton}
          />
          {cloudConsent && (
            <Button
              title={syncingCloud ? 'Synchronisation…' : 'Rafraîchir depuis iCloud'}
              variant="ghost"
              onPress={() => syncFromCloud(photos)}
              fullWidth
              loading={syncingCloud}
            />
          )}
          {cloudStatus ? (
            <Text style={styles.statusText}>{cloudStatus}</Text>
          ) : null}
        </Card>

        <Card style={styles.listCard}>
          <Text style={styles.sectionTitle}>Historique (max {MAX_PHOTOS} photos)</Text>
          {photos.length === 0 ? (
            <Text style={styles.emptyText}>Aucune photo enregistrée pour le moment.</Text>
          ) : (
            photos
              .slice()
              .reverse()
              .map((photo) => (
                <View key={photo.timestamp} style={styles.photoRow}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  <View style={styles.photoMeta}>
                    <Text style={styles.photoDate}>
                      {new Date(photo.timestamp).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <TouchableOpacity onPress={() => handleDeletePhoto(photo.timestamp)}>
                      <Text style={styles.deleteLink}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}
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
      flexGrow: 1,
      padding: Spacing.lg,
      gap: Spacing.lg,
    },
    headerCard: {
      gap: Spacing.md,
      backgroundColor: colors.surface,
    },
    listCard: {
      gap: Spacing.md,
      backgroundColor: colors.surface,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.md,
    },
    switchLabels: {
      flex: 1,
      paddingRight: Spacing.md,
      gap: Spacing.xs,
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
    switchSubtitle: {
      ...Typography.caption,
      color: colors.textLight,
    },
    emptyText: {
      ...Typography.body,
      color: colors.textLight,
    },
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
    },
    photo: {
      width: 96,
      height: 96,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.secondary,
    },
    photoMeta: {
      flex: 1,
      gap: Spacing.xs,
    },
    photoDate: {
      ...Typography.bodySmall,
      color: colors.text,
    },
    deleteLink: {
      ...Typography.caption,
      color: colors.error,
    },
    clearButton: {
      marginTop: Spacing.sm,
    },
    statusText: {
      ...Typography.caption,
      color: colors.textLight,
      textAlign: 'center',
    },
  });

export default ProfilePhotosScreen;
