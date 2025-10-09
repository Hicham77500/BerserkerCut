/**
 * Écran de profil utilisateur avec gestion interactive des compléments.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Typography, Spacing, BorderRadius, Shadows, ThemePalette } from '@/utils/theme';
import { Supplement, TrainingDay } from '@/types';
import { Card, Button } from '@/components';
import { getSecureItem } from '@/utils/storage/secureStorage';
import { CLOUD_CONSENT_STORAGE_KEY } from '@/constants/storageKeys';
import photoStorage from '@/services/photoStorage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ProfileRoute =
  | 'Profil santé'
  | 'Objectifs'
  | 'Entraînement'
  | 'Suppléments'
  | 'Photos'
  | 'Confidentialité';

const SUPPLEMENT_TIMING_OPTIONS: Array<{ value: Supplement['timing']; label: string }> = [
  { value: 'morning', label: 'Matin' },
  { value: 'pre_workout', label: 'Pré-entraînement' },
  { value: 'post_workout', label: 'Post-entraînement' },
  { value: 'evening', label: 'Soir' },
  { value: 'with_meals', label: 'Avec repas' },
];

const TIMING_LABEL_MAP = SUPPLEMENT_TIMING_OPTIONS.reduce<Record<Supplement['timing'], string>>(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {
    morning: 'Matin',
    pre_workout: 'Pré-entraînement',
    post_workout: 'Post-entraînement',
    evening: 'Soir',
    with_meals: 'Avec repas',
  }
);

const TIMING_ALIASES: Record<string, Supplement['timing']> = {
  morning: 'morning',
  matin: 'morning',
  preworkout: 'pre_workout',
  pre_workout: 'pre_workout',
  preWorkout: 'pre_workout',
  'pre-entraînement': 'pre_workout',
  postworkout: 'post_workout',
  post_workout: 'post_workout',
  postWorkout: 'post_workout',
  'post-entraînement': 'post_workout',
  evening: 'evening',
  soir: 'evening',
  with_meals: 'with_meals',
  withMeals: 'with_meals',
  repas: 'with_meals',
};

const normalizeTimingKey = (value: string): Supplement['timing'] => {
  if (!value) return 'with_meals';
  const normalized = value.toString().trim();
  const aliasKey = normalized in TIMING_ALIASES
    ? normalized
    : normalized.toLowerCase().replace(/[^a-z]/g, '_');
  return TIMING_ALIASES[aliasKey] ?? TIMING_ALIASES[normalized] ?? 'with_meals';
};

const SECTION_KEYS = {
  personal: 'personal',
  metrics: 'metrics',
  training: 'training',
  lifestyle: 'lifestyle',
  supplements: 'supplements',
} as const;

type SectionKey = (typeof SECTION_KEYS)[keyof typeof SECTION_KEYS];

const getTimingLabel = (timing: string): string => {
  const key = normalizeTimingKey(timing);
  return TIMING_LABEL_MAP[key] ?? timing;
};

const normalizeUnit = (unit?: string): Supplement['unit'] | undefined => {
  if (!unit) return undefined;
  const formatted = unit.toLowerCase().trim();
  switch (formatted) {
    case 'gram':
    case 'grams':
    case 'g':
      return 'gram';
    case 'capsule':
    case 'capsules':
    case 'gélule':
    case 'gélules':
    case 'gelule':
    case 'gelules':
      return 'capsule';
    case 'ml':
    case 'milliliter':
    case 'milliliters':
    case 'millilitre':
    case 'millilitres':
      return 'milliliter';
    default:
      return undefined;
  }
};

const parseQuantity = (value: unknown): number | undefined => {
  if (value === null || value === undefined) return undefined;
  const numeric = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(numeric) && numeric > 0 ? Number(numeric.toFixed(3)) : undefined;
};

const sanitizeSupplementList = (list: Supplement[] = []): Supplement[] =>
  list.map((supplement) => {
    const timing = normalizeTimingKey(supplement.timing);
    const unit = normalizeUnit(supplement.unit);
    const quantity = parseQuantity(supplement.quantity);

    return {
      ...supplement,
      timing,
      ...(unit ? { unit } : {}),
      ...(quantity !== undefined ? { quantity } : {}),
    };
  });

export const ProfileOverviewScreen: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigation = useNavigation<any>();
  const { colors } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(false);
  const [supplementModalVisible, setSupplementModalVisible] = useState(false);
  const [newSupplement, setNewSupplement] = useState<{ name: string; dosage: string; timing: Supplement['timing'] }>({
    name: '',
    dosage: '',
    timing: 'morning',
  });
  const [supplementsState, setSupplementsState] = useState({
    available: [] as Supplement[],
    preferences: {
      preferNatural: false,
      budgetRange: 'medium' as 'low' | 'medium' | 'high',
      allergies: [] as string[],
    },
  });
  const [cloudConsent, setCloudConsent] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    personal: true,
    metrics: true,
    training: true,
    lifestyle: true,
    supplements: true,
  });

  const toggleSection = useCallback((key: SectionKey) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => {
    if (!user?.profile?.supplements) {
      setSupplementsState({
        available: [],
        preferences: {
          preferNatural: false,
          budgetRange: 'medium',
          allergies: [],
        },
      });
      return;
    }

    const supplements = user.profile.supplements;
    setSupplementsState({
      preferences: {
        preferNatural: supplements.preferences?.preferNatural ?? false,
        budgetRange: supplements.preferences?.budgetRange ?? 'medium',
        allergies: supplements.preferences?.allergies ?? [],
      },
      available: sanitizeSupplementList(supplements.available ?? []),
    });
  }, [user?.profile?.supplements]);

  const refreshPhotoState = useCallback(async () => {
    const consentValue = await getSecureItem(CLOUD_CONSENT_STORAGE_KEY);
    setCloudConsent(consentValue === 'true');
    const storedPhotos = await photoStorage.loadGallery();
    setPhotoCount(storedPhotos.length);
  }, []);

  useEffect(() => {
    refreshPhotoState();
  }, [refreshPhotoState]);

  useFocusEffect(
    useCallback(() => {
      refreshPhotoState();
    }, [refreshPhotoState])
  );

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const fallbackProfile = {
    name: '',
    objective: 'cutting' as const,
    allergies: [] as string[],
    foodPreferences: [] as string[],
    health: {
      weight: 0,
      height: 0,
      age: 0,
      gender: 'male' as const,
      activityLevel: 'moderate' as const,
      averageSleepHours: 8,
      dataSource: {
        type: 'manual' as const,
        isConnected: false,
        permissions: [] as string[],
      },
      lastUpdated: new Date(),
      isManualEntry: true,
    },
    training: {
      trainingDays: [] as TrainingDay[],
      experienceLevel: 'beginner' as const,
      preferredTimeSlots: ['evening'] as Array<'morning' | 'afternoon' | 'evening'>,
    },
  };

  const effectiveProfile = user?.profile ?? fallbackProfile;
  const { health, training, objective, allergies, foodPreferences } = effectiveProfile;
  const isAuthenticated = Boolean(user);

  const bmi = health.height > 0
    ? health.weight / Math.pow(health.height / 100, 2)
    : null;

  const objectiveLabel = ({
    cutting: '🔥 Sèche',
    recomposition: '💪 Recomposition',
    maintenance: '⚖️ Maintien',
  } as const)[objective] ?? 'Objectif à définir';

  const experienceLabel = ({
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
  } as const)[training.experienceLevel] ?? 'Non défini';

  const preferredSlotLabels = training.preferredTimeSlots.length
    ? training.preferredTimeSlots
        .map((slot) => ({
          morning: 'Matin',
          afternoon: 'Après-midi',
          evening: 'Soir',
        }[slot] ?? slot))
        .join(', ')
    : 'Non défini';

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const trainingFrequency = training.trainingDays.length
    ? `${training.trainingDays.length} jour(s)/semaine`
    : 'À définir';
  const trainingDaysList = training.trainingDays.length
    ? training.trainingDays
        .map((day) => dayNames[day.dayOfWeek] ?? 'Jour inconnu')
        .join(', ')
    : 'Non défini';

  const availableSupplements = useMemo(
    () => sanitizeSupplementList(supplementsState.available ?? []),
    [supplementsState.available]
  );
  const supplementsByTiming = useMemo(() => {
    const grouped: Record<Supplement['timing'], Supplement[]> = {
      morning: [],
      pre_workout: [],
      post_workout: [],
      evening: [],
      with_meals: [],
    };
    availableSupplements.forEach((supplement) => {
      const key = normalizeTimingKey(supplement.timing);
      grouped[key] = [...grouped[key], { ...supplement, timing: key }];
    });
    return grouped;
  }, [availableSupplements]);

  const handlePersistSupplements = async (updatedList: Supplement[]) => {
    const preferences = supplementsState?.preferences ?? {
      preferNatural: false,
      budgetRange: 'medium',
      allergies: [],
    };
    await updateProfile({
      supplements: {
        available: updatedList,
        preferences,
      },
    });
  };

  const handleToggleSupplementAvailability = async (supplementId: string) => {
    if (!supplementsState) return;
    const updated = supplementsState.available.map((supplement) =>
      supplement.id === supplementId
        ? { ...supplement, available: !supplement.available }
        : supplement
    );

    setSupplementsState({ ...supplementsState, available: updated });
    try {
      await handlePersistSupplements(updated);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la disponibilité.');
      setSupplementsState(supplementsState); // revert
    }
  };

  const handleRemoveSupplement = async (supplementId: string) => {
    if (!supplementsState) return;

    Alert.alert(
      'Supprimer ce supplément ?',
      'Cette action retirera le supplément de votre liste personnelle.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updated = supplementsState.available.filter((supplement) => supplement.id !== supplementId);
            setSupplementsState({ ...supplementsState, available: updated });
            try {
              await handlePersistSupplements(updated);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le supplément.');
              setSupplementsState(supplementsState);
            }
          },
        },
      ]
    );
  };

  const handleCreateSupplement = async () => {
    if (!newSupplement.name.trim() || !newSupplement.dosage.trim()) {
      Alert.alert('Champs requis', 'Merci de renseigner un nom et un dosage.');
      return;
    }

    const timing = normalizeTimingKey(newSupplement.timing);

    const newEntry: Supplement = {
      id: `supplement-${Date.now()}`,
      name: newSupplement.name.trim(),
      dosage: newSupplement.dosage.trim(),
      timing,
      type: 'other',
      available: true,
    };

    const updatedList = sanitizeSupplementList([...availableSupplements, newEntry]);
    setSupplementsState((prev) => ({
      preferences: prev?.preferences ?? {
        preferNatural: false,
        budgetRange: 'medium',
        allergies: [],
      },
      available: updatedList,
    }));
    setSupplementModalVisible(false);
    setNewSupplement({ name: '', dosage: '', timing: 'morning' });

    try {
      await handlePersistSupplements(updatedList);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le supplément.');
      setSupplementsState((prev) => prev ? { ...prev, available: availableSupplements } : prev);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
  <StatusBar barStyle="light-content" />
        <View style={[styles.container, styles.centeredFallback]}>
          <Text style={styles.errorText}>Veuillez vous connecter pour accéder à votre profil.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canNavigateToRoute = (nav: any, route: string): boolean => {
    if (!nav || typeof nav.getState !== 'function') {
      return false;
    }
    const state = nav.getState();
    return Array.isArray(state?.routeNames) && state.routeNames.includes(route);
  };

  const navigateToProfileScreen = (route: ProfileRoute) => {
    if (canNavigateToRoute(navigation, route)) {
      navigation.navigate(route as never);
      return;
    }

    const parent = navigation.getParent?.();
    if (parent && canNavigateToRoute(parent, 'ProfileStack')) {
      parent.navigate('ProfileStack' as never, { screen: route } as never);
      return;
    }

    Alert.alert(
      'Navigation indisponible',
      "Cette section n'est pas accessible dans cette interface. Activez l'interface moderne pour y accéder."
    );
    console.warn(`[ProfileOverview] Route ${route} introuvable dans les navigateurs actifs.`);
  };

  const quickActionsItems: Array<{ label: string; route: ProfileRoute }> = [
    { label: 'Santé', route: 'Profil santé' },
    { label: 'Objectifs', route: 'Objectifs' },
    { label: 'Training', route: 'Entraînement' },
    { label: 'Suppl.', route: 'Suppléments' },
    { label: 'Photos', route: 'Photos' },
    { label: 'Confidentialité', route: 'Confidentialité' },
  ];

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
  <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >

        <Text style={styles.title}>Résumé BerserkerCut</Text>

        <View style={styles.section}>
          <Text style={styles.subtitle}>Objectif actuel</Text>
          <Text style={styles.content}>{objectiveLabel}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subtitle}>Synchronisation iCloud</Text>
          <Text style={styles.content}>{cloudConsent ? 'Activée' : 'Local uniquement'}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subtitle}>Photos stockées</Text>
          <Text style={styles.content}>{photoCount}</Text>
        </View>
        <Button
          title="Gérer la confidentialité"
          variant="outline"
          onPress={() => navigateToProfileScreen('Confidentialité')}
          fullWidth
          style={styles.overviewButton}
        />
        <Button
          title={`Galerie photo (${photoCount})`}
          onPress={() => navigateToProfileScreen('Photos')}
          fullWidth
          style={styles.overviewButton}
        />

        <Card style={styles.rgpdCard}>
          <Text style={styles.sectionTitle}>Note RGPD</Text>
          <Text style={styles.rgpdText}>
            Les données de santé (poids, photos, sommeil) demeurent chiffrées sur cet appareil. Aucun upload n'est
            réalisé sans votre accord explicite. Activez la synchronisation iCloud depuis la section Confidentialité.
          </Text>
        </Card>

        {/* Informations personnelles */}
        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(SECTION_KEYS.personal)}
            activeOpacity={0.85}
          >
            <Text style={[styles.sectionTitle, styles.sectionHeaderTitle]}>Informations personnelles</Text>
            <Text style={styles.sectionChevron}>{expandedSections.personal ? '−' : '+'}</Text>
          </TouchableOpacity>

          {expandedSections.personal && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nom :</Text>
                <Text style={styles.infoValue}>{effectiveProfile.name || 'Non renseigné'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email :</Text>
                <Text style={styles.infoValue}>{user?.email ?? 'Non renseigné'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Âge :</Text>
                <Text style={styles.infoValue}>{health.age ? `${health.age} ans` : 'Non défini'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sexe :</Text>
                <Text style={styles.infoValue}>{health.gender === 'male' ? 'Homme' : 'Femme'}</Text>
              </View>
            </>
          )}
        </Card>

        {/* Mesures physiques */}
        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(SECTION_KEYS.metrics)}
            activeOpacity={0.85}
          >
            <Text style={[styles.sectionTitle, styles.sectionHeaderTitle]}>Mesures physiques</Text>
            <Text style={styles.sectionChevron}>{expandedSections.metrics ? '−' : '+'}</Text>
          </TouchableOpacity>

          {expandedSections.metrics && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Taille :</Text>
                <Text style={styles.infoValue}>{health.height ? `${health.height} cm` : 'Non défini'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Poids :</Text>
                <Text style={styles.infoValue}>{health.weight ? `${health.weight} kg` : 'Non défini'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>IMC :</Text>
                <Text style={styles.infoValue}>{bmi ? bmi.toFixed(1) : '—'}</Text>
              </View>
            </>
          )}
        </Card>

        {/* Objectifs d'entraînement */}
        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(SECTION_KEYS.training)}
            activeOpacity={0.85}
          >
            <Text style={[styles.sectionTitle, styles.sectionHeaderTitle]}>Objectifs d'entraînement</Text>
            <Text style={styles.sectionChevron}>{expandedSections.training ? '−' : '+'}</Text>
          </TouchableOpacity>

          {expandedSections.training && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Objectif principal :</Text>
                <Text style={styles.infoValue}>{objectiveLabel}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expérience :</Text>
                <Text style={styles.infoValue}>{experienceLabel}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Jours d'entraînement :</Text>
                <Text style={styles.infoValue}>{trainingFrequency}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Créneaux privilégiés :</Text>
                <Text style={styles.infoValue}>{preferredSlotLabels}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Séances planifiées :</Text>
                <Text style={styles.infoValue}>{trainingDaysList}</Text>
              </View>
            </>
          )}
        </Card>

        {/* Allergies et préférences */}
        <Card style={styles.card}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(SECTION_KEYS.lifestyle)}
            activeOpacity={0.85}
          >
            <Text style={[styles.sectionTitle, styles.sectionHeaderTitle]}>Allergies & Préférences</Text>
            <Text style={styles.sectionChevron}>{expandedSections.lifestyle ? '−' : '+'}</Text>
          </TouchableOpacity>

          {expandedSections.lifestyle && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Allergies :</Text>
                <Text style={styles.infoValue}>
                  {allergies.length ? allergies.join(', ') : 'Aucune'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Préférences alimentaires :</Text>
                <Text style={styles.infoValue}>
                  {foodPreferences.length ? foodPreferences.join(', ') : 'Aucune'}
                </Text>
              </View>
            </>
          )}
        </Card>

        {/* Suppléments */}
        <Card style={styles.card}>
          <View style={styles.sectionHeaderWithAction}>
            <TouchableOpacity
              style={styles.sectionToggle}
              onPress={() => toggleSection(SECTION_KEYS.supplements)}
              activeOpacity={0.85}
            >
              <Text style={[styles.sectionTitle, styles.sectionHeaderTitle]}>Suppléments personnels</Text>
              <Text style={styles.sectionChevron}>{expandedSections.supplements ? '−' : '+'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setSupplementModalVisible(true)}
            >
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>

          {expandedSections.supplements && (
            availableSupplements.length === 0 ? (
              <Text style={styles.emptySupplementText}>
                Aucun supplément enregistré. Touchez « Ajouter » pour commencer.
              </Text>
            ) : (
              Object.entries(supplementsByTiming)
                .filter(([, supplements]) => supplements.length > 0)
                .map(([timing, supplements]) => (
                  <View key={timing} style={styles.supplementSection}>
                    <Text style={styles.supplementTitle}>{getTimingLabel(timing)}</Text>
                    {supplements.map((supplement) => (
                      <TouchableOpacity
                        key={supplement.id}
                        style={[styles.supplementRow, !supplement.available && styles.supplementRowInactive]}
                        onPress={() => handleToggleSupplementAvailability(supplement.id)}
                        onLongPress={() => handleRemoveSupplement(supplement.id)}
                        delayLongPress={350}
                      >
                        <View>
                          <Text style={styles.supplementName}>{supplement.name}</Text>
                          <Text style={styles.supplementDetails}>{supplement.dosage}</Text>
                        </View>
                        <Text style={styles.supplementStatus}>
                          {supplement.available ? 'Actif' : 'Inactif'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))
            )
          )}
        </Card>

        {/* Actions */}
        <Card style={[styles.card, styles.actionsCard]}>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
            disabled={loading}
          >
            <Text style={styles.logoutButtonText}>
              {loading ? 'Déconnexion...' : 'Se déconnecter'}
            </Text>
          </TouchableOpacity>
        </Card>

        </ScrollView>
      </View>

      <Modal
        visible={supplementModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSupplementModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un supplément</Text>
            <TextInput
              placeholder="Nom du supplément"
              value={newSupplement.name}
              onChangeText={(text) => setNewSupplement((prev) => ({ ...prev, name: text }))}
              style={styles.modalInput}
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              placeholder="Dosage (ex: 5 g après le dîner)"
              value={newSupplement.dosage}
              onChangeText={(text) => setNewSupplement((prev) => ({ ...prev, dosage: text }))}
              style={styles.modalInput}
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.timingPicker}>
              {SUPPLEMENT_TIMING_OPTIONS.map(({ value, label }) => {
                const isActive = normalizeTimingKey(newSupplement.timing) === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.timingChip, isActive && styles.timingChipActive]}
                    onPress={() => setNewSupplement((prev) => ({ ...prev, timing: value }))}
                  >
                    <Text style={[styles.timingChipText, isActive && styles.timingChipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  setSupplementModalVisible(false);
                  setNewSupplement({ name: '', dosage: '', timing: 'morning' });
                }}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={handleCreateSupplement}
              >
                <Text style={styles.modalConfirmText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.md,
    },
    header: {
      backgroundColor: colors.background,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.md,
    },
    headerTextGroup: {
      gap: Spacing.xs,
    },
    quickActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginTop: Spacing.sm,
    },
    quickActionChip: {
      backgroundColor: colors.surface,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.round,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickActionText: {
      ...Typography.caption,
      color: colors.text,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    title: {
      ...Typography.h1,
      marginBottom: Spacing.sm,
      color: colors.text,
    },
    subtitle: {
      ...Typography.body,
      color: colors.textLight,
    },
    card: {
      backgroundColor: colors.surface,
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      ...Shadows.sm,
    },
    overviewCard: {
      backgroundColor: colors.surface,
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      ...Shadows.md,
      gap: Spacing.sm,
    },
    overviewButton: {
      marginTop: Spacing.xs,
    },
    rgpdCard: {
      backgroundColor: colors.secondaryLight,
      padding: Spacing.lg,
      borderRadius: BorderRadius.lg,
      gap: Spacing.sm,
    },
    rgpdText: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
    contentContainer: {
      flexGrow: 1,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.xl * 2,
      paddingHorizontal: Spacing.lg,
      gap: Spacing.lg,
    },
    section: {
      marginBottom: Spacing.md,
    },
    content: {
      ...Typography.body,
      color: colors.text,
    },
    sectionTitle: {
      ...Typography.h3,
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    sectionHeaderTitle: {
      marginBottom: 0,
    },
    sectionChevron: {
      ...Typography.h3,
      color: colors.textLight,
      marginBottom: 0,
    },
    sectionHeaderWithAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    sectionToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: Spacing.sm,
    },
    infoLabel: {
      ...Typography.body,
      color: colors.textLight,
      flex: 1,
    },
    infoValue: {
      ...Typography.body,
      color: colors.text,
      fontWeight: '600',
      flex: 1,
      textAlign: 'right',
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.round,
    },
    addButtonText: {
      ...Typography.caption,
      color: colors.background,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    emptySupplementText: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
    supplementSection: {
      marginTop: Spacing.sm,
      marginBottom: Spacing.sm,
      gap: Spacing.xs,
    },
    supplementTitle: {
      ...Typography.caption,
      color: colors.textLight,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    supplementRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    supplementRowInactive: {
      opacity: 0.5,
    },
    supplementName: {
      ...Typography.body,
      color: colors.text,
    },
    supplementDetails: {
      ...Typography.caption,
      color: colors.textLight,
      marginTop: 4,
    },
    supplementStatus: {
      ...Typography.caption,
      color: colors.text,
      fontWeight: '600',
    },
    actionsCard: {
      alignItems: 'center',
    },
    button: {
      width: '100%',
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },
    logoutButton: {
      backgroundColor: colors.primary,
    },
    logoutButtonText: {
      ...Typography.button,
      color: '#fff',
    },
    errorText: {
      ...Typography.body,
      color: colors.error,
      textAlign: 'center',
      marginTop: Spacing.xl,
    },
    centeredFallback: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.overlayLight,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    modalContent: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    modalTitle: {
      ...Typography.h3,
      color: colors.text,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      ...Typography.body,
      color: colors.text,
      backgroundColor: colors.background,
    },
    timingPicker: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    timingChip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.round,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      backgroundColor: colors.background,
    },
    timingChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    timingChipText: {
      ...Typography.caption,
      color: colors.text,
      fontWeight: '600',
    },
    timingChipTextActive: {
      color: colors.textDark,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: Spacing.sm,
    },
    modalButton: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
    },
    modalCancel: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalConfirm: {
      backgroundColor: colors.primary,
    },
    modalCancelText: {
      ...Typography.bodySmall,
      color: colors.text,
    },
    modalConfirmText: {
      ...Typography.bodySmall,
      color: colors.textDark,
      fontWeight: '600',
    },
  });

export default ProfileOverviewScreen;
