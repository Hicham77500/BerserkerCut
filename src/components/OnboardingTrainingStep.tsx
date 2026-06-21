/**
 * Composant d'onboarding pour l'étape "Entraînement & Santé"
 * Interface moderne et complète pour la collecte des données d'entraînement
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Dimensions,
  Platform,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography, Spacing, ThemePalette } from '../utils/theme';
import {
  ExtendedTrainingProfile,
  TrainingObjective,
  WeeklyTrainingSchedule,
  PreferredTrainingTime,
  ActivityType,
  NEATLevel,
  HealthLimitations,
  HealthDeclaration,
  TRAINING_OBJECTIVES,
  NEAT_LEVELS,
  WEEKDAYS,
  TIME_SLOTS,
  ACTIVITY_TYPES
} from '../types/TrainingProfile';
import { saveTrainingProfile, validateTrainingProfile, getCurrentMode } from '../services/trainingService';
import { getUIModeMessages } from '../utils/config';
import { useThemeMode } from '@/hooks/useThemeMode';

interface Props {
  onComplete: (data: ExtendedTrainingProfile) => void;
  onBack: () => void;
  userId: string;
}

const { width } = Dimensions.get('window');

/**
 * Composant: OnboardingTrainingStep
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
export const OnboardingTrainingStep: React.FC<Props> = ({ onComplete, onBack, userId }) => {
  const { colors } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // États pour chaque section du formulaire
  const [objectives, setObjectives] = useState<TrainingObjective>({ primary: 'muscle_gain' });
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyTrainingSchedule>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });
  const [preferredTimes, setPreferredTimes] = useState<PreferredTrainingTime>({
    morning: false,
    afternoon: false,
    evening: false
  });
  const [activityTypes, setActivityTypes] = useState<ActivityType>({
    strength_training: false,
    cardio: false,
    yoga: false,
    sports: false,
    other: false
  });
  const [neatLevel, setNeatLevel] = useState<NEATLevel>({ level: 'moderate', description: '' });
  const [healthLimitations, setHealthLimitations] = useState<HealthLimitations>({
    hasLimitations: false
  });
  const [healthDeclaration, setHealthDeclaration] = useState<HealthDeclaration>({
    declareGoodHealth: false,
    acknowledgeDisclaimer: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [operatingMode] = useState(getCurrentMode());
  const uiMessages = getUIModeMessages(operatingMode as 'demo' | 'cloud');

  // Gestion de la sélection des objectifs
  const handleObjectiveSelect = useCallback((type: 'primary' | 'secondary', value: string) => {
    setObjectives(prev => ({
      ...prev,
      [type]: value
    }));
  }, []);

  // Gestion des jours d'entraînement
  const handleDayToggle = useCallback((day: keyof WeeklyTrainingSchedule) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  }, []);

  // Gestion des créneaux horaires
  const handleTimeToggle = useCallback((time: keyof PreferredTrainingTime) => {
    setPreferredTimes(prev => ({
      ...prev,
      [time]: !prev[time]
    }));
  }, []);

  // Gestion des types d'activités
  const handleActivityToggle = useCallback((activity: keyof ActivityType) => {
    setActivityTypes(prev => ({
      ...prev,
      [activity]: !prev[activity]
    }));
  }, []);

  // Gestion du niveau NEAT
  const handleNeatLevelSelect = useCallback((level: NEATLevel) => {
    setNeatLevel(level);
  }, []);

  // Gestion des limitations de santé
  const handleHealthLimitationsToggle = useCallback(() => {
    setHealthLimitations(prev => ({
      hasLimitations: !prev.hasLimitations,
      limitations: !prev.hasLimitations ? prev.limitations : undefined
    }));
  }, []);

  // Validation et soumission
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      const trainingData: ExtendedTrainingProfile = {
        objectives,
        weeklySchedule,
        preferredTimes,
        activityTypes,
        neatLevel,
        healthLimitations,
        healthDeclaration,
        completedAt: new Date(),
        isComplete: true
      };

      // Validation
      const validation = validateTrainingProfile(trainingData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Sauvegarde via API ou local selon le mode
      await saveTrainingProfile(userId, trainingData);

      // Message de succès adapté au mode
      Alert.alert(
        'Profil sauvegardé !',
        uiMessages.saveSuccess + 
        (operatingMode === 'demo' ? '\n\n' + uiMessages.offlineNote : ''),
        [{ text: 'Continuer', style: 'default' }]
      );

      // Callback de succès
      onComplete(trainingData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, [
    objectives,
    weeklySchedule,
    preferredTimes,
    activityTypes,
    neatLevel,
    healthLimitations,
    healthDeclaration,
    userId,
    onComplete
  ]);

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Entraînement & Santé</Text>
          <Text style={styles.subtitle}>
            Définissez vos objectifs et préférences d'entraînement
          </Text>
          
          {/* Indicateur de mode */}
          {operatingMode === 'demo' && (
            <View style={styles.modeIndicator}>
              <Text style={styles.modeIndicatorText}>
                {uiMessages.modeIndicator}
              </Text>
            </View>
          )}
        </View>

        {/* Erreurs */}
        {errors.length > 0 && (
          <View style={styles.errorContainer}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>• {error}</Text>
            ))}
          </View>
        )}

        {/* Section 1: Objectifs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Objectifs d'entraînement</Text>
          
          <Text style={styles.fieldLabel}>Objectif principal *</Text>
          <View style={styles.optionsCompact}>
            {TRAINING_OBJECTIVES.slice(0, 3).map((obj) => (
              <TouchableOpacity
                key={obj.key}
                style={[
                  styles.optionChip,
                  objectives.primary === obj.key && styles.optionChipSelected
                ]}
                onPress={() => handleObjectiveSelect('primary', obj.key)}
                activeOpacity={Platform.OS === 'android' ? 0.7 : 0.8}
                accessibilityRole="button"
                accessibilityLabel={`Objectif principal ${obj.label}`}
                accessibilityState={{ selected: objectives.primary === obj.key }}
                hitSlop={8}
              >
                <Text style={styles.optionChipEmoji}>{obj.emoji}</Text>
                <Text style={[
                  styles.optionChipText,
                  objectives.primary === obj.key && styles.optionChipTextSelected
                ]}>
                  {obj.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.optionsCompact}>
            {TRAINING_OBJECTIVES.slice(3).map((obj) => (
              <TouchableOpacity
                key={obj.key}
                style={[
                  styles.optionChip,
                  objectives.primary === obj.key && styles.optionChipSelected
                ]}
                onPress={() => handleObjectiveSelect('primary', obj.key)}
                activeOpacity={Platform.OS === 'android' ? 0.7 : 0.8}
                accessibilityRole="button"
                accessibilityLabel={`Objectif principal ${obj.label}`}
                accessibilityState={{ selected: objectives.primary === obj.key }}
                hitSlop={8}
              >
                <Text style={styles.optionChipEmoji}>{obj.emoji}</Text>
                <Text style={[
                  styles.optionChipText,
                  objectives.primary === obj.key && styles.optionChipTextSelected
                ]}>
                  {obj.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {objectives.primary && (
            <>
              <Text style={styles.fieldLabel}>Objectif secondaire (optionnel)</Text>
              <View style={styles.optionsCompact}>
                {TRAINING_OBJECTIVES.filter(obj => obj.key !== objectives.primary).slice(0, 3).map((obj) => (
                  <TouchableOpacity
                    key={obj.key}
                    style={[
                      styles.optionChipSmall,
                      objectives.secondary === obj.key && styles.optionChipSelected
                    ]}
                    onPress={() => handleObjectiveSelect('secondary', obj.key)}
                    activeOpacity={Platform.OS === 'android' ? 0.7 : 0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Objectif secondaire ${obj.label}`}
                    accessibilityState={{ selected: objectives.secondary === obj.key }}
                    hitSlop={8}
                  >
                    <Text style={styles.optionChipEmojiSmall}>{obj.emoji}</Text>
                    <Text style={[
                      styles.optionChipTextSmall,
                      objectives.secondary === obj.key && styles.optionChipTextSelected
                    ]}>
                      {obj.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Section 2: Planning d'entraînement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Planning d'entraînement</Text>
          
          <Text style={styles.fieldLabel}>Jours d'entraînement</Text>
          <View style={styles.daysContainer}>
            {WEEKDAYS.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  weeklySchedule[day.key as keyof WeeklyTrainingSchedule] && styles.dayButtonSelected
                ]}
                onPress={() => handleDayToggle(day.key as keyof WeeklyTrainingSchedule)}
                accessibilityRole="button"
                accessibilityLabel={`Jour ${day.label}`}
                accessibilityState={{ selected: weeklySchedule[day.key as keyof WeeklyTrainingSchedule] }}
                hitSlop={8}
              >
                <Text style={[
                  styles.dayText,
                  weeklySchedule[day.key as keyof WeeklyTrainingSchedule] && styles.dayTextSelected
                ]}>
                  {day.label.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Créneaux préférés</Text>
          <View style={styles.timeSlots}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot.key}
                style={[
                  styles.timeSlot,
                  preferredTimes[slot.key as keyof PreferredTrainingTime] && styles.timeSlotSelected
                ]}
                onPress={() => handleTimeToggle(slot.key as keyof PreferredTrainingTime)}
                accessibilityRole="button"
                accessibilityLabel={`Creneau ${slot.label}`}
                accessibilityHint={slot.description}
                accessibilityState={{ selected: preferredTimes[slot.key as keyof PreferredTrainingTime] }}
                hitSlop={8}
              >
                <Text style={[
                  styles.timeSlotText,
                  preferredTimes[slot.key as keyof PreferredTrainingTime] && styles.timeSlotTextSelected
                ]}>
                  {slot.label}
                </Text>
                <Text style={styles.timeSlotDescription}>{slot.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 4: Types d'activités */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏃 Types d'activités</Text>
          <Text style={styles.fieldDescription}>
            Quels types d'activités pratiquez-vous ?
          </Text>
          
          <View style={styles.activitiesCompact}>
            {ACTIVITY_TYPES.map((activity) => (
              <TouchableOpacity
                key={activity.key}
                style={[
                  styles.activityChip,
                  activityTypes[activity.key as keyof ActivityType] && styles.activityChipSelected
                ]}
                onPress={() => handleActivityToggle(activity.key as keyof ActivityType)}
                activeOpacity={Platform.OS === 'android' ? 0.7 : 0.8}
                accessibilityRole="button"
                accessibilityLabel={`Type d'activite ${activity.label}`}
                accessibilityState={{ selected: Boolean(activityTypes[activity.key as keyof ActivityType]) }}
                hitSlop={8}
              >
                <Text style={styles.activityChipIcon}>{activity.icon}</Text>
                <Text style={[
                  styles.activityChipText,
                  activityTypes[activity.key as keyof ActivityType] && styles.activityChipTextSelected
                ]}>
                  {activity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activityTypes.other && (
            <View style={styles.otherActivityContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Précisez (ex: Arts martiaux, danse...)"
                value={activityTypes.other_description || ''}
                onChangeText={(text) => setActivityTypes(prev => ({ ...prev, other_description: text }))}
                accessibilityLabel="Autre type d'activite"
              />
            </View>
          )}
        </View>

        {/* Section 5: Activité quotidienne */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚶 Activité quotidienne</Text>
          
          <View style={styles.neatOptionsCompact}>
            {NEAT_LEVELS.map((level) => (
              <Pressable
                key={level.key}
                style={({ pressed }) => [
                  styles.neatChipButton,
                  neatLevel.level === level.key && styles.neatChipButtonActive,
                  // Effet de press subtil pour tous les OS
                  pressed && { opacity: 0.9 }
                ]}
                onPress={() => handleNeatLevelSelect({ level: level.key as any, description: level.description })}
                android_ripple={Platform.OS === 'android' ? { 
                  color: 'rgba(128, 128, 128, 0.1)',
                  borderless: false
                } : undefined}
                accessibilityRole="button"
                accessibilityLabel={`Niveau d'activite quotidienne ${level.label}`}
                accessibilityHint={level.description}
                accessibilityState={{ selected: neatLevel.level === level.key }}
              >
                <Text style={[
                  styles.neatChipButtonText,
                  neatLevel.level === level.key && styles.neatChipButtonTextActive
                ]}>
                  {level.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {neatLevel.level && (
            <Text style={styles.neatSelectedDescription}>
              {NEAT_LEVELS.find(l => l.key === neatLevel.level)?.description}
            </Text>
          )}
        </View>

        {/* Section 6: Limitations de santé */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚕️ Limitations de santé</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              Avez-vous des limitations ou contraintes de santé ?
            </Text>
            <Switch
              value={healthLimitations.hasLimitations}
              onValueChange={handleHealthLimitationsToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={healthLimitations.hasLimitations ? colors.primary : colors.textMuted}
              accessibilityLabel="Indiquer des limitations de sante"
            />
          </View>

          {healthLimitations.hasLimitations && (
            <View style={styles.limitationsContainer}>
              <Text style={styles.fieldLabel}>Décrivez vos limitations :</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Ex: Problème de dos, blessure au genou, restrictions médicales..."
                value={healthLimitations.limitations || ''}
                onChangeText={(text) => setHealthLimitations(prev => ({ ...prev, limitations: text }))}
                multiline
                numberOfLines={4}
                accessibilityLabel="Description des limitations de sante"
              />
            </View>
          )}
        </View>

        {/* Section 7: Déclaration de santé */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Avertissement & Déclaration</Text>
          
          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>AVERTISSEMENT IMPORTANT :</Text>
              {'\n\n'}
              Cette application fournit des conseils nutritionnels et d'entraînement à titre informatif uniquement. 
              Elle ne remplace pas l'avis d'un médecin, nutritionniste ou coach professionnel.
              {'\n\n'}
              <Text style={styles.disclaimerBold}>Avant de commencer tout programme :</Text>
              {'\n'}
              • Consultez votre médecin si vous avez des problèmes de santé
              {'\n'}
              • Arrêtez immédiatement en cas de douleur ou malaise
              {'\n'}
              • Les résultats peuvent varier selon chaque individu
              {'\n\n'}
              En utilisant cette application, vous reconnaissez avoir lu et compris ces avertissements.
            </Text>
          </View>

          <View style={styles.declarationsContainer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setHealthDeclaration(prev => ({ 
                ...prev, 
                declareGoodHealth: !prev.declareGoodHealth 
              }))}
              accessibilityRole="button"
              accessibilityLabel="Declaration de bonne sante"
              accessibilityState={{ selected: healthDeclaration.declareGoodHealth }}
              hitSlop={8}
            >
              <View style={[
                styles.checkbox,
                healthDeclaration.declareGoodHealth && styles.checkboxSelected
              ]}>
                {healthDeclaration.declareGoodHealth && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxText}>
                Je déclare être en bonne santé et apte à suivre un programme d'entraînement et de nutrition *
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setHealthDeclaration(prev => ({ 
                ...prev, 
                acknowledgeDisclaimer: !prev.acknowledgeDisclaimer 
              }))}
              accessibilityRole="button"
              accessibilityLabel="Accepter l'avertissement et les conditions"
              accessibilityState={{ selected: healthDeclaration.acknowledgeDisclaimer }}
              hitSlop={8}
            >
              <View style={[
                styles.checkbox,
                healthDeclaration.acknowledgeDisclaimer && styles.checkboxSelected
              ]}>
                {healthDeclaration.acknowledgeDisclaimer && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxText}>
                J'ai lu et j'accepte les conditions d'utilisation et l'avertissement ci-dessus *
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Boutons de navigation */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Retour a l'etape precedente"
            hitSlop={8}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextButton, loading && styles.nextButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={loading ? 'Sauvegarde en cours' : 'Valider et continuer'}
            accessibilityState={{ disabled: loading }}
            hitSlop={8}
          >
            <Text style={styles.nextButtonText}>
              {loading ? 'Sauvegarde...' : uiMessages.saveButton}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Fonction: createStyles
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const createStyles = (colors: ThemePalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: colors.textLight,
    textAlign: 'center',
  },
  modeIndicator: {
    backgroundColor: Platform.OS === 'android' ? colors.info + '12' : colors.info + '15',
    borderRadius: Platform.OS === 'android' ? 12 : 8,
    padding: Platform.OS === 'android' ? Spacing.md : Spacing.sm,
    marginTop: Spacing.md,
    borderWidth: Platform.OS === 'android' ? 2 : 1,
    borderColor: Platform.OS === 'android' ? colors.info + '55' : colors.info + '30',
    // Suppression complète des élévations qui causent les carrés
    ...(Platform.OS === 'android' ? { 
      elevation: 0,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    } : {}),
  },
  modeIndicatorText: {
    ...Typography.caption,
    color: colors.info,
    textAlign: 'center',
    fontWeight: Platform.OS === 'android' ? '700' : '600', // Plus gras sur Android
    ...(Platform.OS === 'android' ? {
      fontSize: 13, // Légèrement plus grand sur Android
      letterSpacing: 0.3,
    } : {}),
  },
  errorContainer: {
    backgroundColor: colors.error + '15',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  errorText: {
    ...Typography.caption,
    color: colors.error,
    marginBottom: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg, // Compact comme iOS sur toutes les plateformes
  },
  sectionTitle: {
    ...Typography.h3,
    color: colors.text,
    marginBottom: Spacing.sm, // Compact comme iOS sur toutes les plateformes
  },
  fieldLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: Spacing.sm,
  },
  fieldDescription: {
    ...Typography.caption,
    color: colors.textLight,
    marginBottom: Spacing.sm, // Compact comme iOS sur toutes les plateformes
  },
  optionsGrid: {
    marginBottom: Spacing.md,
  },
  optionsCompact: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  optionChip: {
    flex: 1,
    backgroundColor: Platform.OS === 'android' ? 'transparent' : colors.surface,
    borderRadius: Platform.OS === 'android' ? 16 : 12,
    paddingVertical: Platform.OS === 'android' ? Spacing.md + 2 : Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: Platform.OS === 'android' ? 2 : 2,
    borderColor: Platform.OS === 'android' ? colors.borderDark : colors.border,
    alignItems: 'center',
    minHeight: Platform.OS === 'android' ? 75 : 70,
    // Suppression complète des ombres et élévations sur Android
    ...(Platform.OS === 'android' ? { 
      elevation: 0,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    } : {}),
  },
  optionChipSelected: {
    borderColor: colors.primary,
    backgroundColor: Platform.OS === 'android' ? colors.primary + '18' : colors.primary + '10',
    // Suppression des élévations et ombres sur Android pour éviter les carrés
    ...(Platform.OS === 'android' ? { 
      elevation: 0,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      // Pas de transform pour éviter les effets visuels bizarres
    } : {}),
  },
  optionChipEmoji: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  optionChipSmall: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: Platform.OS === 'android' ? Spacing.sm + 2 : Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderWidth: Platform.OS === 'android' ? 2 : 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: Platform.OS === 'android' ? 55 : 50,
    ...(Platform.OS === 'android' ? { elevation: 1 } : {}),
  },
  optionText: {
    ...Typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: Spacing.xs,
  },
  optionTextSelected: {
    color: colors.primary,
  },
  optionChipText: {
    ...Typography.body,
    fontWeight: Platform.OS === 'android' ? '700' : '600',
    color: colors.text,
    textAlign: 'center',
    fontSize: Platform.OS === 'android' ? 13 : 12,
    ...(Platform.OS === 'android' ? {
      letterSpacing: 0.3,
      lineHeight: 16,
    } : {}),
  },
  optionChipTextSelected: {
    color: colors.primary,
    ...(Platform.OS === 'android' ? {
      fontWeight: '700',
      textShadowColor: 'rgba(255, 107, 53, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    } : {}),
  },
  optionChipTextSmall: {
    ...Typography.caption,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    fontSize: 10,
  },
  optionChipEmojiSmall: {
    fontSize: 16,
    marginBottom: 2,
  },
  optionDescription: {
    ...Typography.caption,
    color: colors.textLight,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm, // Compact comme iOS sur toutes les plateformes
  },
  dayButton: {
    width: (width - 2 * Spacing.lg - 6 * Spacing.xs) / 7,
    height: Platform.OS === 'android' ? 42 : 44,
    borderRadius: Platform.OS === 'android' ? 21 : 22,
    backgroundColor: Platform.OS === 'android' ? 'transparent' : colors.surface,
    borderWidth: Platform.OS === 'android' ? 2 : 2,
    borderColor: Platform.OS === 'android' ? colors.borderDark : colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    // Suppression complète des ombres sur Android
    ...(Platform.OS === 'android' ? { 
      elevation: 0,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    } : {}),
  },
  dayButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    // Suppression des effets 3D sur Android
    ...(Platform.OS === 'android' ? {
      elevation: 0,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    } : {}),
  },
  dayText: {
    ...Typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: colors.textDark,
  },
  timeSlots: {
    marginBottom: Spacing.md,
  },
  timeSlot: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  timeSlotSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  timeSlotText: {
    ...Typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: Spacing.xs,
  },
  timeSlotTextSelected: {
    color: colors.primary,
  },
  timeSlotDescription: {
    ...Typography.caption,
    color: colors.textLight,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  activitiesCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs, // Même espacement compact sur toutes les plateformes
    marginBottom: Spacing.sm, // Compact comme iOS
    justifyContent: 'flex-start',
  },
  activityCard: {
    width: (width - 2 * Spacing.lg - Spacing.sm) / 2,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  activityCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'android' ? 'transparent' : colors.surface,
    borderRadius: Platform.OS === 'android' ? 20 : 20,
    paddingHorizontal: Platform.OS === 'android' ? Spacing.md : Spacing.md + 2,
    paddingVertical: Platform.OS === 'android' ? Spacing.xs + 3 : Spacing.sm + 2,
    borderWidth: Platform.OS === 'android' ? 2 : 1.5,
    borderColor: Platform.OS === 'android' ? colors.borderDark : colors.border,
    marginBottom: Platform.OS === 'android' ? Spacing.xs / 2 : Spacing.xs,
    maxWidth: Platform.OS === 'android' ? '48%' : 'auto',
    // Suppression absolue de tout effet visuel sur Android
    ...(Platform.OS === 'android' ? { 
      elevation: 0,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      overflow: 'hidden', // Assure qu'aucun effet ne dépasse
    } : {}),
  },
  activityChipSelected: {
    borderColor: colors.primary,
    backgroundColor: Platform.OS === 'android' ? colors.primary + '14' : colors.primary + '15',
    // Suppression absolue de tout effet 3D sur Android
    ...(Platform.OS === 'android' ? { 
      elevation: 0,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      overflow: 'hidden', // Assure qu'aucun effet ne dépasse
    } : {}),
  },
  activityIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  activityChipIcon: {
    fontSize: Platform.OS === 'android' ? 14 : 16, // Plus petit sur Android
    marginRight: Platform.OS === 'android' ? Spacing.xs / 2 : Spacing.xs, // Moins d'espace
  },
  activityText: {
    ...Typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  activityTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  activityChipText: {
    ...Typography.body,
    color: colors.text,
    fontSize: Platform.OS === 'android' ? 15 : 14,
    fontWeight: Platform.OS === 'android' ? '600' : 'normal',
    ...(Platform.OS === 'android' ? {
      letterSpacing: 0.2,
    } : {}),
  },
  activityChipTextSelected: {
    color: colors.primary,
    fontWeight: Platform.OS === 'android' ? '700' : '600',
    ...(Platform.OS === 'android' ? {
      textShadowColor: 'rgba(255, 107, 53, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    } : {}),
  },
  otherActivityContainer: {
    marginTop: Spacing.sm, // Compact comme iOS sur toutes les plateformes
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Typography.body,
    color: colors.text,
    minHeight: 44,
  },
  neatOptions: {
    marginBottom: Spacing.md,
  },
  neatOptionsCompact: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    justifyContent: 'space-between',
  },
  // Nouveaux styles pour les boutons NEAT optimisés Android/iOS
  neatChipButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: Platform.OS === 'android' ? 12 : 14,
    paddingHorizontal: Platform.OS === 'android' ? 8 : 10,
    borderWidth: Platform.OS === 'android' ? 1.5 : 2,
    borderColor: Platform.OS === 'android' ? colors.borderDark : colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginHorizontal: 4,
    // Suppression totale des ombres et effets 3D sur Android
    ...(Platform.OS === 'android' ? { 
      elevation: 0,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      overflow: 'hidden',
      backfaceVisibility: 'hidden',
    } : {
      // iOS garde des ombres subtiles
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  neatChipButtonActive: {
    borderColor: colors.primary,
    backgroundColor: Platform.OS === 'android' ? colors.surface : colors.primary + '10',
    // Suppression totale des effets 3D sur Android même actif
    ...(Platform.OS === 'android' ? { 
      elevation: 0,
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      overflow: 'hidden',
      backfaceVisibility: 'hidden',
    } : {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    }),
  },
  neatChipButtonText: {
    ...Typography.body,
    fontWeight: Platform.OS === 'android' ? '600' : '600',
    color: colors.text,
    textAlign: 'center',
    fontSize: Platform.OS === 'android' ? 13 : 14,
    lineHeight: Platform.OS === 'android' ? 18 : 20,
  },
  neatChipButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  neatOptionDescription: {
    ...Typography.caption,
    color: colors.textLight,
  },
  neatSelectedDescription: {
    ...Typography.caption,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: Platform.OS === 'android' ? Spacing.xs / 2 : Spacing.xs, // Moins d'espace sur Android
    fontSize: Platform.OS === 'android' ? 11 : 12, // Plus petit sur Android
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  switchLabel: {
    ...Typography.body,
    color: colors.text,
    flex: 1,
    marginRight: Spacing.md,
  },
  limitationsContainer: {
    marginTop: Spacing.md,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Typography.body,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  disclaimerContainer: {
    backgroundColor: colors.warning + '10',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  disclaimerText: {
    ...Typography.caption,
    color: colors.text,
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: '700',
    color: colors.warning,
  },
  declarationsContainer: {
    marginBottom: Spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxText: {
    ...Typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    flex: 1,
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: colors.textMuted,
  },
  backButtonText: {
    ...Typography.button,
    color: colors.text,
  },
  nextButton: {
    flex: 1,
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  nextButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  nextButtonText: {
    ...Typography.button,
    color: colors.textDark,
  },
});
