/**
 * Dashboard interactif avec sections réordonnables.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Modal,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { usePlan } from '../hooks/usePlan';
import { SupplementIntake, Meal, SupplementPlan } from '../types';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { MacroCard } from '../components/MacroCard';

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getMealCategory = (name: string): 'breakfast' | 'lunch' | 'snack' | 'dinner' => {
  const normalized = normalizeText(name);

  if (normalized.includes('petit') && normalized.includes('dejeuner')) {
    return 'breakfast';
  }

  if (normalized.includes('breakfast') || normalized.includes('matin') || normalized.includes('morning')) {
    return 'breakfast';
  }

  if (normalized.includes('collation') || normalized.includes('snack') || normalized.includes('encas')) {
    return 'snack';
  }

  if (
    (normalized.includes('diner') && !normalized.includes('petit')) ||
    normalized.includes('souper') ||
    normalized.includes('soir') ||
    normalized.includes('evening')
  ) {
    return 'dinner';
  }

  if (normalized.includes('dejeuner') || normalized.includes('lunch') || normalized.includes('midi')) {
    return 'lunch';
  }

  return 'lunch';
};

type SectionId = 'overview' | 'tip' | 'nutrition' | 'meals' | 'supplements' | 'demo';
interface SectionConfig {
  id: SectionId;
  visible: boolean;
}

const DASHBOARD_SECTIONS: Record<SectionId, string> = {
  overview: 'Aperçu du jour',
  tip: 'Conseil du jour',
  nutrition: 'Objectifs nutritionnels',
  meals: 'Repas du jour',
  supplements: 'Suppléments',
  demo: 'Informations',
};

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'overview', visible: true },
  { id: 'tip', visible: true },
  { id: 'nutrition', visible: true },
  { id: 'meals', visible: true },
  { id: 'supplements', visible: true },
  { id: 'demo', visible: true },
];

const STORAGE_KEY = '@dashboard_sections_v1';

const MEAL_FILTERS: Array<{ label: string; value: 'all' | 'breakfast' | 'lunch' | 'snack' | 'dinner' }> = [
  { label: 'Tous', value: 'all' },
  { label: 'Petit-déj', value: 'breakfast' },
  { label: 'Déjeuner', value: 'lunch' },
  { label: 'Collations', value: 'snack' },
  { label: 'Dîner', value: 'dinner' },
];

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { currentPlan, loading, error, generateDailyPlan, markSupplementTaken } = usePlan();
  const [refreshing, setRefreshing] = useState(false);
  const [activeMealFilter, setActiveMealFilter] = useState<'all' | 'breakfast' | 'lunch' | 'snack' | 'dinner'>('all');
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({});
  const [consumedMeals, setConsumedMeals] = useState<Record<string, boolean>>({});
  const [sectionConfigs, setSectionConfigs] = useState<SectionConfig[]>(DEFAULT_SECTIONS);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const persistSections = useCallback(async (configs: SectionConfig[]) => {
    setSectionConfigs(configs);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    } catch (storageError) {
      console.warn('Impossible de sauvegarder la configuration du dashboard:', storageError);
    }
  }, []);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: SectionConfig[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length) {
            setSectionConfigs(parsed);
          }
        }
      } catch (storageError) {
        console.warn('Impossible de charger la configuration du dashboard:', storageError);
      }
    };
    loadSections();
  }, []);

  useEffect(() => {
    if (user && !currentPlan) {
      generateDailyPlan();
    }
  }, [user, currentPlan, generateDailyPlan]);

  useEffect(() => {
    if (currentPlan) {
      const initialState: Record<string, boolean> = {};
      currentPlan.nutritionPlan.meals.forEach((meal) => {
        initialState[meal.id] = consumedMeals[meal.id] ?? false;
      });
      setConsumedMeals(initialState);
    }
  }, [currentPlan]);

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
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de marquer le supplément comme pris');
    }
  };

  const toggleMealExpanded = (mealId: string) => {
    setExpandedMeals((prev) => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  const toggleMealConsumed = (mealId: string) => {
    setConsumedMeals((prev) => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  const filteredMeals = useMemo(() => {
    if (!currentPlan) return [];
    const meals = currentPlan.nutritionPlan.meals;
    if (activeMealFilter === 'all') return meals;
    return meals.filter((meal) => getMealCategory(meal.name) === activeMealFilter);
  }, [currentPlan, activeMealFilter]);

  const visibleSections = sectionConfigs.filter((section) => section.visible);

  const moveSection = (id: SectionId, direction: 'up' | 'down') => {
    const currentIndex = sectionConfigs.findIndex((section) => section.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sectionConfigs.length) return;

    const updated = [...sectionConfigs];
    const [removed] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, removed);
    persistSections(updated);
  };

  const toggleSectionVisibility = (id: SectionId) => {
    const updated = sectionConfigs.map((section) =>
      section.id === id ? { ...section, visible: !section.visible } : section
    );
    persistSections(updated);
  };

  const renderMealCard = (meal: Meal) => {
    const isExpanded = expandedMeals[meal.id];
    const isConsumed = consumedMeals[meal.id];

    return (
      <View key={meal.id} style={[styles.mealCard, isConsumed && styles.mealCardConsumed]}>
        <TouchableOpacity style={styles.mealHeader} onPress={() => toggleMealExpanded(meal.id)}>
          <View>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealTime}>{meal.time}</Text>
          </View>
          <View style={styles.mealHeaderActions}>
            <TouchableOpacity
              onPress={() => toggleMealConsumed(meal.id)}
              style={[styles.consumeBadge, isConsumed && styles.consumeBadgeActive]}
            >
              <Text style={styles.consumeBadgeText}>{isConsumed ? 'Pris' : 'À prendre'}</Text>
            </TouchableOpacity>
            <Text style={styles.toggleIcon}>{isExpanded ? '︿' : '﹀'}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.mealDetails}>
          <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
          <View style={styles.mealMacros}>
            <Text style={styles.macroText}>P: {meal.macros.protein}g</Text>
            <Text style={styles.macroText}>C: {meal.macros.carbs}g</Text>
            <Text style={styles.macroText}>L: {meal.macros.fat}g</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.foodsList}>
            {meal.foods.map((food) => (
              <View key={food.id} style={styles.foodRow}>
                <View>
                  <Text style={styles.foodText}>{food.name}</Text>
                  <Text style={styles.foodQuantity}>{food.quantity}{food.unit}</Text>
                </View>
                <Text style={styles.foodCalories}>{food.calories} kcal</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSupplementsByTiming = (timing: keyof SupplementPlan) => {
    if (!currentPlan) return null;
    const supplements = currentPlan.supplementPlan[timing];
    if (!supplements || supplements.length === 0) return null;

    return (
      <View style={styles.supplementTimingSection}>
        <Text style={styles.supplementTimingTitle}>
          {timing === 'morning'
            ? '🌅 Matin'
            : timing === 'preWorkout'
            ? '💪 Pré-entraînement'
            : timing === 'postWorkout'
            ? '🏃‍♂️ Post-entraînement'
            : '🌙 Soir'}
        </Text>
        {supplements.map((intake: SupplementIntake) => (
          <TouchableOpacity
            key={intake.supplementId}
            style={[styles.supplementCard, intake.taken && styles.supplementTaken]}
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

  const renderOverview = () => {
    if (!user || !currentPlan) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Bienvenue {user?.profile.name ?? ''} !</Text>
          <Text style={styles.emptyStateSubtitle}>
            Génère ton premier plan pour démarrer ta journée BerserkerCut.
          </Text>
          <Button title="Générer un plan" onPress={generateDailyPlan} variant="primary" />
        </View>
      );
    }

    const dateLabel = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    return (
      <View style={styles.overviewContainer}>
        <View>
          <Text style={styles.overviewTitle}>Bonjour {user.profile.name || 'Berserker'} 👋</Text>
          <Text style={styles.overviewDate}>{dateLabel}</Text>
        </View>
        <TouchableOpacity
          style={[styles.badge, currentPlan.dayType === 'training' ? styles.trainingBadge : styles.restBadge]}
          activeOpacity={0.85}
          onPress={() => {
            Alert.alert(
              currentPlan.dayType === 'training' ? 'Jour d\'entraînement' : 'Jour de repos',
              currentPlan.dayType === 'training'
                ? 'Prépare ton corps : hydratation, échauffement et énergie suffisante pour la séance.'
                : 'Profite de ce jour de repos pour récupérer, t\'étirer et planifier tes repas.'
            );
          }}
        >
          <Text style={styles.badgeText}>
            {currentPlan.dayType === 'training' ? 'Jour d\'entraînement' : 'Jour de repos'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTip = () => {
    if (!currentPlan) return null;
    return (
      <View>
        <Text style={styles.sectionSubtitle}>À retenir aujourd'hui</Text>
        <Text style={styles.tipText}>{currentPlan.dailyTip}</Text>
      </View>
    );
  };

  const renderNutrition = () => {
    if (!currentPlan) return null;
    return (
      <MacroCard
        protein={currentPlan.nutritionPlan.macros.protein}
        carbs={currentPlan.nutritionPlan.macros.carbs}
        fat={currentPlan.nutritionPlan.macros.fat}
        calories={currentPlan.nutritionPlan.totalCalories}
        title="Objectifs nutritionnels"
        showPercentages
      />
    );
  };

  const renderMeals = () => {
    if (!currentPlan) return null;
    return (
      <View style={styles.mealsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          {MEAL_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[styles.filterChip, activeMealFilter === filter.value && styles.filterChipActive]}
              onPress={() => setActiveMealFilter(filter.value)}
            >
              <Text
                style={[styles.filterChipText, activeMealFilter === filter.value && styles.filterChipTextActive]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.mealCardsList}>
          {filteredMeals.length > 0 ? (
            filteredMeals.map(renderMealCard)
          ) : (
            <View style={styles.emptyMealContainer}>
              <Text style={styles.emptyText}>Aucun repas pour cette catégorie aujourd'hui.</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSupplements = () => {
    if (!currentPlan) return null;
    return (
      <View style={styles.supplementsGrid}>
        {(['morning', 'preWorkout', 'postWorkout', 'evening'] as Array<keyof SupplementPlan>).map((timing) => (
          <Card key={timing} style={styles.supplementTimingCard}>
            {renderSupplementsByTiming(timing) || (
              <Text style={styles.emptySupplementText}>Aucun supplément prévu</Text>
            )}
          </Card>
        ))}
      </View>
    );
  };

  const renderDemoNotice = () => (
    <View style={styles.demoCardContent}>
      <Text style={styles.demoTitle}>Mode démo activé</Text>
      <Text style={styles.demoText}>Les données présentées sont simulées pour faciliter les tests.</Text>
    </View>
  );

  const renderSection = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'overview':
        return renderOverview();
      case 'tip':
        return renderTip();
      case 'nutrition':
        return renderNutrition();
      case 'meals':
        return renderMeals();
      case 'supplements':
        return renderSupplements();
      case 'demo':
        return renderDemoNotice();
      default:
        return null;
    }
  };

  const Header = () => (
    <View style={[styles.header, { paddingTop: insets.top + Spacing.xs }] }>
      <View style={styles.headerTextGroup}>
        <Text style={styles.screenTitle}>Dashboard</Text>
        <Text style={styles.screenSubtitle}>Organise ta journée comme tu le souhaites</Text>
      </View>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setSettingsVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.settingsButtonText}>Personnaliser</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Génération de votre plan quotidien...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Button title="Réessayer" onPress={() => generateDailyPlan()} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Header />
      <ScrollView
        style={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.contentContainer}
      >
        {visibleSections.map((section) => (
          <Card key={section.id} style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>{DASHBOARD_SECTIONS[section.id]}</Text>
            {renderSection(section.id)}
          </Card>
        ))}
      </ScrollView>

      <Modal
        transparent
        animationType="slide"
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Personnaliser le dashboard</Text>
            <Text style={styles.modalSubtitle}>
              Affiche, masque ou réordonne les sections selon tes priorités.
            </Text>

            <ScrollView style={styles.modalList}>
              {sectionConfigs.map((section, index) => (
                <View key={section.id} style={styles.modalRow}>
                  <View style={styles.modalRowText}>
                    <Text style={styles.modalRowTitle}>{DASHBOARD_SECTIONS[section.id]}</Text>
                    <Text style={styles.modalRowSubtitle}>
                      {section.visible ? 'Visible' : 'Masqué'}
                    </Text>
                  </View>
                  <View style={styles.modalRowActions}>
                    <TouchableOpacity
                      onPress={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                      style={[styles.moveButton, index === 0 && styles.moveButtonDisabled]}
                    >
                      <Text style={styles.moveButtonText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveSection(section.id, 'down')}
                      disabled={index === sectionConfigs.length - 1}
                      style={[
                        styles.moveButton,
                        index === sectionConfigs.length - 1 && styles.moveButtonDisabled,
                      ]}
                    >
                      <Text style={styles.moveButtonText}>↓</Text>
                    </TouchableOpacity>
                    <Switch
                      value={section.visible}
                      onValueChange={() => toggleSectionVisibility(section.id)}
                      trackColor={{ false: Colors.border, true: Colors.primary }}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>

            <Button title="Fermer" onPress={() => setSettingsVisible(false)} style={styles.closeButton} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTextGroup: {
    gap: Spacing.xs,
    flex: 1,
  },
  screenTitle: {
    ...Typography.h2,
    color: Colors.textDark,
  },
  screenSubtitle: {
    ...Typography.body,
    color: Colors.textDark,
    opacity: 0.75,
  },
  settingsButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginLeft: Spacing.md,
  },
  settingsButtonText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  contentContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  sectionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    ...Shadows.sm,
    gap: Spacing.md,
  },
  sectionHeading: {
    ...Typography.h3,
    color: Colors.text,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  overviewTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  overviewDate: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  badge: {
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.textDark,
    fontWeight: '600',
  },
  trainingBadge: {
    backgroundColor: Colors.primary + '33',
  },
  restBadge: {
    backgroundColor: Colors.info + '33',
  },
  tipText: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  mealsContainer: {
    gap: Spacing.md,
  },
  filtersContainer: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
    backgroundColor: Colors.background,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.textDark,
  },
  mealCardsList: {
    gap: Spacing.sm,
  },
  mealCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  mealCardConsumed: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '15',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  consumeBadge: {
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.background,
  },
  consumeBadgeActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '30',
  },
  consumeBadgeText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  toggleIcon: {
    ...Typography.body,
    color: Colors.textLight,
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
    paddingVertical: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
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
  foodsList: {
    gap: Spacing.xs,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  foodText: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '500',
  },
  foodQuantity: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  foodCalories: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  supplementsGrid: {
    gap: Spacing.md,
  },
  supplementTimingCard: {
    padding: Spacing.md,
  },
  supplementTimingSection: {
    gap: Spacing.sm,
  },
  supplementTimingTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  supplementCard: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  supplementTaken: {
    backgroundColor: Colors.success + '15',
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
  },
  supplementDosage: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  emptyMealContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    textAlign: 'center',
  },
  emptySupplementText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    textAlign: 'center',
    padding: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyStateTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  emptyStateSubtitle: {
    ...Typography.body,
    color: Colors.textLight,
    textAlign: 'center',
  },
  demoCardContent: {
    gap: Spacing.sm,
  },
  demoTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  demoText: {
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
    gap: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
    gap: Spacing.md,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  modalSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textLight,
  },
  modalList: {
    maxHeight: 400,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  modalRowText: {
    flex: 1,
    gap: 4,
  },
  modalRowTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  modalRowSubtitle: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  modalRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  moveButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moveButtonDisabled: {
    opacity: 0.3,
  },
  moveButtonText: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  closeButton: {
    marginTop: Spacing.sm,
  },
});

export default DashboardScreen;
