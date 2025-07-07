/**
 * Écran d'onboarding modernisé avec étape santé
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { UserProfile, HealthProfile, TrainingProfile, SupplementProfile } from '../types';
import { ExtendedTrainingProfile } from '../types/TrainingProfile';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card, Button, Input, HealthStep, OnboardingTrainingStep } from '../components';
import HealthService from '../services/healthService';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

export const OnboardingScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // États pour chaque étape
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
    objective: 'cutting' as 'cutting' | 'recomposition' | 'maintenance',
  });

  const [healthData, setHealthData] = useState<Partial<HealthProfile>>({});
  
  const [extendedTrainingData, setExtendedTrainingData] = useState<Partial<ExtendedTrainingProfile>>({});
  
  const [trainingData, setTrainingData] = useState<Partial<TrainingProfile>>({
    trainingDays: [],
    experienceLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    preferredTimeSlots: ['morning'],
  });

  const [supplementData, setSupplementData] = useState<Partial<SupplementProfile>>({
    available: [],
    preferences: {
      preferNatural: false,
      budgetRange: 'medium',
      allergies: [],
    },
  });

  const [preferences, setPreferences] = useState({
    allergies: [] as string[],
    foodPreferences: [] as string[],
  });

  const handleStepComplete = (stepData: any) => {
    switch (currentStep) {
      case 0:
        setBasicInfo(stepData);
        break;
      case 1:
        setHealthData(stepData);
        break;
      case 2:
        setExtendedTrainingData(stepData);
        break;
      case 3:
        setSupplementData(stepData);
        break;
      case 4:
        setPreferences(stepData);
        break;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    
    try {
      // Construire le profil utilisateur complet
      const completeProfile: Partial<UserProfile> = {
        name: basicInfo.name,
        objective: basicInfo.objective,
        allergies: preferences.allergies,
        foodPreferences: preferences.foodPreferences,
        
        health: {
          ...healthData,
          gender: basicInfo.gender,
          dataSource: healthData.dataSource || {
            type: 'manual',
            isConnected: true,
          },
          lastUpdated: new Date(),
          isManualEntry: true,
        } as HealthProfile,
        
        training: {
          trainingDays: trainingData.trainingDays || [],
          experienceLevel: trainingData.experienceLevel || 'intermediate',
          preferredTimeSlots: trainingData.preferredTimeSlots || ['morning'],
        },
        
        supplements: {
          available: supplementData.available || [],
          preferences: supplementData.preferences || {
            preferNatural: false,
            budgetRange: 'medium',
            allergies: [],
          },
        },
      };

      // Sauvegarder les données de santé manuelles
      if (healthData.weight && healthData.height) {
        await HealthService.saveManualHealthData({
          weight: healthData.weight,
          height: healthData.height,
          steps: healthData.averageDailySteps,
          heartRate: healthData.restingHeartRate,
          sleepHours: healthData.averageSleepHours,
          timestamp: new Date(),
        });
      }

      await updateProfile(completeProfile);
      
      Alert.alert(
        'Profil créé !',
        'Votre profil a été configuré avec succès. Nous allons maintenant générer votre premier plan personnalisé.',
        [{ text: 'Commencer', style: 'default' }]
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la sauvegarde de votre profil. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Informations de base',
      subtitle: 'Parlez-nous de vous',
      component: (
        <BasicInfoStep
          initialData={basicInfo}
          onComplete={handleStepComplete}
        />
      ),
    },
    {
      id: 1,
      title: 'Santé et Activité',
      subtitle: 'Vos données de santé pour des plans personnalisés',
      component: (
        <HealthStep
          initialData={healthData}
          onComplete={handleStepComplete}
        />
      ),
    },
    {
      id: 2,
      title: 'Entraînement & Santé',
      subtitle: 'Configurez vos objectifs et déclarez votre état de santé',
      component: user ? (
        <OnboardingTrainingStep
          userId={user.id}
          onComplete={(data: ExtendedTrainingProfile) => handleStepComplete(data)}
          onBack={handleBack}
        />
      ) : null,
    },
    {
      id: 3,
      title: 'Suppléments',
      subtitle: 'Quels suppléments avez-vous disponibles ?',
      component: (
        <SupplementStep
          initialData={supplementData}
          onComplete={handleStepComplete}
        />
      ),
    },
    {
      id: 4,
      title: 'Préférences',
      subtitle: 'Allergies et préférences alimentaires',
      component: (
        <PreferencesStep
          initialData={preferences}
          onComplete={handleStepComplete}
        />
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec progression */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Étape {currentStep + 1} sur {steps.length}
          </Text>
        </View>
        
        {currentStep > 0 && (
          <Button
            title="Retour"
            variant="ghost"
            size="sm"
            onPress={handleBack}
            style={styles.backButton}
          />
        )}
      </View>

      {/* Contenu de l'étape */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
          
          {currentStepData.component}
        </View>
      </ScrollView>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <Card style={styles.loadingCard}>
            <Text style={styles.loadingText}>
              Configuration de votre profil...
            </Text>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
};

