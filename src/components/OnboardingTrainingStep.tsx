/**
 * Composant d'onboarding pour l'étape "Entraînement & Santé"
 * Interface moderne et complète pour la collecte des données d'entraînement
 */

import React, { useState, useCallback } from 'react';
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
  Animated,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../utils/theme';
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
import { saveTrainingProfileToFirestore, validateTrainingProfile, getCurrentMode } from '../services/trainingService';
import { getUIModeMessages } from '../utils/config';

interface Props {
  onComplete: (data: ExtendedTrainingProfile) => void;
  onBack: () => void;
  userId: string;
}

const { width } = Dimensions.get('window');

export const OnboardingTrainingStep: React.FC<Props> = ({ onComplete, onBack, userId }) => {
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
  const uiMessages = getUIModeMessages(operatingMode as 'demo' | 'firebase');

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

      // Sauvegarde dans Firestore ou en local
      await saveTrainingProfileToFirestore(userId, trainingData);

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
    <SafeAreaView style={styles.container}>
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
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={healthLimitations.hasLimitations ? Colors.primary : Colors.textMuted}
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
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextButton, loading && styles.nextButtonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
  },
  modeIndicator: {
    backgroundColor: Platform.OS === 'android' ? 'rgba(59, 130, 246, 0.08)' : Colors.info + '15',
    borderRadius: Platform.OS === 'android' ? 12 : 8,
    padding: Platform.OS === 'android' ? Spacing.md : Spacing.sm,
    marginTop: Spacing.md,
    borderWidth: Platform.OS === 'android' ? 2 : 1,
    borderColor: Platform.OS === 'android' ? 'rgba(59, 130, 246, 0.4)' : Colors.info + '30',
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
    color: Platform.OS === 'android' ? 'rgb(59, 130, 246)' : Colors.info, // Couleur plus contrastée sur Android
    textAlign: 'center',
    fontWeight: Platform.OS === 'android' ? '700' : '600', // Plus gras sur Android
    ...(Platform.OS === 'android' ? {
      fontSize: 13, // Légèrement plus grand sur Android
      letterSpacing: 0.3,
    } : {}),
  },
  errorContainer: {
    backgroundColor: Colors.error + '15',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginBottom: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg, // Compact comme iOS sur toutes les plateformes
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm, // Compact comme iOS sur toutes les plateformes
  },
  fieldLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  fieldDescription: {
    ...Typography.caption,
    color: Colors.textLight,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionChip: {
    flex: 1,
    backgroundColor: Platform.OS === 'android' ? 'transparent' : Colors.surface, // Complètement transparent sur Android
    borderRadius: Platform.OS === 'android' ? 16 : 12,
    paddingVertical: Platform.OS === 'android' ? Spacing.md + 2 : Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: Platform.OS === 'android' ? 2 : 2,
    borderColor: Platform.OS === 'android' ? 'rgba(203, 213, 225, 0.9)' : Colors.border,
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
    borderColor: Platform.OS === 'android' ? 'rgba(255, 107, 53, 1)' : Colors.primary,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 107, 53, 0.1)' : Colors.primary + '10',
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
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.95)' : Colors.surface,
    borderRadius: 10,
    paddingVertical: Platform.OS === 'android' ? Spacing.sm + 2 : Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderWidth: Platform.OS === 'android' ? 2 : 1.5,
    borderColor: Platform.OS === 'android' ? 'rgba(209, 213, 219, 0.8)' : Colors.border,
    alignItems: 'center',
    minHeight: Platform.OS === 'android' ? 55 : 50,
    ...(Platform.OS === 'android' ? { elevation: 1 } : {}),
  },
  optionText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  optionTextSelected: {
    color: Colors.primary,
  },
  optionChipText: {
    ...Typography.body,
    fontWeight: Platform.OS === 'android' ? '700' : '600',
    color: Colors.text,
    textAlign: 'center',
    fontSize: Platform.OS === 'android' ? 13 : 12,
    ...(Platform.OS === 'android' ? {
      letterSpacing: 0.3,
      lineHeight: 16,
    } : {}),
  },
  optionChipTextSelected: {
    color: Platform.OS === 'android' ? 'rgb(255, 107, 53)' : Colors.primary,
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
    color: Colors.text,
    textAlign: 'center',
    fontSize: 10,
  },
  optionChipEmojiSmall: {
    fontSize: 16,
    marginBottom: 2,
  },
  optionDescription: {
    ...Typography.caption,
    color: Colors.textLight,
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
    backgroundColor: Platform.OS === 'android' ? 'transparent' : Colors.surface,
    borderWidth: Platform.OS === 'android' ? 2 : 2,
    borderColor: Platform.OS === 'android' ? 'rgba(203, 213, 225, 0.9)' : Colors.border,
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
    borderColor: Platform.OS === 'android' ? 'rgba(255, 107, 53, 1)' : Colors.primary,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 107, 53, 1)' : Colors.primary,
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
    color: Colors.text,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: Colors.surface,
  },
  timeSlots: {
    marginBottom: Spacing.md,
  },
  timeSlot: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  timeSlotSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  timeSlotText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  timeSlotTextSelected: {
    color: Colors.primary,
  },
  timeSlotDescription: {
    ...Typography.caption,
    color: Colors.textLight,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  activityCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0)' : Colors.surface, // Totalement transparent sur Android
    borderRadius: Platform.OS === 'android' ? 20 : 20,
    paddingHorizontal: Platform.OS === 'android' ? Spacing.md : Spacing.md + 2,
    paddingVertical: Platform.OS === 'android' ? Spacing.xs + 3 : Spacing.sm + 2,
    borderWidth: Platform.OS === 'android' ? 2 : 1.5,
    borderColor: Platform.OS === 'android' ? 'rgba(203, 213, 225, 1)' : Colors.border, // Bordure plus opaque
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
    borderColor: Platform.OS === 'android' ? 'rgba(255, 107, 53, 1)' : Colors.primary,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 107, 53, 0.08)' : Colors.primary + '15', // Plus léger sur Android
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
    color: Colors.text,
    textAlign: 'center',
  },
  activityTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  activityChipText: {
    ...Typography.body,
    color: Colors.text,
    fontSize: Platform.OS === 'android' ? 15 : 14,
    fontWeight: Platform.OS === 'android' ? '600' : 'normal',
    ...(Platform.OS === 'android' ? {
      letterSpacing: 0.2,
    } : {}),
  },
  activityChipTextSelected: {
    color: Platform.OS === 'android' ? 'rgb(255, 107, 53)' : Colors.primary,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.text,
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
    backgroundColor: Platform.OS === 'android' ? '#FFFFFF' : Colors.surface,
    borderRadius: 12,
    paddingVertical: Platform.OS === 'android' ? 12 : 14,
    paddingHorizontal: Platform.OS === 'android' ? 8 : 10,
    borderWidth: Platform.OS === 'android' ? 1.5 : 2,
    borderColor: Platform.OS === 'android' ? '#E2E8F0' : Colors.border,
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
      shadowColor: Colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  neatChipButtonActive: {
    borderColor: Platform.OS === 'android' ? '#FF6B35' : Colors.primary,
    backgroundColor: Platform.OS === 'android' ? '#FFFFFF' : Colors.primary + '10',
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
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    }),
  },
  neatChipButtonText: {
    ...Typography.body,
    fontWeight: Platform.OS === 'android' ? '600' : '600',
    color: Colors.text,
    textAlign: 'center',
    fontSize: Platform.OS === 'android' ? 13 : 14,
    lineHeight: Platform.OS === 'android' ? 18 : 20,
  },
  neatChipButtonTextActive: {
    color: Platform.OS === 'android' ? '#FF6B35' : Colors.primary,
    fontWeight: '700',
  },
  neatOptionDescription: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  neatSelectedDescription: {
    ...Typography.caption,
    color: Colors.textLight,
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
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.md,
  },
  limitationsContainer: {
    marginTop: Spacing.md,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  disclaimerContainer: {
    backgroundColor: Colors.warning + '10',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  disclaimerText: {
    ...Typography.caption,
    color: Colors.text,
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: '700',
    color: Colors.warning,
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
    borderColor: Colors.textMuted,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backButton: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.surface,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.textMuted,
  },
  backButtonText: {
    ...Typography.button,
    color: Colors.text,
  },
  nextButton: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  nextButtonText: {
    ...Typography.button,
    color: Colors.surface,
  },
});
