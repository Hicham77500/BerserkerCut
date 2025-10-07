/**
 * Écran de profil utilisateur avec gestion interactive des compléments.
 */

import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../utils/theme';
import { Supplement, TrainingDay } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();
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
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.container, styles.centeredFallback]}>
          <Text style={styles.errorText}>Veuillez vous connecter pour accéder à votre profil.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }] }>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Mon Profil</Text>
          <Text style={styles.subtitle}>Gérez vos informations personnelles</Text>
        </View>
      </View>
      <ScrollView
        style={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >

      {/* Informations personnelles */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>

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
      </View>

      {/* Mesures physiques */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mesures physiques</Text>

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
      </View>

      {/* Objectifs d'entraînement */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Objectifs d'entraînement</Text>

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
      </View>

      {/* Allergies et préférences */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Allergies & Préférences</Text>

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
      </View>

      {/* Suppléments */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Suppléments personnels</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setSupplementModalVisible(true)}
          >
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {availableSupplements.length === 0 ? (
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
        )}
      </View>

      {/* Actions */}
      <View style={[styles.card, styles.actionsCard]}>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={styles.logoutButtonText}>
            {loading ? 'Déconnexion...' : 'Se déconnecter'}
          </Text>
        </TouchableOpacity>
      </View>

      </ScrollView>

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
              placeholderTextColor={Colors.textMuted}
            />
            <TextInput
              placeholder="Dosage (ex: 5 g après le dîner)"
              value={newSupplement.dosage}
              onChangeText={(text) => setNewSupplement((prev) => ({ ...prev, dosage: text }))}
              style={styles.modalInput}
              placeholderTextColor={Colors.textMuted}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadows.lg,
  },
  headerTextGroup: {
    gap: Spacing.xs,
  },
  title: {
    ...Typography.h2,
    color: Colors.textDark,
    textAlign: 'left',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textDark,
    opacity: 0.75,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  contentContainer: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.textLight,
    flex: 1,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  addButtonText: {
    ...Typography.caption,
    color: Colors.textDark,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  emptySupplementText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  supplementSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  supplementTitle: {
    ...Typography.caption,
    color: Colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  supplementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  supplementRowInactive: {
    opacity: 0.5,
  },
  supplementName: {
    ...Typography.body,
    color: Colors.text,
  },
  supplementDetails: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: 4,
  },
  supplementStatus: {
    ...Typography.caption,
    color: Colors.text,
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
    backgroundColor: Colors.primary,
  },
  logoutButtonText: {
    ...Typography.button,
    color: '#fff',
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
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
    backgroundColor: Colors.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.text,
  },
  timingPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timingChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.background,
  },
  timingChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timingChipText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  timingChipTextActive: {
    color: Colors.textDark,
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
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalConfirm: {
    backgroundColor: Colors.primary,
  },
  modalCancelText: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  modalConfirmText: {
    ...Typography.bodySmall,
    color: Colors.textDark,
    fontWeight: '600',
  },
});

export default ProfileScreen;
