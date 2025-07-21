/**
 * Composants pour l'étape santé de l'onboarding
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card } from './Card';
import { Input } from './Input'; 
import { Button } from './Button';
import { HealthProfile } from '../types';
import HealthService from '../services/healthService';

interface HealthStepProps {
  onComplete: (healthData: Partial<HealthProfile>) => void;
  initialData?: Partial<HealthProfile>;
}

export const HealthStep: React.FC<HealthStepProps> = ({
  onComplete,
  initialData,
}) => {
  const [weight, setWeight] = useState(initialData?.weight?.toString() || '');
  const [height, setHeight] = useState(initialData?.height?.toString() || '');
  const [age, setAge] = useState(initialData?.age?.toString() || '');
  const [sleepHours, setSleepHours] = useState(
    initialData?.averageSleepHours?.toString() || '7'
  );
  const [activityLevel, setActivityLevel] = useState<HealthProfile['activityLevel']>(
    initialData?.activityLevel || 'moderate'
  );
  const [dailySteps, setDailySteps] = useState(
    initialData?.averageDailySteps?.toString() || ''
  );
  const [restingHeartRate, setRestingHeartRate] = useState(
    initialData?.restingHeartRate?.toString() || ''
  );

  const validateAndSubmit = () => {
    // Validation des champs obligatoires
    if (!weight || !height || !age) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires (poids, taille, âge)');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);
    const sleepNum = parseFloat(sleepHours);

    // Validation des valeurs
    if (weightNum < 30 || weightNum > 300) {
      Alert.alert('Erreur', 'Le poids doit être entre 30 et 300 kg');
      return;
    }

    if (heightNum < 100 || heightNum > 250) {
      Alert.alert('Erreur', 'La taille doit être entre 100 et 250 cm');
      return;
    }

    if (ageNum < 13 || ageNum > 99) {
      Alert.alert('Erreur', 'L\'âge doit être entre 13 et 99 ans');
      return;
    }

    if (sleepNum < 1 || sleepNum > 12) {
      Alert.alert('Erreur', 'Le temps de sommeil doit être entre 1 et 12 heures');
      return;
    }

    // Validation des champs optionnels
    if (dailySteps && (parseInt(dailySteps) < 0 || parseInt(dailySteps) > 50000)) {
      Alert.alert('Erreur', 'Le nombre de pas doit être entre 0 et 50000');
      return;
    }

    if (restingHeartRate && (parseInt(restingHeartRate) < 40 || parseInt(restingHeartRate) > 200)) {
      Alert.alert('Erreur', 'La fréquence cardiaque doit être entre 40 et 200 bpm');
      return;
    }

    // Calculer l'IMC
    const bmi = HealthService.calculateBMI(weightNum, heightNum);
    const bmiCategory = HealthService.getBMICategory(bmi);

    // Estimer le niveau d'activité si les pas sont fournis
    let estimatedActivityLevel = activityLevel;
    if (dailySteps) {
      estimatedActivityLevel = HealthService.estimateActivityLevel(parseInt(dailySteps));
    }

    const healthData: Partial<HealthProfile> = {
      weight: weightNum,
      height: heightNum,
      age: ageNum,
      averageSleepHours: sleepNum,
      activityLevel: estimatedActivityLevel,
      averageDailySteps: dailySteps ? parseInt(dailySteps) : undefined,
      restingHeartRate: restingHeartRate ? parseInt(restingHeartRate) : undefined,
      dataSource: {
        type: 'manual',
        isConnected: true,
      },
      lastUpdated: new Date(),
      isManualEntry: true,
    };

    onComplete(healthData);
  };

  const getBMIInfo = () => {
    if (!weight || !height) return null;
    
    const bmi = HealthService.calculateBMI(parseFloat(weight), parseFloat(height));
    const category = HealthService.getBMICategory(bmi);
    
    return { bmi: bmi.toFixed(1), category };
  };

  const bmiInfo = getBMIInfo();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informations de santé et activité</Text>
      <Text style={styles.subtitle}>
        Ces informations nous aident à personnaliser vos plans nutritionnels
      </Text>

      {/* Informations de base */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Informations de base</Text>
        
        <Input
          label="Poids (kg) *"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="70"
        />
        
        <Input
          label="Taille (cm) *"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholder="175"
        />
        
        <Input
          label="Âge *"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          placeholder="25"
        />

        {bmiInfo && (
          <View style={styles.bmiContainer}>
            <Text style={styles.bmiText}>
              IMC: {bmiInfo.bmi} ({bmiInfo.category})
            </Text>
          </View>
        )}
      </Card>

      {/* Niveau d'activité */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>🏃‍♂️ Niveau d'activité</Text>
        
        <ActivityLevelSelector
          value={activityLevel}
          onChange={setActivityLevel}
        />
        
        <Input
          label="Sommeil moyen (heures/nuit) *"
          value={sleepHours}
          onChangeText={setSleepHours}
          keyboardType="numeric"
          placeholder="7"
        />
      </Card>

      {/* Données optionnelles */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Données optionnelles</Text>
        <Text style={styles.optionalText}>
          Ces informations nous aident à mieux comprendre votre profil
        </Text>
        
        <Input
          label="Nombre de pas quotidien moyen"
          value={dailySteps}
          onChangeText={setDailySteps}
          keyboardType="numeric"
          placeholder="8000"
          helper="Moyenne sur une semaine normale"
        />
        
        <Input
          label="Fréquence cardiaque au repos (bpm)"
          value={restingHeartRate}
          onChangeText={setRestingHeartRate}
          keyboardType="numeric"
          placeholder="70"
          helper="Mesurée le matin au réveil"
        />
      </Card>

      <Button
        title="Continuer"
        onPress={validateAndSubmit}
        variant="primary"
        style={styles.continueButton}
      />
    </View>
  );
};

