/**
 * Écran d'onboarding modernisé avec étape santé - Version corrigée
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import {
  UserProfile,
  HealthProfile,
  TrainingProfile,
  SupplementProfile,
  TrainingDay,
  Supplement,
  SupplementFormType,
} from '../types';
import { ExtendedTrainingProfile, WeeklyTrainingSchedule, PreferredTrainingTime } from '../types/TrainingProfile';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card, Button, Input, HealthStep, OnboardingTrainingStep } from '../components';
interface BasicInfo {
  name?: string;
  gender: 'male' | 'female';
  objective: UserProfile['objective'];
}

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

export const OnboardingScreen: React.FC = () => {
  // États partagés entre les étapes
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    gender: 'male',
    objective: 'recomposition',
  });
  const [healthData, setHealthData] = useState<Partial<HealthProfile>>({
    activityLevel: 'moderate',
    averageSleepHours: 7,
  });
  const [trainingProfile, setTrainingProfile] = useState<TrainingProfile | null>(null);
  const [supplementData, setSupplementData] = useState<Partial<SupplementProfile>>({
    preferences: {
      preferNatural: false,
      budgetRange: 'medium',
      allergies: [],
    },
    available: [],
  });

  // Navigation entre les étapes
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { user, updateProfile } = useAuth();

  // Gérer la progression vers l'étape suivante
  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Gérer le retour à l'étape précédente
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Finaliser l'onboarding
  const handleComplete = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Veuillez vous reconnecter pour finaliser votre profil.');
      return;
    }

    setIsLoading(true);
    try {
      const now = new Date();

      const resolvedHealth: HealthProfile = {
        weight: healthData.weight ?? 0,
        height: healthData.height ?? 0,
        age: healthData.age ?? 0,
        gender: basicInfo.gender,
        activityLevel: healthData.activityLevel ?? 'moderate',
        averageSleepHours: healthData.averageSleepHours ?? 7,
        averageDailySteps: healthData.averageDailySteps,
        restingHeartRate: healthData.restingHeartRate,
        dataSource: {
          type: healthData.dataSource?.type ?? 'manual',
          isConnected: healthData.dataSource?.isConnected ?? false,
          permissions: healthData.dataSource?.permissions ?? [],
          lastSyncDate: healthData.dataSource?.lastSyncDate,
        },
        lastUpdated: healthData.lastUpdated ?? now,
        isManualEntry: healthData.isManualEntry ?? true,
      };

      const resolvedTraining: TrainingProfile = trainingProfile ?? {
        trainingDays: [],
        experienceLevel: 'beginner',
        preferredTimeSlots: ['evening']
      };

      const resolvedSupplements: SupplementProfile = {
        available: supplementData.available ?? [],
        preferences: {
          preferNatural: supplementData.preferences?.preferNatural ?? false,
          budgetRange: supplementData.preferences?.budgetRange ?? 'medium',
          allergies: supplementData.preferences?.allergies ?? [],
        }
      };

      const completeProfile: UserProfile = {
        name: basicInfo.name?.trim() ?? '',
        objective: basicInfo.objective ?? 'recomposition',
        allergies: supplementData.preferences?.allergies ?? [],
        foodPreferences: [],
        health: resolvedHealth,
        training: resolvedTraining,
        supplements: resolvedSupplements,
      };

      await updateProfile(completeProfile);
      Alert.alert('Succès', 'Votre profil a été mis à jour avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement de votre profil.');
      console.error('Erreur création profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.header}>
          <View style={styles.progressBar}>
            {[1, 2, 3, 4].map((step) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  step <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.stepIndicator}>Étape {currentStep} sur 4</Text>
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 && (
            <Step1
              basicInfo={basicInfo}
              setBasicInfo={setBasicInfo}
              onNext={handleNextStep}
            />
          )}
          {currentStep === 2 && (
            <Step2
              healthData={healthData}
              setHealthData={setHealthData}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          )}
          {currentStep === 3 && (
            <Step3
              userId={user?.id ?? 'demo-user'}
              setTrainingProfile={setTrainingProfile}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          )}
          {currentStep === 4 && (
            <Step4
              supplementData={supplementData}
              setSupplementData={setSupplementData}
              onComplete={handleComplete}
              onBack={handlePreviousStep}
              isLoading={isLoading}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Étape 1: Informations de base
interface StepProps {
  onNext?: () => void;
  onBack?: () => void;
  onComplete?: () => void;
  isLoading?: boolean;
}

interface Step1Props extends StepProps {
  basicInfo: BasicInfo;
  setBasicInfo: (data: BasicInfo) => void;
}

const Step1: React.FC<Step1Props> = ({ basicInfo, setBasicInfo, onNext }) => {
  const [name, setName] = useState(basicInfo.name || '');
  const [gender, setGender] = useState<BasicInfo['gender']>(basicInfo.gender);
  const [objective, setObjective] = useState<BasicInfo['objective']>(basicInfo.objective);

  const handleSubmit = () => {
    if (!name) {
      Alert.alert('Erreur', 'Veuillez renseigner votre prénom.');
      return;
    }

    setBasicInfo({
      ...basicInfo,
      name,
      gender,
      objective,
    });

    onNext?.();
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Vos informations</Text>
      <Text style={styles.stepSubtitle}>Commençons par apprendre à vous connaître</Text>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Informations de base</Text>
        <Input
          placeholder="Votre prénom"
          value={name}
          onChangeText={setName}
          onSubmitEditing={() => Keyboard.dismiss()}
          style={styles.input}
        />
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Genre</Text>
        <View style={styles.optionRow}>
          <Button
            title="🙋‍♂️ Homme"
            variant={gender === 'male' ? 'primary' : 'outline'}
            onPress={() => setGender('male')}
            style={styles.optionButton}
          />
          <Button
            title="🙋‍♀️ Femme"
            variant={gender === 'female' ? 'primary' : 'outline'}
            onPress={() => setGender('female')}
            style={styles.optionButton}
          />
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Objectif principal</Text>
        <View style={styles.optionColumn}>
          <Button
            title="💪 Prise de masse 💪"
            variant={objective === 'recomposition' ? 'primary' : 'outline'}
            onPress={() => setObjective('recomposition')}
            style={styles.fullWidthButton}
          />
          <Button
            title="⚖️ Maintien du poids ⚖️"
            variant={objective === 'maintenance' ? 'primary' : 'outline'}
            onPress={() => setObjective('maintenance')}
            style={styles.fullWidthButton}
          />
          <Button
            title="🔥 Sèche (perte de graisse) 🔥"
            variant={objective === 'cutting' ? 'primary' : 'outline'}
            onPress={() => setObjective('cutting')}
            style={styles.fullWidthButton}
          />
        </View>
      </Card>

      <View style={styles.actionRow}>
        <Button
          title="Continuer"
          onPress={() => {
            Keyboard.dismiss();
            handleSubmit();
          }}
          variant="primary"
          style={styles.continueButton}
        />
      </View>
    </View>
  );
};

// Composants simplifiés pour les autres étapes (à développer)
interface Step2Props extends StepProps {
  healthData: Partial<HealthProfile>;
  setHealthData: (data: Partial<HealthProfile>) => void;
}

const Step2: React.FC<Step2Props> = ({ healthData, setHealthData, onNext, onBack }) => {
  const handleComplete = (data: Partial<HealthProfile>) => {
    setHealthData({ ...healthData, ...data });
    onNext?.();
  };

  return (
    <View style={styles.stepContainer}>
      <HealthStep onComplete={handleComplete} initialData={healthData} />
      {onBack && (
        <Button
          title="Retour"
          variant="outline"
          onPress={onBack}
          style={styles.backButton}
        />
      )}
    </View>
  );
};

interface Step3Props extends StepProps {
  userId: string;
  setTrainingProfile: (profile: TrainingProfile) => void;
}

const WEEKDAY_INDEX_MAP: Record<keyof WeeklyTrainingSchedule, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

// Convertit le planning hebdomadaire en liste de créneaux compatibles Firestore.
const mapWeeklyScheduleToTrainingDays = (
  schedule: WeeklyTrainingSchedule,
  preferredTimes: PreferredTrainingTime
): TrainingDay[] => {
  const selectedSlots = (['morning', 'afternoon', 'evening'] as const).filter(
    (slot) => preferredTimes[slot]
  );

  const defaultSlot = selectedSlots[0] ?? 'evening';

  return (Object.entries(schedule) as Array<[keyof WeeklyTrainingSchedule, boolean]>)
    .filter(([, isSelected]) => isSelected)
    .map(([day]) => ({
      dayOfWeek: WEEKDAY_INDEX_MAP[day],
      type: 'mixed',
      timeSlot: defaultSlot,
      duration: 60,
    }));
};

const Step3: React.FC<Step3Props> = ({ onNext, onBack, userId, setTrainingProfile }) => {
  const handleComplete = (data: ExtendedTrainingProfile) => {
    const preferredTimeSlots = (['morning', 'afternoon', 'evening'] as const).filter(
      (slot) => data.preferredTimes[slot]
    );

    const training: TrainingProfile = {
      trainingDays: mapWeeklyScheduleToTrainingDays(data.weeklySchedule, data.preferredTimes),
      experienceLevel: 'beginner',
      preferredTimeSlots: preferredTimeSlots.length ? preferredTimeSlots : ['evening'],
    };

    setTrainingProfile(training);
    onNext?.();
  };

  return (
    <OnboardingTrainingStep
      onComplete={handleComplete}
      onBack={onBack ?? (() => {})}
      userId={userId}
    />
  );
};

interface Step4Props extends StepProps {
  supplementData: Partial<SupplementProfile>;
  setSupplementData: (data: Partial<SupplementProfile>) => void;
}

const SUPPLEMENT_TIMINGS_ORDER: Array<Supplement['timing']> = [
  'morning',
  'pre_workout',
  'post_workout',
  'evening',
];
const SUPPLEMENT_TIMINGS_LABELS: Record<string, string> = {
  morning: 'Matin',
  pre_workout: 'Pré-entraînement',
  post_workout: 'Post-entraînement',
  evening: 'Soir',
  preWorkout: 'Pré-entraînement',
  postWorkout: 'Post-entraînement',
};

const SUPPLEMENT_UNITS: Array<{ value: SupplementFormType; label: string; suffix: string }> = [
  { value: 'gram', label: 'Grammes (g)', suffix: 'g' },
  { value: 'capsule', label: 'Gélules', suffix: 'gélule(s)' },
  { value: 'milliliter', label: 'Millilitres (ml)', suffix: 'ml' },
];

const Step4: React.FC<Step4Props> = ({
  onComplete,
  onBack,
  isLoading,
  supplementData,
  setSupplementData,
}) => {
  const [newSupplement, setNewSupplement] = useState({
    name: '',
    quantity: '',
    unit: 'gram' as SupplementFormType,
    timing: 'morning' as Supplement['timing'],
  });

  const supplements = supplementData.available ?? [];

  const resetForm = () => {
    setNewSupplement({
      name: '',
      quantity: '',
      unit: 'gram',
      timing: 'morning',
    });
  };

  const handleAddSupplement = () => {
    const trimmedName = newSupplement.name.trim();
    const trimmedQuantity = newSupplement.quantity.trim();

    if (!trimmedName || !trimmedQuantity) {
      Alert.alert('Champs requis', 'Merci de renseigner un nom et un dosage.');
      return;
    }

    const normalizedQuantity = trimmedQuantity.replace(',', '.');
    const quantityValue = Number.parseFloat(normalizedQuantity);

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      Alert.alert('Dosage invalide', "Merci d'indiquer une quantité numérique positive.");
      return;
    }

    const unitData = SUPPLEMENT_UNITS.find((u) => u.value === newSupplement.unit)!;
    const displayQuantity = Number.isInteger(quantityValue)
      ? quantityValue.toString()
      : quantityValue.toFixed(2).replace(/\.0+$/, '').replace(/0+$/, '');
    const dosage = `${displayQuantity} ${unitData.suffix}`;

    const supplementEntry: Supplement = {
      id: `supp-${Date.now()}`,
      name: trimmedName,
      dosage,
      timing: newSupplement.timing,
      type: 'other',
      available: true,
      quantity: quantityValue,
      unit: newSupplement.unit,
    };

    const updated = [...supplements, supplementEntry];
    setSupplementData({
      ...supplementData,
      available: updated,
    });
    resetForm();
    Keyboard.dismiss();
  };

  const handleRemoveSupplement = (id: string) => {
    const updated = supplements.filter((supp) => supp.id !== id);
    setSupplementData({
      ...supplementData,
      available: updated,
    });
  };

  const handleFinish = () => {
    onComplete?.();
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Compléments alimentaires</Text>
      <Text style={styles.stepSubtitle}>Ajoutez vos compléments pour les retrouver dans le tableau de bord.</Text>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Ajouter un complément</Text>
        <Input
          placeholder="Nom du complément"
          value={newSupplement.name}
          onChangeText={(text) => setNewSupplement((prev) => ({ ...prev, name: text }))}
        />

        <Input
          placeholder="Quantité"
          keyboardType={Platform.select({ ios: 'decimal-pad', android: 'numeric', default: 'numeric' })}
          inputMode="numeric"
          returnKeyType="done"
          value={newSupplement.quantity}
          onChangeText={(text) => setNewSupplement((prev) => ({ ...prev, quantity: text }))}
          style={styles.input}
        />
        <View style={styles.unitChipRow}>
          {SUPPLEMENT_UNITS.map((unit) => (
            <TouchableOpacity
              key={unit.value}
              style={[
                styles.chip,
                newSupplement.unit === unit.value && styles.chipActive,
              ]}
              onPress={() => setNewSupplement((prev) => ({ ...prev, unit: unit.value }))}
            >
              <Text
                style={[
                  styles.chipText,
                  newSupplement.unit === unit.value && styles.chipTextActive,
                ]}
              >
                {unit.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Timing</Text>
        <View style={styles.timingRow}>
          {SUPPLEMENT_TIMINGS_ORDER.map((timing) => (
            <TouchableOpacity
              key={timing}
              style={[
                styles.timingChip,
                newSupplement.timing === timing && styles.timingChipActive,
              ]}
              onPress={() => setNewSupplement((prev) => ({ ...prev, timing }))}
            >
              <Text
                style={[
                  styles.timingChipText,
                  newSupplement.timing === timing && styles.timingChipTextActive,
                ]}
              >
                {SUPPLEMENT_TIMINGS_LABELS[timing]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Ajouter"
          onPress={handleAddSupplement}
          variant="primary"
        />
      </Card>

      {supplements.length > 0 && (
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Suppléments enregistrés</Text>
          {supplements.map((supplement) => (
            <View key={supplement.id} style={styles.savedSupplementRow}>
              <View>
                <Text style={styles.savedSupplementName}>{supplement.name}</Text>
                <Text style={styles.savedSupplementDetails}>
                  {supplement.dosage} • {SUPPLEMENT_TIMINGS_LABELS[supplement.timing] ?? supplement.timing}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveSupplement(supplement.id)}>
                <Text style={styles.removeLink}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      )}

      <Button
        title={isLoading ? 'Enregistrement...' : 'Terminer'}
        onPress={handleFinish}
        disabled={isLoading}
        variant="primary"
        style={styles.continueButton}
      />
      {onBack && (
        <Button
          title="Retour"
          variant="outline"
          onPress={onBack}
          style={[styles.continueButton, styles.backButton]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  stepIndicator: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.textLight,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: Spacing.lg,
  },
  stepTitle: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    ...Typography.body,
    color: Colors.textLight,
    marginBottom: Spacing.xl,
  },
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  input: {
    marginBottom: Spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionColumn: {
    gap: Spacing.sm,
  },
  optionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  unitChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
    backgroundColor: Colors.background,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
  timingRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  timingChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.background,
  },
  timingChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  timingChipText: {
    ...Typography.caption,
    color: Colors.text,
  },
  timingChipTextActive: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  savedSupplementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  savedSupplementName: {
    ...Typography.body,
    color: Colors.text,
  },
  savedSupplementDetails: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: 2,
  },
  removeLink: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
  },
  fullWidthButton: {
    width: '100%',
  },
  actionRow: {
    marginTop: Spacing.xl,
  },
  continueButton: {
    width: '100%',
  },
  backButton: {
    marginTop: Spacing.md,
  },
});

export default OnboardingScreen;
