import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { usePlan } from '@/hooks/usePlan';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Colors, Typography, Spacing, BorderRadius } from '@/utils/theme';
import {
  Card,
  Button,
  IOSButton,
  IOSCheckbox,
  TimePickerModal,
  NutritionGoalsModal,
  MealEditModal,
} from '@/components';
import { DailyPlan, Meal, NutritionPlan, SupplementIntake, SupplementPlan, SupplementFormType } from '@/types';
import { getSecureItem } from '@/utils/storage/secureStorage';
import { CLOUD_CONSENT_STORAGE_KEY } from '@/constants/storageKeys';
import PhotoService from '@/services/photo';
import photoStorage, { MealPhoto, StoredPhoto } from '@/services/photoStorage';

const buildMacroSummary = (plan: DailyPlan | null, palette: typeof Colors) => {
  if (!plan) {
    return null;
  }
  return [
    { label: 'Protéines', value: `${plan.nutritionPlan.macros.protein} g`, color: palette.protein },
    { label: 'Glucides', value: `${plan.nutritionPlan.macros.carbs} g`, color: palette.carbs },
    { label: 'Lipides', value: `${plan.nutritionPlan.macros.fat} g`, color: palette.fat },
  ];
};

const recalculateTotalsFromMeals = (meals: Meal[]) => {
  const aggregate = meals.reduce(
    (acc, meal) => {
      acc.totalCalories += meal.calories;
      acc.protein += meal.macros.protein;
      acc.carbs += meal.macros.carbs;
      acc.fat += meal.macros.fat;
      return acc;
    },
    { totalCalories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return {
    totalCalories: aggregate.totalCalories,
    macros: {
      protein: aggregate.protein,
      carbs: aggregate.carbs,
      fat: aggregate.fat,
    },
  };
};

const SUPPLEMENT_SLOT_LABELS: Record<string, string> = {
  morning: 'Matin',
  preWorkout: 'Avant séance',
  postWorkout: 'Après séance',
  evening: 'Soir',
  with_meals: 'Avec les repas',
};

const SUPPLEMENT_SLOT_ORDER = ['morning', 'preWorkout', 'postWorkout', 'evening', 'with_meals'];

const getSupplementUnitLabel = (unit?: SupplementFormType): string => {
  if (!unit) return '';
  switch (unit) {
    case 'gram':
      return 'g';
    case 'capsule':
      return 'capsule(s)';
    case 'milliliter':
      return 'ml';
    default:
      return '';
  }
};

const formatSupplementIntakeDescription = (intake: SupplementIntake): string => {
  if (intake.dosage) {
    return intake.dosage;
  }
  if (intake.quantity && intake.unit) {
    return `${intake.quantity} ${getSupplementUnitLabel(intake.unit)}`.trim();
  }
  return '';
};

export const NutritionScreen: React.FC = () => {
  const { colors, navigationTheme } = useThemeMode();
  const navigation = useNavigation<any>();
  const { currentPlan, loading, updatePlan, supplementStatus, toggleSupplement } = usePlan();
  const [nutritionModalVisible, setNutritionModalVisible] = useState(false);
  const [mealEditModalVisible, setMealEditModalVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [photosByMeal, setPhotosByMeal] = useState<Record<string, MealPhoto[]>>({});
  const [cloudConsent, setCloudConsent] = useState(false);
  const [savingMealId, setSavingMealId] = useState<string | null>(null);
  const [pendingSupplementId, setPendingSupplementId] = useState<string | null>(null);
  
  const styles = useMemo(
    () => createStyles(colors, navigationTheme.colors.card),
    [colors, navigationTheme.colors.card],
  );

  const supplementSections = useMemo(() => {
    if (!currentPlan) {
      return [] as Array<{ slot: string; label: string; supplements: SupplementIntake[] }>;
    }

    const entries = Object.entries(currentPlan.supplementPlan) as Array<
      [keyof SupplementPlan | string, SupplementIntake[]]
    >;

    return entries
      .filter(([, list]) => list.length > 0)
      .sort((a, b) => {
        const indexA = SUPPLEMENT_SLOT_ORDER.indexOf(a[0]);
        const indexB = SUPPLEMENT_SLOT_ORDER.indexOf(b[0]);
        const safeIndexA = indexA === -1 ? SUPPLEMENT_SLOT_ORDER.length : indexA;
        const safeIndexB = indexB === -1 ? SUPPLEMENT_SLOT_ORDER.length : indexB;
        return safeIndexA - safeIndexB;
      })
      .map(([slot, supplements]) => ({
        slot,
        label: SUPPLEMENT_SLOT_LABELS[slot] ?? slot,
        supplements,
      }));
  }, [currentPlan]);

  const loadMealPhotos = useCallback(async () => {
    const stored = await photoStorage.loadMealPhotosByMeal();
    setPhotosByMeal(stored);
  }, []);

  useEffect(() => {
    (async () => {
      const consentValue = await getSecureItem(CLOUD_CONSENT_STORAGE_KEY);
      setCloudConsent(consentValue === 'true');
      await loadMealPhotos();
    })();
  }, [loadMealPhotos]);

  useFocusEffect(
    useCallback(() => {
      loadMealPhotos();
    }, [loadMealPhotos])
  );

  const persistMealPhotos = useCallback(async (map: Record<string, MealPhoto[]>) => {
    setPhotosByMeal(map);
    await photoStorage.saveMealPhotoMap(map);
  }, []);

  const addPhotoToGallery = useCallback(async (photo: StoredPhoto) => {
    await photoStorage.pushToGallery(photo);
  }, []);

  const handleCaptureMealPhoto = useCallback(
    async (meal: Meal) => {
      setSavingMealId(meal.id);
      try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== ImagePicker.PermissionStatus.GRANTED) {
          Alert.alert('Permission requise', 'Veuillez autoriser la caméra pour ajouter une photo de repas.');
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          quality: 0.6,
          allowsEditing: true,
        });

        if (result.canceled || !result.assets?.length) {
          return;
        }

        const timestamp = Date.now();
        const identifier = `${meal.id}-${timestamp}`;
        const managedUri = await photoStorage.ensureLocalCopy(result.assets[0].uri, identifier);

        const newPhoto: MealPhoto = {
          id: identifier,
          mealId: meal.id,
          uri: managedUri,
          timestamp,
        };

        const updatedMap = {
          ...photosByMeal,
          [meal.id]: [...(photosByMeal[meal.id] ?? []), newPhoto],
        };
        await persistMealPhotos(updatedMap);

        await addPhotoToGallery({ id: newPhoto.id, uri: newPhoto.uri, timestamp: newPhoto.timestamp });

        if (cloudConsent) {
          PhotoService.uploadPhoto({ id: newPhoto.id, uri: newPhoto.uri, timestamp: newPhoto.timestamp })
            .then(async (record) => {
              if (!record) return;
              const gallery = await photoStorage.loadGallery();
              const updated = gallery.map((item) =>
                item.timestamp === newPhoto.timestamp
                  ? { ...item, id: record.id, cloudSynced: true }
                  : item
              );
              await photoStorage.setGallery(updated);
            })
            .catch((error) => console.warn('[NutritionScreen] upload meal photo error', error));
        }
      } catch (error) {
        console.warn('[NutritionScreen] capture error', error);
        Alert.alert('Erreur', 'Impossible de prendre la photo. Réessayez.');
      } finally {
        setSavingMealId(null);
      }
    },
    [photosByMeal, persistMealPhotos, addPhotoToGallery, cloudConsent]
  );

  const macroSummary = buildMacroSummary(currentPlan ?? null, colors);

  const handleEditMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setMealEditModalVisible(true);
  };
  
  const handleEditMealTime = (meal: Meal) => {
    setSelectedMeal(meal);
    setTimePickerVisible(true);
  };
  
  const handleSaveMealTime = async (newTime: string) => {
    if (!currentPlan || !selectedMeal) return;
    
    try {
      // Find the meal to update
      const mealIndex = currentPlan.nutritionPlan.meals.findIndex(
        (m) => m.id === selectedMeal.id
      );
      
      if (mealIndex === -1) return;
      
      // Create updated meal with new time
      const updatedMeal = {
        ...selectedMeal,
        time: newTime
      };
      
      // Create updated meals array
      const updatedMeals = [...currentPlan.nutritionPlan.meals];
      updatedMeals[mealIndex] = updatedMeal;
      
      await updatePlan(currentPlan.id, {
        nutritionPlan: {
          ...currentPlan.nutritionPlan,
          meals: updatedMeals,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'heure du repas:', error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour l\'heure du repas. Veuillez réessayer.'
      );
    }
  };
  
  const handleSaveMeal = async (updatedMeal: Meal) => {
    if (!currentPlan || !selectedMeal) return;
    
    try {
      // Find the index of the meal to update
      const mealIndex = currentPlan.nutritionPlan.meals.findIndex(
        (m) => m.id === updatedMeal.id
      );
      
      if (mealIndex === -1) {
        Alert.alert('Erreur', 'Impossible de trouver le repas à mettre à jour.');
        return;
      }
      
      // Create updated meals array with the new meal
      const updatedMeals = [...currentPlan.nutritionPlan.meals];
      updatedMeals[mealIndex] = updatedMeal;

      const totals = recalculateTotalsFromMeals(updatedMeals);

      await updatePlan(currentPlan.id, {
        nutritionPlan: {
          ...currentPlan.nutritionPlan,
          meals: updatedMeals,
          totalCalories: totals.totalCalories,
          macros: totals.macros,
        },
      });

      setMealEditModalVisible(false);
      setSelectedMeal(null);
      
      Alert.alert('Repas mis à jour', 'Votre repas a été modifié avec succès.');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du repas:', error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour le repas. Veuillez réessayer.'
      );
    }
  };

  const handleSaveNutritionPlan = async (updatedNutritionPlan: NutritionPlan) => {
    if (!currentPlan) return;
    
    try {
      // Update the plan in state first for better UX
      await updatePlan(currentPlan.id, {
        nutritionPlan: updatedNutritionPlan,
      });
      
      Alert.alert(
        'Plan mis à jour',
        'Vos objectifs nutritionnels ont été actualisés avec succès.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du plan:', error);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour vos objectifs nutritionnels. Veuillez réessayer.'
      );
    }
  };

  const handleToggleSupplement = async (supplementId: string) => {
    if (!toggleSupplement || pendingSupplementId) return;

    setPendingSupplementId(supplementId);
    try {
      await toggleSupplement(supplementId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du supplément:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut du supplément.');
    } finally {
      setPendingSupplementId(null);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea} testID="nutrition-screen">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <Text style={styles.title}>Objectifs nutritionnels</Text>
          <View style={styles.macroRow}>
            <Text style={styles.macroCalories}>
              {loading
                ? 'Chargement…'
                : currentPlan
                ? `${currentPlan.nutritionPlan.totalCalories} kcal`
                : 'Pas de plan pour aujourd\'hui'}
            </Text>
            
            {currentPlan && (
              <IOSButton
                label="Adapter"
                variant="secondary"
                onPress={() => setNutritionModalVisible(true)}
              />
            )}
          </View>
          {macroSummary ? (
            <View style={styles.macroList}>
              {macroSummary.map((macro) => (
                <View key={macro.label} style={styles.macroItem}>
                  <View style={[styles.macroDot, { backgroundColor: macro.color }]} />
                  <Text style={styles.macroLabel}>{macro.label}</Text>
                  <Text style={styles.macroValue}>{macro.value}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Repas du jour</Text>
          <Text style={styles.sectionSubtitle}>
            Capture une photo de chaque repas pour suivre visuellement ta nutrition quotidienne.
          </Text>

          {loading ? (
            <Text style={styles.placeholder}>Chargement du plan…</Text>
          ) : currentPlan && currentPlan.nutritionPlan.meals.length ? (
            currentPlan.nutritionPlan.meals.map((meal) => {
              const photos = photosByMeal[meal.id] ?? [];
              const latestPhoto = photos.slice().sort((a, b) => b.timestamp - a.timestamp)[0];
              return (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.mealTitle}>{meal.name}</Text>
                        <TouchableOpacity 
                          onPress={() => handleEditMeal(meal)}
                          style={styles.editButton}
                        >
                          <Text style={styles.editButtonText}>Éditer</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.mealTime}>{meal.time}</Text>
                        <TouchableOpacity
                          style={{ marginLeft: 8, padding: 4 }}
                          onPress={() => handleEditMealTime(meal)}
                        >
                          <Text style={{ fontSize: 16 }}>⏰</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View>
                      <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                      <Text style={styles.mealMacros}>
                        {meal.macros.protein}p / {meal.macros.carbs}g / {meal.macros.fat}l
                      </Text>
                    </View>
                  </View>

                  <View style={styles.foodList}>
                    {meal.foods.map((food) => (
                      <View key={food.id} style={styles.foodRow}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodQuantity}>
                          {food.quantity}
                          {food.unit}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {latestPhoto ? (
                    <View style={styles.mealPhotoPreview}>
                      <Image source={{ uri: latestPhoto.uri }} style={styles.mealPhoto} />
                      <Text style={styles.mealPhotoLabel}>
                        Dernière photo • {new Date(latestPhoto.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  ) : null}

                  <Button
                    title={savingMealId === meal.id ? 'Ouverture caméra…' : 'Prendre une photo'}
                    onPress={() => handleCaptureMealPhoto(meal)}
                    disabled={savingMealId === meal.id}
                    loading={savingMealId === meal.id}
                    fullWidth
                    style={styles.mealButton}
                  />

                  {photos.length ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.photoStrip}
                    >
                      {photos
                        .slice()
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((photo) => (
                          <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                        ))}
                    </ScrollView>
                  ) : null}
                </View>
              );
            })
          ) : (
            <Text style={styles.placeholder}>Aucun repas planifié pour aujourd'hui.</Text>
          )}

          <TouchableOpacity
            style={styles.galleryLink}
            onPress={() => navigation.getParent()?.navigate('ProfileStack' as never, { screen: 'Photos' } as never)}
          >
            <Text style={styles.galleryLinkText}>Ouvrir la galerie complète</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Suppléments du jour</Text>
          <Text style={styles.sectionSubtitle}>
            Visualise et valide tes compléments pour rester aligné·e avec ta stratégie de sèche.
          </Text>

          {currentPlan && supplementSections.length > 0 ? (
            <View style={styles.supplementSectionList}>
              {supplementSections.map((section) => (
                <View key={section.slot} style={styles.supplementSection}>
                  <View style={styles.supplementSectionHeader}>
                    <Text style={styles.supplementSectionTitle}>{section.label}</Text>
                    <View style={styles.supplementBadge}>
                      <Text style={styles.supplementBadgeText}>
                        {section.supplements.length}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.supplementList}>
                    {section.supplements.map((supplement) => (
                      <IOSCheckbox
                        key={supplement.supplementId}
                        checked={
                          supplementStatus[supplement.supplementId] ??
                          supplement.taken ??
                          false
                        }
                        onChange={() => handleToggleSupplement(supplement.supplementId)}
                        disabled={pendingSupplementId === supplement.supplementId}
                        label={supplement.name}
                        description={formatSupplementIntakeDescription(supplement)}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.placeholder}>
              Aucun supplément n’est prévu pour aujourd’hui. Configure-les depuis ton profil.
            </Text>
          )}
        </Card>
      </ScrollView>
      
      {currentPlan && (
        <NutritionGoalsModal
          visible={nutritionModalVisible}
          onClose={() => setNutritionModalVisible(false)}
          onSave={handleSaveNutritionPlan}
          nutritionPlan={currentPlan.nutritionPlan}
          isTrainingDay={currentPlan.dayType === 'training'}
        />
      )}
      
      {selectedMeal && (
        <MealEditModal
          visible={mealEditModalVisible}
          onClose={() => setMealEditModalVisible(false)}
          onSave={handleSaveMeal}
          meal={selectedMeal}
        />
      )}
      
      {selectedMeal && (
        <TimePickerModal
          visible={timePickerVisible}
          onClose={() => setTimePickerVisible(false)}
          onSave={handleSaveMealTime}
          initialTime={selectedMeal.time}
          title="Modifier l'heure du repas"
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (palette: typeof Colors, cardColor: string) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    scroll: {
      flex: 1,
      backgroundColor: palette.background,
    },
    editButton: {
      backgroundColor: palette.secondary,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
    },
    editButtonText: {
      ...Typography.caption,
      color: palette.primary,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xl,
      gap: Spacing.lg,
      backgroundColor: palette.background,
    },
    card: {
      backgroundColor: cardColor,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    title: {
      ...Typography.h2,
      color: palette.text,
    },
    macroRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    macroCalories: {
      ...Typography.h3,
      color: palette.text,
    },
    macroList: {
      gap: Spacing.sm,
    },
    macroItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    macroDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    macroLabel: {
      ...Typography.bodySmall,
      color: palette.textLight,
      flex: 1,
    },
    macroValue: {
      ...Typography.body,
      color: palette.text,
      fontWeight: '600',
    },
    sectionTitle: {
      ...Typography.h2,
      color: palette.text,
    },
    sectionSubtitle: {
      ...Typography.bodySmall,
      color: palette.textLight,
    },
    placeholder: {
      ...Typography.body,
      color: palette.textLight,
    },
    supplementSectionList: {
      gap: Spacing.md,
    },
    supplementSection: {
      paddingVertical: Spacing.sm,
      gap: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.border,
    },
    supplementSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    supplementSectionTitle: {
      ...Typography.h4,
      color: palette.text,
    },
    supplementBadge: {
      minWidth: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: palette.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.xs,
    },
    supplementBadgeText: {
      ...Typography.caption,
      color: palette.text,
      fontWeight: '600',
    },
    supplementList: {
      gap: Spacing.sm,
    },
    mealCard: {
      backgroundColor: cardColor,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      gap: Spacing.md,
    },
    mealHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    mealTitle: {
      ...Typography.h3,
      color: palette.text,
    },
    mealTime: {
      ...Typography.bodySmall,
      color: palette.textLight,
    },
    mealCalories: {
      ...Typography.body,
      color: palette.text,
      textAlign: 'right',
    },
    mealMacros: {
      ...Typography.caption,
      color: palette.textLight,
      textAlign: 'right',
    },
    foodList: {
      gap: Spacing.xs,
    },
    foodRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    foodName: {
      ...Typography.bodySmall,
      color: palette.text,
      flex: 1,
    },
    foodQuantity: {
      ...Typography.bodySmall,
      color: palette.textLight,
      marginLeft: Spacing.sm,
    },
    mealPhotoPreview: {
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
      backgroundColor: palette.secondaryLight,
    },
    mealPhoto: {
      width: '100%',
      height: 160,
    },
    mealPhotoLabel: {
      ...Typography.caption,
      color: palette.textLight,
      padding: Spacing.xs,
      textAlign: 'center',
    },
    mealButton: {
      marginTop: Spacing.xs,
    },
    photoStrip: {
      gap: Spacing.sm,
      paddingTop: Spacing.xs,
    },
    photoThumbnail: {
      width: 72,
      height: 72,
      borderRadius: BorderRadius.md,
      backgroundColor: palette.secondary,
    },
    galleryLink: {
      alignSelf: 'center',
      marginTop: Spacing.sm,
    },
    galleryLinkText: {
      ...Typography.bodySmall,
      color: palette.primary,
      textDecorationLine: 'underline',
    },
  });

export default NutritionScreen;