interface ActivityLevelSelectorProps {
  value: HealthProfile['activityLevel'];
  onChange: (level: HealthProfile['activityLevel']) => void;
}

const ActivityLevelSelector: React.FC<ActivityLevelSelectorProps> = ({
  value,
  onChange,
}) => {
  const options = [
    {
      value: 'sedentary' as const,
      label: 'Sédentaire',
      description: 'Peu ou pas d\'exercice, travail de bureau',
      emoji: '🪑',
    },
    {
      value: 'light' as const,
      label: 'Légèrement actif',
      description: 'Exercice léger 1-3 jours/semaine',
      emoji: '🚶‍♂️',
    },
    {
      value: 'moderate' as const,
      label: 'Modérément actif',
      description: 'Exercice modéré 3-5 jours/semaine',
      emoji: '🏃‍♂️',
    },
    {
      value: 'active' as const,
      label: 'Actif',
      description: 'Exercice intense 6-7 jours/semaine',
      emoji: '💪',
    },
    {
      value: 'very_active' as const,
      label: 'Très actif',
      description: 'Exercice très intense ou physique',
      emoji: '🏋️‍♂️',
    },
  ];

  return (
    <View style={styles.activityContainer}>
      {options.map((option) => (
        <ActivityOption
          key={option.value}
          option={option}
          isSelected={value === option.value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
};

interface ActivityOptionProps {
  option: {
    value: HealthProfile['activityLevel'];
    label: string;
    description: string;
    emoji: string;
  };
  isSelected: boolean;
  onPress: () => void;
}

const ActivityOption: React.FC<ActivityOptionProps> = ({
  option,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress}>
    <Card
      style={[
        styles.activityOption,
        isSelected && styles.activityOptionSelected,
      ]}
    >
      <View style={styles.activityContent}>
        <Text style={styles.activityEmoji}>{option.emoji}</Text>
        <View style={styles.activityTextContainer}>
          <Text style={[
            styles.activityLabel,
            isSelected && styles.activityLabelSelected,
          ]}>
            {option.label}
          </Text>
          <Text style={styles.activityDescription}>
            {option.description}
          </Text>
        </View>
      </View>
    </Card>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  } as ViewStyle,

  title: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  } as TextStyle,

  subtitle: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  } as TextStyle,

  section: {
    marginBottom: Spacing.lg,
  } as ViewStyle,

  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
  } as TextStyle,

  optionalText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  } as TextStyle,

  bmiContainer: {
    backgroundColor: Colors.info + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  } as ViewStyle,

  bmiText: {
    ...Typography.body,
    color: Colors.info,
    textAlign: 'center',
    fontWeight: '600',
  } as TextStyle,

  activityContainer: {
    marginBottom: Spacing.md,
  } as ViewStyle,

  activityOption: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  } as ViewStyle,

  activityOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  } as ViewStyle,

  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  activityEmoji: {
    fontSize: 24,
    marginRight: Spacing.md,
  } as TextStyle,

  activityTextContainer: {
    flex: 1,
  } as ViewStyle,

  activityLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  } as TextStyle,

  activityLabelSelected: {
    color: Colors.primary,
  } as TextStyle,

  activityDescription: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  } as TextStyle,

  continueButton: {
    marginTop: Spacing.xl,
  } as ViewStyle,
});

export default HealthStep;
