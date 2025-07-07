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
  // États partagés entre les étapes
  const [userData, setUserData] = useState<Partial<UserProfile>>({
    gender: 'male',
    objective: 'recomposition'
  });
  const [healthData, setHealthData] = useState<Partial<HealthProfile>>({
    hasLimitations: false,
    declareGoodHealth: true,
    acknowledgeDisclaimer: true
  });
  const [trainingData, setTrainingData] = useState<Partial<TrainingProfile>>({});
  const [supplementData, setSupplementData] = useState<Partial<SupplementProfile>>({});
  const [extendedTrainingData, setExtendedTrainingData] = useState<Partial<ExtendedTrainingProfile>>({});

  // Navigation entre les étapes
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const { createProfile } = useAuth();

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
    setIsLoading(true);
    try {
      const completeProfile: UserProfile = {
        name: userData.name || '',
        age: userData.age || 25,
        weight: userData.weight || 70,
        height: userData.height || 170,
        gender: userData.gender || 'male',
        objective: userData.objective || 'recomposition',
        activityLevel: userData.activityLevel || 'moderate',
      };

      await createProfile(completeProfile);
      Alert.alert('Succès', 'Votre profil a été créé avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de votre profil.');
      console.error('Erreur création profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 && <Step1 userData={userData} setUserData={setUserData} onNext={handleNextStep} />}
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
            trainingData={extendedTrainingData}
            setTrainingData={setExtendedTrainingData}
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
  userData: Partial<UserProfile>;
  setUserData: (data: Partial<UserProfile>) => void;
}

const Step1: React.FC<Step1Props> = ({ userData, setUserData, onNext }) => {
  const [name, setName] = useState(userData.name || '');
  const [age, setAge] = useState(userData.age?.toString() || '');
  const [weight, setWeight] = useState(userData.weight?.toString() || '');
  const [height, setHeight] = useState(userData.height?.toString() || '');
  const [gender, setGender] = useState(userData.gender || 'male');
  const [objective, setObjective] = useState(userData.objective || 'recomposition');

  const handleSubmit = () => {
    if (!name || !age || !weight || !height) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setUserData({
      ...userData,
      name,
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
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
          style={styles.input}
        />
        <View style={styles.row}>
          <Input
            placeholder="Âge"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
          />
          <Input
            placeholder="Poids (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
          />
        </View>
        <Input
          placeholder="Taille (cm)"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
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
const Step2: React.FC<any> = ({ onNext, onBack }) => (
  <HealthStep 
    onComplete={onNext}
    onBack={onBack}
    title="Continuer (Démo)"
  />
);

const Step3: React.FC<any> = ({ onNext, onBack }) => (
  <OnboardingTrainingStep
    onComplete={onNext}
    onBack={onBack}
    userId="demo-user"
  />
);

const Step4: React.FC<any> = ({ onComplete, onBack }) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Compléments alimentaires</Text>
    <Text style={styles.stepSubtitle}>Optimisez vos résultats (optionnel)</Text>
    <Button
      title="Terminer (Démo)"
      onPress={onComplete}
      variant="primary"
      style={styles.continueButton}
    />
  </View>
);

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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
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
  fullWidthButton: {
    width: '100%',
  },
  continueButton: {
    marginTop: Spacing.xl,
  },
});

export default OnboardingScreen;
