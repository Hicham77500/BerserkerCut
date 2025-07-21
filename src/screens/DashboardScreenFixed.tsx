/**
 * Écran du dashboard quotidien - Version corrigée
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { usePlan } from '../hooks/usePlan';
import { SupplementIntake, Meal, SupplementPlan } from '../types';
import { Colors, Typography, Spacing, BorderRadius } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MacroCard } from '../components/MacroCard';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { currentPlan, loading, error, generateDailyPlan, markSupplementTaken } = usePlan();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user && !currentPlan) {
      generateDailyPlan();
    }
  }, [user, currentPlan, generateDailyPlan]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await generateDailyPlan();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSupplementTaken = async (supplementId: string) => {
    try {
      await markSupplementTaken(supplementId);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de marquer le supplément comme pris');
    }
  };

  const renderMealCard = (meal: Meal) => (
    <Card key={meal.id} style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealTime}>{meal.time}</Text>
      </View>
      <View style={styles.mealDetails}>
        <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
        <View style={styles.mealMacros}>
          <Text style={styles.macroText}>P: {meal.macros.protein}g</Text>
          <Text style={styles.macroText}>C: {meal.macros.carbs}g</Text>
          <Text style={styles.macroText}>L: {meal.macros.fat}g</Text>
        </View>
      </View>
      <View style={styles.foodsList}>
        {meal.foods.map((food) => (
          <Text key={food.id} style={styles.foodText}>
            • {food.name} ({food.quantity}{food.unit})
          </Text>
        ))}
      </View>
    </Card>
  );

  const renderSupplementsByTiming = (timing: keyof SupplementPlan) => {
    if (!currentPlan) return null;
    
    const supplements = currentPlan.supplementPlan[timing];
    
    if (!supplements || supplements.length === 0) return null;

    return (
      <View style={styles.supplementTimingSection}>
        <Text style={styles.supplementTimingTitle}>
          {timing === 'morning' ? '🌅 Matin' : 
           timing === 'preWorkout' ? '💪 Pré-entraînement' :
           timing === 'postWorkout' ? '🏃‍♂️ Post-entraînement' :
           '🌙 Soir'}
        </Text>
        {supplements.map((intake: SupplementIntake) => (
          <TouchableOpacity
            key={intake.supplementId}
            style={[
              styles.supplementCard,
              intake.taken && styles.supplementTaken
            ]}
            onPress={() => handleSupplementTaken(intake.supplementId)}
          >
            <View style={styles.supplementContent}>
              <Text style={styles.supplementName}>
                {intake.taken ? '✅' : '⏺️'} {intake.name}
              </Text>
              <Text style={styles.supplementDosage}>{intake.dosage}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Génération de votre plan quotidien...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Button
            title="Réessayer"
            onPress={() => generateDailyPlan()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Bonjour {user.profile.name} ! 👋
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Day Type Badge */}
        {currentPlan && (
          <View style={styles.dayTypeContainer}>
            <View style={[
              styles.dayTypeBadge,
              currentPlan.dayType === 'training' ? styles.trainingDay : styles.restDay
            ]}>
              <Text style={styles.dayTypeText}>
                {currentPlan.dayType === 'training' ? '💪 Jour d\'entraînement' : '😴 Jour de repos'}
              </Text>
            </View>
          </View>
        )}

        {/* Daily Tip */}
        {currentPlan && (
          <Card style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Conseil du jour</Text>
            <Text style={styles.tipText}>{currentPlan.dailyTip}</Text>
          </Card>
        )}

        {/* Nutrition Summary */}
        {currentPlan && (
          <MacroCard
            protein={currentPlan.nutritionPlan.macros.protein}
            carbs={currentPlan.nutritionPlan.macros.carbs}
            fat={currentPlan.nutritionPlan.macros.fat}
            calories={currentPlan.nutritionPlan.totalCalories}
            title="Objectifs nutritionnels"
            showPercentages={true}
          />
        )}

        {/* Meals */}
        {currentPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍽️ Repas du jour</Text>
            {currentPlan.nutritionPlan.meals.map(renderMealCard)}
          </View>
        )}

        {/* Supplements */}
        {currentPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💊 Suppléments</Text>
            <Card>
              {renderSupplementsByTiming('morning')}
              {renderSupplementsByTiming('preWorkout')}
              {renderSupplementsByTiming('postWorkout')}
              {renderSupplementsByTiming('evening')}
            </Card>
          </View>
        )}

        {/* Demo Mode Notice */}
        <Card style={styles.demoCard}>
          <Text style={styles.demoText}>
            🚧 Mode démo activé - Les données sont simulées pour les tests
          </Text>
        </Card>
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
  
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  
  greeting: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  date: {
    ...Typography.body,
    color: Colors.textLight,
  },
  
  dayTypeContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  
  dayTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  
  trainingDay: {
    backgroundColor: Colors.primary + '20',
  },
  
  restDay: {
    backgroundColor: Colors.secondary + '20',
  },
  
  dayTypeText: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
  },
  
  tipCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },
  
  tipTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  
  tipText: {
    ...Typography.body,
    color: Colors.textLight,
    lineHeight: 22,
  },
  
  section: {
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  
  mealCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  mealName: {
    ...Typography.h4,
    color: Colors.text,
  },
  
  mealTime: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  
  mealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  mealCalories: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  mealMacros: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  
  macroText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  
  mealDescription: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    lineHeight: 18,
  },
  
  foodsList: {
    marginTop: Spacing.sm,
  },
  
  foodText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  
  supplementTimingSection: {
    marginBottom: Spacing.md,
  },
  
  supplementTimingTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  
  supplementCard: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  supplementTaken: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success,
  },
  
  supplementContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  supplementName: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  
  supplementDosage: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  loadingText: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  
  demoCard: {
    margin: Spacing.lg,
    backgroundColor: Colors.info + '20',
    borderWidth: 1,
    borderColor: Colors.info + '40',
    // Suppression de l'effet carré blanc sur Android
    elevation: 0,
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
  },
  
  demoText: {
    ...Typography.bodySmall,
    color: Colors.info,
    textAlign: 'center',
  },
});

export default DashboardScreen;
