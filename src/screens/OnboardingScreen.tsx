/**
 * Écran d'onboarding pour collecter les informations utilisateur
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { OnboardingData, TrainingDay } from '../types';

export const OnboardingScreen: React.FC = () => {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    weight: 0,
    height: 0,
    age: 0,
    gender: 'male',
    activityLevel: 'moderate',
    objective: 'cutting',
    trainingDays: [],
    availableSupplements: [],
    allergies: [],
    foodPreferences: []
  });

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Convertir les jours d'entraînement en format attendu
      const trainingDays: TrainingDay[] = formData.trainingDays.map(day => ({
        dayOfWeek: parseInt(day),
        type: 'strength',
        timeSlot: 'morning',
        duration: 60
      }));

      // Convertir les suppléments en format attendu
      const availableSupplements = formData.availableSupplements.map(supplementName => ({
        id: supplementName.toLowerCase().replace(/\s+/g, '_'),
        name: supplementName,
        type: 'other' as const,
        dosage: '1 portion',
        timing: 'morning' as const,
        available: true
      }));

      await updateProfile({
        name: formData.name,
        weight: formData.weight,
        height: formData.height,
        age: formData.age,
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        objective: formData.objective,
        trainingDays,
        availableSupplements,
        allergies: formData.allergies,
        foodPreferences: formData.foodPreferences
      });

      Alert.alert('Succès', 'Profil configuré avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la configuration du profil');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Informations personnelles</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nom"
              value={formData.name}
              onChangeText={text => setFormData({...formData, name: text})}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Poids (kg)"
              value={formData.weight.toString()}
              onChangeText={text => setFormData({...formData, weight: parseFloat(text) || 0})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Taille (cm)"
              value={formData.height.toString()}
              onChangeText={text => setFormData({...formData, height: parseFloat(text) || 0})}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Âge"
              value={formData.age.toString()}
              onChangeText={text => setFormData({...formData, age: parseInt(text) || 0})}
              keyboardType="numeric"
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Genre et objectif</Text>
            
            <View style={styles.segmentContainer}>
              <Text style={styles.label}>Genre:</Text>
              <View style={styles.segmentButtons}>
                <TouchableOpacity
                  style={[styles.segmentButton, formData.gender === 'male' && styles.segmentButtonActive]}
                  onPress={() => setFormData({...formData, gender: 'male'})}
                >
                  <Text style={[styles.segmentButtonText, formData.gender === 'male' && styles.segmentButtonTextActive]}>
                    Homme
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentButton, formData.gender === 'female' && styles.segmentButtonActive]}
                  onPress={() => setFormData({...formData, gender: 'female'})}
                >
                  <Text style={[styles.segmentButtonText, formData.gender === 'female' && styles.segmentButtonTextActive]}>
                    Femme
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.segmentContainer}>
              <Text style={styles.label}>Objectif:</Text>
              <View style={styles.segmentButtons}>
                <TouchableOpacity
                  style={[styles.segmentButton, formData.objective === 'cutting' && styles.segmentButtonActive]}
                  onPress={() => setFormData({...formData, objective: 'cutting'})}
                >
                  <Text style={[styles.segmentButtonText, formData.objective === 'cutting' && styles.segmentButtonTextActive]}>
                    Sèche
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentButton, formData.objective === 'recomposition' && styles.segmentButtonActive]}
                  onPress={() => setFormData({...formData, objective: 'recomposition'})}
                >
                  <Text style={[styles.segmentButtonText, formData.objective === 'recomposition' && styles.segmentButtonTextActive]}>
                    Recomp
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Niveau d'activité</Text>
            
            <View style={styles.activityContainer}>
              {[
                { key: 'sedentary', label: 'Sédentaire', desc: 'Pas d\'exercice' },
                { key: 'light', label: 'Léger', desc: '1-3 fois/semaine' },
                { key: 'moderate', label: 'Modéré', desc: '3-5 fois/semaine' },
                { key: 'active', label: 'Actif', desc: '6-7 fois/semaine' },
                { key: 'very_active', label: 'Très actif', desc: '2x/jour' }
              ].map(activity => (
                <TouchableOpacity
                  key={activity.key}
                  style={[
                    styles.activityButton,
                    formData.activityLevel === activity.key && styles.activityButtonActive
                  ]}
                  onPress={() => setFormData({...formData, activityLevel: activity.key as any})}
                >
                  <Text style={[
                    styles.activityButtonText,
                    formData.activityLevel === activity.key && styles.activityButtonTextActive
                  ]}>
                    {activity.label}
                  </Text>
                  <Text style={styles.activityButtonDesc}>{activity.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Jours d'entraînement</Text>
            <Text style={styles.stepSubtitle}>Sélectionnez vos jours d'entraînement</Text>
            
            <View style={styles.daysContainer}>
              {[
                { key: '1', label: 'Lundi' },
                { key: '2', label: 'Mardi' },
                { key: '3', label: 'Mercredi' },
                { key: '4', label: 'Jeudi' },
                { key: '5', label: 'Vendredi' },
                { key: '6', label: 'Samedi' },
                { key: '0', label: 'Dimanche' }
              ].map(day => (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayButton,
                    formData.trainingDays.includes(day.key) && styles.dayButtonActive
                  ]}
                  onPress={() => {
                    const days = formData.trainingDays.includes(day.key)
                      ? formData.trainingDays.filter(d => d !== day.key)
                      : [...formData.trainingDays, day.key];
                    setFormData({...formData, trainingDays: days});
                  }}
                >
                  <Text style={[
                    styles.dayButtonText,
                    formData.trainingDays.includes(day.key) && styles.dayButtonTextActive
                  ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Suppléments disponibles</Text>
            <Text style={styles.stepSubtitle}>Quels suppléments avez-vous ?</Text>
            
            <View style={styles.supplementsContainer}>
              {[
                'Whey Protein',
                'Créatine',
                'Pre-workout',
                'BCAA',
                'Multivitamines',
                'Oméga-3',
                'Brûleur de graisse',
                'Glutamine'
              ].map(supplement => (
                <TouchableOpacity
                  key={supplement}
                  style={[
                    styles.supplementButton,
                    formData.availableSupplements.includes(supplement) && styles.supplementButtonActive
                  ]}
                  onPress={() => {
                    const supplements = formData.availableSupplements.includes(supplement)
                      ? formData.availableSupplements.filter(s => s !== supplement)
                      : [...formData.availableSupplements, supplement];
                    setFormData({...formData, availableSupplements: supplements});
                  }}
                >
                  <Text style={[
                    styles.supplementButtonText,
                    formData.availableSupplements.includes(supplement) && styles.supplementButtonTextActive
                  ]}>
                    {supplement}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.weight > 0 && formData.height > 0 && formData.age > 0;
      case 2:
        return formData.gender && formData.objective;
      case 3:
        return formData.activityLevel;
      case 4:
        return formData.trainingDays.length > 0;
      case 5:
        return true; // Suppléments optionnels
      default:
        return false;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuration du profil</Text>
        <Text style={styles.progress}>Étape {step} sur 5</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 5) * 100}%` }]} />
      </View>

      {renderStep()}

      <View style={styles.buttons}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.buttonSecondaryText}>Précédent</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, !canProceed() && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canProceed() || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Chargement...' : (step === 5 ? 'Terminer' : 'Suivant')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  progress: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e74c3c',
    borderRadius: 2,
  },
  stepContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  segmentContainer: {
    marginBottom: 20,
  },
  segmentButtons: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  segmentButtonActive: {
    backgroundColor: '#e74c3c',
  },
  segmentButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  segmentButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  activityContainer: {
    gap: 12,
  },
  activityButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  activityButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  activityButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  activityButtonTextActive: {
    color: 'white',
  },
  activityButtonDesc: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dayButton: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  dayButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  supplementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  supplementButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
  },
  supplementButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  supplementButtonText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  supplementButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#ecf0f1',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },
});
