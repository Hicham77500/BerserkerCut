import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  View,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlan } from '../../hooks/usePlan';
import { Colors, Typography, Spacing, BorderRadius } from '../../utils/theme';
import { Card, IOSCheckbox, CircularProgress } from '../../components';
import DesignSystem from '../../utils/designSystem';
import { SupplementPlan, SupplementIntake } from '../../types';

const SLOT_LABELS: Record<keyof SupplementPlan | 'with_meals', string> = {
  morning: 'Matin',
  preWorkout: 'Avant la séance',
  postWorkout: 'Après la séance',
  evening: 'Soir',
  with_meals: 'Avec les repas',
};

const SLOT_ORDER: Array<keyof SupplementPlan | 'with_meals'> = [
  'morning',
  'preWorkout',
  'postWorkout',
  'evening',
  'with_meals',
];

interface SupplementListItemProps {
  intake: SupplementIntake;
  taken: boolean;
  disabled: boolean;
  onToggle: () => void;
}

const SupplementListItem: React.FC<SupplementListItemProps> = ({
  intake,
  taken,
  disabled,
  onToggle,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: taken ? 1.04 : 1,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start(() => {
      if (taken) {
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 120,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [taken, scale]);

  const description = [intake.dosage, intake.time].filter(Boolean).join(' • ');

  return (
    <Animated.View style={[styles.supplementItem, { transform: [{ scale }] }]}>
      <IOSCheckbox
        checked={taken}
        onChange={onToggle}
        disabled={disabled}
        label={intake.name}
        description={description || undefined}
      />
    </Animated.View>
  );
};

export const SupplementsScreen: React.FC = () => {
  const {
    currentPlan,
    toggleSupplement,
    supplementStatus,
    supplementProgress,
  } = usePlan();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sections = useMemo(() => {
    if (!currentPlan) {
      return [];
    }

    const entries = Object.entries(currentPlan.supplementPlan) as Array<
      [keyof SupplementPlan, SupplementIntake[]]
    >;

    return entries
      .filter(([, list]) => list.length > 0)
      .sort((a, b) => SLOT_ORDER.indexOf(a[0]) - SLOT_ORDER.indexOf(b[0]))
      .map(([slot, list]) => ({
        slot,
        label: SLOT_LABELS[slot] ?? slot,
        supplements: list,
      }));
  }, [currentPlan]);

  const handleToggle = async (supplementId: string) => {
    if (pendingId) return;
    setPendingId(supplementId);
    Vibration.vibrate(15);

    try {
      await toggleSupplement(supplementId);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut du supplément.');
    } finally {
      setPendingId(null);
    }
  };

  const thereAreSupplements = sections.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={[styles.card, styles.progressCard]}>
          <CircularProgress
            progress={supplementProgress.percentage / 100}
            size={140}
            strokeWidth={10}
          >
            <Text style={styles.progressValue}>{supplementProgress.percentage}%</Text>
            <Text style={styles.progressLabel}>
              {supplementProgress.completed}/{supplementProgress.total}
            </Text>
          </CircularProgress>
          <View style={styles.progressTextBlock}>
            <Text style={styles.progressTitle}>Checklist du jour</Text>
            <Text style={styles.progressSubtitle}>
              Validez vos prises de suppléments tout au long de la journée.
            </Text>
          </View>
        </Card>

        {thereAreSupplements ? (
          sections.map((section) => (
            <Card key={section.slot} style={styles.card}>
              <Text style={styles.sectionTitle}>{section.label}</Text>
              <View style={styles.sectionList}>
                {section.supplements.map((supplement) => (
                  <SupplementListItem
                    key={supplement.supplementId}
                    intake={supplement}
                    taken={supplementStatus[supplement.supplementId] ?? supplement.taken ?? false}
                    disabled={pendingId === supplement.supplementId}
                    onToggle={() => handleToggle(supplement.supplementId)}
                  />
                ))}
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.card}>
            <Text style={styles.emptyText}>
              Aucun supplément n’est prévu pour aujourd’hui. Ajoutez vos compléments préférés
              depuis votre profil pour démarrer le suivi quotidien.
            </Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: DesignSystem.layout.screenPadding,
    paddingVertical: DesignSystem.layout.sectionGap,
    gap: DesignSystem.layout.sectionGap,
  },
  card: {
    gap: Spacing.md,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  progressTextBlock: {
    flex: 1,
    gap: Spacing.sm,
  },
  progressTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  progressSubtitle: {
    ...Typography.body,
    color: Colors.textLight,
  },
  progressValue: {
    ...Typography.h2,
    color: Colors.text,
  },
  progressLabel: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  sectionTitle: {
    ...Typography.body,
    color: Colors.text,
    textTransform: 'uppercase',
  },
  sectionList: {
    gap: Spacing.sm,
  },
  supplementItem: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textLight,
  },
});

export default SupplementsScreen;