// Composants pour chaque étape
interface StepProps {
  initialData: any;
  onComplete: (data: any) => void;
}

const BasicInfoStep: React.FC<StepProps> = ({ initialData, onComplete }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [gender, setGender] = useState<'male' | 'female'>(initialData?.gender || 'male');
  const [objective, setObjective] = useState<'cutting' | 'recomposition' | 'maintenance'>(
    initialData?.objective || 'cutting'
  );

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }

    onComplete({ name: name.trim(), gender, objective });
  };

  return (
    <View>
      <Input
        label="Votre nom *"
        value={name}
        onChangeText={setName}
        placeholder="Ex: Marie Dupont"
      />

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

      <Button
        title="Continuer"
        onPress={handleSubmit}
        variant="primary"
        style={styles.continueButton}
      />
    </View>
  );
};

// Composants simplifiés pour les autres étapes (à développer)
const TrainingStep: React.FC<StepProps> = ({ initialData, onComplete }) => (
  <View>
    <Text style={styles.placeholderText}>
      Étape d'entraînement - À développer avec sélection des jours et types d'entraînement
    </Text>
    <Button
      title="Continuer (Démo)"
      onPress={() => onComplete(initialData)}
      variant="primary"
      style={styles.continueButton}
    />
  </View>
);

const SupplementStep: React.FC<StepProps> = ({ initialData, onComplete }) => (
  <View>
    <Text style={styles.placeholderText}>
      Étape suppléments - À développer avec sélection des suppléments disponibles
    </Text>
    <Button
      title="Continuer (Démo)"
      onPress={() => onComplete(initialData)}
      variant="primary"
      style={styles.continueButton}
    />
  </View>
);

const PreferencesStep: React.FC<StepProps> = ({ initialData, onComplete }) => (
  <View>
    <Text style={styles.placeholderText}>
      Étape préférences - À développer avec allergies et préférences alimentaires
    </Text>
    <Button
      title="Terminer (Démo)"
      onPress={() => onComplete(initialData)}
      variant="primary"
      style={styles.continueButton}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  } as ViewStyle,

  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as ViewStyle,

  progressContainer: {
    marginBottom: Spacing.md,
  } as ViewStyle,

  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  } as ViewStyle,

  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  } as ViewStyle,

  progressText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    textAlign: 'center',
  } as TextStyle,

  backButton: {
    alignSelf: 'flex-start',
  } as ViewStyle,

  content: {
    flex: 1,
  } as ViewStyle,

  stepContainer: {
    padding: Spacing.lg,
  } as ViewStyle,

  stepTitle: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  } as TextStyle,

  stepSubtitle: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  } as TextStyle,

  sectionCard: {
    marginBottom: Spacing.lg,
  } as ViewStyle,

  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
  } as TextStyle,

  optionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  } as ViewStyle,

  optionColumn: {
    gap: Spacing.sm,
  } as ViewStyle,

  optionButton: {
    flex: 1,
  } as ViewStyle,

  fullWidthButton: {
    width: '100%',
  } as ViewStyle,

  continueButton: {
    marginTop: Spacing.xl,
  } as ViewStyle,

  placeholderText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    padding: Spacing.xl,
    fontStyle: 'italic',
  } as TextStyle,

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  loadingCard: {
    margin: Spacing.xl,
    padding: Spacing.xl,
  } as ViewStyle,

  loadingText: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
  } as TextStyle,
});

export default OnboardingScreen;
