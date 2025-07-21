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
  Alert,
  Switch,
  Platform,
  Pressable
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
        objective: formData.objective,
        allergies: formData.allergies,
        foodPreferences: formData.foodPreferences,
        health: {
          weight: formData.weight,
          height: formData.height,
          age: formData.age,
          gender: formData.gender,
          activityLevel: formData.activityLevel,
          averageSleepHours: 8,
          dataSource: {
            type: 'manual',
            isConnected: false,
            permissions: []
          },
          lastUpdated: new Date(),
          isManualEntry: true
        },
        training: {
          trainingDays,
          experienceLevel: 'beginner',
          preferredTimeSlots: ['evening']
        },
        supplements: {
          available: availableSupplements,
          preferences: {
            preferNatural: false,
            budgetRange: 'medium',
            allergies: []
          }
        }
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
            
            {/* Section Genre - Refaite complètement */}
            <View style={styles.step2Section}>
              <Text style={styles.step2Label}>Genre:</Text>
              <View style={styles.step2ButtonContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.step2Button,
                    formData.gender === 'male' && styles.step2ButtonActive,
                    Platform.OS === 'android' && pressed && { opacity: 0.8 }
                  ]}
                  onPress={() => {
                    console.log('🔵 Genre Homme sélectionné');
                    setFormData({...formData, gender: 'male'});
                  }}
                  android_ripple={Platform.OS === 'android' ? { 
                    color: 'rgba(231, 76, 60, 0.2)', 
                    borderless: false 
                  } : undefined}
                >
                  <Text style={[
                    styles.step2ButtonText,
                    formData.gender === 'male' && styles.step2ButtonTextActive
                  ]}>
                    👨 Homme
                  </Text>
                </Pressable>
                
                <Pressable
                  style={({ pressed }) => [
                    styles.step2Button,
                    formData.gender === 'female' && styles.step2ButtonActive,
                    Platform.OS === 'android' && pressed && { opacity: 0.8 }
                  ]}
                  onPress={() => {
                    console.log('🔴 Genre Femme sélectionné');
                    setFormData({...formData, gender: 'female'});
                  }}
                  android_ripple={Platform.OS === 'android' ? { 
                    color: 'rgba(231, 76, 60, 0.2)', 
                    borderless: false 
                  } : undefined}
                >
                  <Text style={[
                    styles.step2ButtonText,
                    formData.gender === 'female' && styles.step2ButtonTextActive
                  ]}>
                    👩 Femme
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Section Objectif - Refaite complètement */}
            <View style={styles.step2Section}>
              <Text style={styles.step2Label}>Objectif:</Text>
              <View style={styles.step2ButtonContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.step2Button,
                    formData.objective === 'cutting' && styles.step2ButtonActive,
                    Platform.OS === 'android' && pressed && { opacity: 0.8 }
                  ]}
                  onPress={() => {
                    console.log('🟠 Objectif Sèche sélectionné');
                    setFormData({...formData, objective: 'cutting'});
                  }}
                  android_ripple={Platform.OS === 'android' ? { 
                    color: 'rgba(231, 76, 60, 0.2)', 
                    borderless: false 
                  } : undefined}
                >
                  <Text style={[
                    styles.step2ButtonText,
                    formData.objective === 'cutting' && styles.step2ButtonTextActive
                  ]}>
                    🔥 Sèche
                  </Text>
                </Pressable>
                
                <Pressable
                  style={({ pressed }) => [
                    styles.step2Button,
                    formData.objective === 'recomposition' && styles.step2ButtonActive,
                    Platform.OS === 'android' && pressed && { opacity: 0.8 }
                  ]}
                  onPress={() => {
                    console.log('🟡 Objectif Recomp sélectionné');
                    setFormData({...formData, objective: 'recomposition'});
                  }}
                  android_ripple={Platform.OS === 'android' ? { 
                    color: 'rgba(231, 76, 60, 0.2)', 
                    borderless: false 
                  } : undefined}
                >
                  <Text style={[
                    styles.step2ButtonText,
                    formData.objective === 'recomposition' && styles.step2ButtonTextActive
                  ]}>
                    💪 Recomp
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Niveau d'activité</Text>
            
            <View style={styles.activityCompactContainer}>
              {[
                { key: 'sedentary', label: 'Sédentaire', icon: '😴', desc: 'Pas d\'exercice' },
                { key: 'light', label: 'Léger', icon: '🚶', desc: '1-3x/sem' },
                { key: 'moderate', label: 'Modéré', icon: '🏃', desc: '3-5x/sem' },
                { key: 'active', label: 'Actif', icon: '💪', desc: '6-7x/sem' },
                { key: 'very_active', label: 'Très actif', icon: '🔥', desc: '2x/jour' }
              ].map(activity => (
                <Pressable
                  key={activity.key}
                  style={({ pressed }) => [
                    styles.activityChipButton,
                    formData.activityLevel === activity.key && styles.activityChipButtonActive,
                    // Style de press spécial Android pour éviter les effets visuels
                    Platform.OS === 'android' && pressed && {
                      opacity: 0.8,
                      transform: [{ scale: 0.98 }],
                    }
                  ]}
                  onPress={() => setFormData({...formData, activityLevel: activity.key as any})}
                  android_ripple={Platform.OS === 'android' ? { 
                    color: 'rgba(255, 107, 53, 0.2)', 
                    borderless: false,
                    radius: 60
                  } : undefined}
                >
                  <View style={styles.activityChipContent}>
                    <Text style={styles.activityChipIcon}>{activity.icon}</Text>
                    <Text style={[
                      styles.activityChipText,
                      formData.activityLevel === activity.key && styles.activityChipTextActive
                    ]}>
                      {activity.label}
                    </Text>
                    <Text style={[
                      styles.activityChipDesc,
                      formData.activityLevel === activity.key && styles.activityChipDescActive
                    ]}>
                      {activity.desc}
                    </Text>
                  </View>
                </Pressable>
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
    <View style={styles.container}>
      <View style={styles.scrollableContent}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    ...(Platform.OS === 'web' ? {
      height: '100vh' as any,
      display: 'flex' as any,
      flexDirection: 'column' as any,
    } : {}),
  },
  scrollableContent: {
    flex: 1,
    ...(Platform.OS === 'web' ? {
      overflowY: 'auto' as any,
      height: '100%' as any,
      minHeight: '100vh' as any,
    } : {}),
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
    // Suppression de l'effet carré blanc sur Android
    ...(Platform.OS === 'android' ? {
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
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
  
  // ===== STYLES ÉTAPE 2 REFAITS COMPLÈTEMENT ===== 
  // Séparation totale Android/iOS pour éviter tout conflit
  step2Section: {
    marginBottom: 24,
    width: '100%',
  },
  step2Label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'left',
  },
  step2ButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
    flexShrink: 0,
  },
  step2Button: {
    flex: 1,
    padding: Platform.OS === 'android' ? 16 : 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Platform.OS === 'android' ? 12 : 10,
    borderWidth: Platform.OS === 'android' ? 2 : 1,
    borderColor: Platform.OS === 'android' ? '#d1d5db' : '#ddd',
    backgroundColor: Platform.OS === 'android' ? '#ffffff' : '#f9f9f9',
    minHeight: Platform.OS === 'android' ? 52 : 48,
    
    // ANDROID : Suppression totale des effets visuels
    ...(Platform.OS === 'android' ? {
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      shadowColor: 'transparent',
      overflow: 'hidden',
      backfaceVisibility: 'hidden',
    } : {
      // iOS : Design natif avec ombres subtiles
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
    }),
  },
  step2ButtonActive: {
    borderColor: Platform.OS === 'android' ? '#ff6b35' : '#e74c3c',
    backgroundColor: Platform.OS === 'android' ? '#ff6b35' : '#e74c3c',
    
    // ANDROID : Pas d'ombres même actif
    ...(Platform.OS === 'android' ? {
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      shadowColor: 'transparent',
      overflow: 'hidden',
      backfaceVisibility: 'hidden',
    } : {
      // iOS : Ombre plus marquée quand actif
      shadowColor: '#e74c3c',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    }),
  },
  step2ButtonText: {
    fontSize: Platform.OS === 'android' ? 15 : 16,
    fontWeight: Platform.OS === 'android' ? '600' : '500',
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: Platform.OS === 'android' ? 20 : 22,
  },
  step2ButtonTextActive: {
    color: '#ffffff',
    fontWeight: Platform.OS === 'android' ? '700' : '600',
  },
  // ===== FIN STYLES ÉTAPE 2 ===== 
  activityCompactContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  activityChipButton: {
    flex: 1,
    minWidth: '48%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 12,
    // HACK Android : forcer un arrière-plan complètement opaque pour éviter les effets
    backgroundColor: Platform.OS === 'android' ? '#ffffff' : '#f9f9f9',
    // Design moderne spécial Android - suppression TOTALE des ombres
    ...(Platform.OS === 'android' ? {
      borderWidth: 2,
      borderColor: '#d1d5db',
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      shadowColor: 'transparent',
      // Hack supplémentaire pour Android
      overflow: 'hidden',
      backfaceVisibility: 'hidden',
    } : {
      borderWidth: 1,
      borderColor: '#ddd',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }),
  },
  activityChipButtonActive: {
    // HACK Android : couleur complètement opaque pour éviter les effets de transparence
    backgroundColor: Platform.OS === 'android' ? '#ff6b35' : '#e74c3c',
    // Design actif moderne pour Android avec suppression TOTALE des ombres
    ...(Platform.OS === 'android' ? {
      borderColor: '#ff6b35',
      borderWidth: 2,
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      shadowColor: 'transparent',
      // Hack supplémentaire pour Android
      overflow: 'hidden',
      backfaceVisibility: 'hidden',
    } : {
      borderColor: '#e74c3c',
      shadowColor: '#e74c3c',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    }),
  },
  activityChipContent: {
    alignItems: 'center',
    width: '100%',
  },
  activityChipIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activityChipText: {
    fontSize: Platform.OS === 'android' ? 13 : 14,
    fontWeight: Platform.OS === 'android' ? '600' : '500',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 2,
  },
  activityChipTextActive: {
    color: 'white',
    fontWeight: Platform.OS === 'android' ? '700' : '600',
  },
  activityChipDesc: {
    fontSize: Platform.OS === 'android' ? 10 : 11,
    color: '#7f8c8d',
    textAlign: 'center',
    fontWeight: Platform.OS === 'android' ? '500' : '400',
  },
  activityChipDescActive: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: Platform.OS === 'android' ? '600' : '500',
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
    // Suppression de l'effet carré blanc sur Android
    ...(Platform.OS === 'android' ? {
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      borderWidth: 2,
      borderColor: 'rgba(221, 221, 221, 0.8)',
    } : {}),
  },
  dayButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
    // Suppression de l'effet carré blanc sur Android pour l'état actif
    ...(Platform.OS === 'android' ? {
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      borderWidth: 2,
    } : {}),
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
    // Suppression de l'effet carré blanc sur Android
    ...(Platform.OS === 'android' ? {
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      borderWidth: 2,
      borderColor: 'rgba(221, 221, 221, 0.8)',
    } : {}),
  },
  supplementButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
    // Suppression de l'effet carré blanc sur Android pour l'état actif
    ...(Platform.OS === 'android' ? {
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      borderWidth: 2,
    } : {}),
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
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
    paddingBottom: 20,
  },
});
