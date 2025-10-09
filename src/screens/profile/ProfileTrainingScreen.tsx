import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { Button, Card, Input, IOSButton, TimePickerModal } from '../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../utils/theme';
import { TrainingDay, TrainingProfile } from '../../types';

const WEEKDAYS = [
  { key: 1, label: 'Lundi' },
  { key: 2, label: 'Mardi' },
  { key: 3, label: 'Mercredi' },
  { key: 4, label: 'Jeudi' },
  { key: 5, label: 'Vendredi' },
  { key: 6, label: 'Samedi' },
  { key: 0, label: 'Dimanche' },
];

const TRAINING_TYPE_OPTIONS: Array<{ value: TrainingDay['type']; label: string }> = [
  { value: 'strength', label: 'Musculation' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'mixed', label: 'Mixte / HIIT' },
  { value: 'active_recovery', label: 'Repos actif' },
  { value: 'rest', label: 'Repos' },
];

const DEFAULT_START_TIME = '18:00';
const DEFAULT_DURATION = 45;

const deriveTimeSlotFromStartTime = (time: string): TrainingDay['timeSlot'] => {
  const [hoursString] = time.split(':');
  const hours = Number.parseInt(hoursString ?? '0', 10);

  if (Number.isNaN(hours)) {
    return undefined;
  }

  if (hours >= 5 && hours < 12) {
    return 'morning';
  }

  if (hours >= 12 && hours < 17) {
    return 'afternoon';
  }

  return 'evening';
};

const getWeekdayLabel = (dayOfWeek: number): string => {
  const match = WEEKDAYS.find((day) => day.key === dayOfWeek);
  return match?.label ?? 'Jour inconnu';
};

export const ProfileTrainingScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const defaultTraining: TrainingProfile = {
    trainingDays: [],
    experienceLevel: 'beginner',
    preferredTimeSlots: ['evening'],
  };

  const currentTraining = user?.profile?.training ?? defaultTraining;
  const currentDays = currentTraining.trainingDays;
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>(currentDays);
  const [loading, setLoading] = useState(false);
  const [timePickerDay, setTimePickerDay] = useState<{ dayOfWeek: number; initial: string } | null>(null);

  useEffect(() => {
    setTrainingDays(currentDays);
  }, [currentDays]);

  const sortedTrainingDays = useMemo(
    () =>
      [...trainingDays].sort((a, b) => {
        const indexA = WEEKDAYS.findIndex((day) => day.key === a.dayOfWeek);
        const indexB = WEEKDAYS.findIndex((day) => day.key === b.dayOfWeek);
        return indexA - indexB;
      }),
    [trainingDays],
  );

  const toggleDay = (dayOfWeek: number) => {
    setTrainingDays((prev) => {
      const exists = prev.find((day) => day.dayOfWeek === dayOfWeek);
      if (exists) {
        return prev.filter((day) => day.dayOfWeek !== dayOfWeek);
      }
      return [
        ...prev,
        {
          dayOfWeek,
          type: 'strength',
          startTime: DEFAULT_START_TIME,
          duration: DEFAULT_DURATION,
          timeSlot: deriveTimeSlotFromStartTime(DEFAULT_START_TIME),
        },
      ];
    });
  };

  const updateDay = (dayOfWeek: number, updates: Partial<TrainingDay>) => {
    setTrainingDays((prev) =>
      prev.map((day) => (day.dayOfWeek === dayOfWeek ? { ...day, ...updates } : day)),
    );
  };

  const handleSelectType = (dayOfWeek: number, type: TrainingDay['type']) => {
    updateDay(dayOfWeek, { type });
  };

  const handleDurationChange = (dayOfWeek: number, value: string) => {
    const trimmed = value.replace(/[^0-9]/g, '');
    if (!trimmed) {
      updateDay(dayOfWeek, { duration: undefined });
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    updateDay(dayOfWeek, { duration: Number.isNaN(parsed) ? undefined : parsed });
  };

  const openTimePicker = (dayOfWeek: number) => {
    const match = trainingDays.find((day) => day.dayOfWeek === dayOfWeek);
    setTimePickerDay({ dayOfWeek, initial: match?.startTime ?? DEFAULT_START_TIME });
  };

  const handleTimeSave = (time: string) => {
    if (!timePickerDay) return;
    updateDay(timePickerDay.dayOfWeek, {
      startTime: time,
      timeSlot: deriveTimeSlotFromStartTime(time),
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        training: {
          ...currentTraining,
          trainingDays,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const isActive = (dayOfWeek: number) => trainingDays.some((day) => day.dayOfWeek === dayOfWeek);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Planning hebdomadaire</Text>
          <View style={styles.daysGrid}>
            {WEEKDAYS.map((day) => (
              <Button
                key={day.key}
                title={day.label}
                variant={isActive(day.key) ? 'primary' : 'outline'}
                onPress={() => toggleDay(day.key)}
              />
            ))}
          </View>

          {sortedTrainingDays.length === 0 ? (
            <Text style={styles.emptyState}>Sélectionne un jour pour planifier une séance.</Text>
          ) : (
            <View style={styles.dayDetailsList}>
              {sortedTrainingDays.map((day) => {
                const durationValue = day.duration ? day.duration.toString() : '';
                return (
                  <View key={day.dayOfWeek} style={styles.dayDetailsCard}>
                    <View style={styles.dayHeader}>
                      <View>
                        <Text style={styles.dayTitle}>{getWeekdayLabel(day.dayOfWeek)}</Text>
                        <Text style={styles.daySubtitle}>
                          {day.startTime ? `Début à ${day.startTime}` : 'Heure à planifier'}
                        </Text>
                      </View>
                      <IOSButton
                        label="Retirer"
                        variant="ghost"
                        onPress={() => toggleDay(day.dayOfWeek)}
                        accessibilityLabel={`Retirer ${getWeekdayLabel(day.dayOfWeek)} du planning`}
                      />
                    </View>

                    <View style={styles.fieldRow}>
                      <TouchableOpacity
                        style={styles.scheduleField}
                        onPress={() => openTimePicker(day.dayOfWeek)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.fieldLabel}>Heure de début</Text>
                        <Text style={styles.fieldValue}>{day.startTime ?? 'À planifier'}</Text>
                      </TouchableOpacity>

                      <View style={styles.durationField}>
                        <Text style={styles.fieldLabel}>Durée (min)</Text>
                        <Input
                          value={durationValue}
                          onChangeText={(text) => handleDurationChange(day.dayOfWeek, text)}
                          keyboardType="numeric"
                          placeholder="45"
                        />
                      </View>
                    </View>

                    <View style={styles.typeSelector}>
                      <Text style={styles.fieldLabel}>Type de séance</Text>
                      <View style={styles.typeChips}>
                        {TRAINING_TYPE_OPTIONS.map((option) => {
                          const active = day.type === option.value;
                          return (
                            <TouchableOpacity
                              key={option.value}
                              style={[styles.typeChip, active && styles.typeChipActive]}
                              onPress={() => handleSelectType(day.dayOfWeek, option.value)}
                              activeOpacity={0.9}
                            >
                              <Text
                                style={[styles.typeChipLabel, active && styles.typeChipLabelActive]}
                              >
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <Button title="Enregistrer" onPress={handleSave} loading={loading} />
        </Card>
      </ScrollView>
      <TimePickerModal
        visible={Boolean(timePickerDay)}
        initialTime={timePickerDay?.initial ?? DEFAULT_START_TIME}
        onClose={() => setTimePickerDay(null)}
        onSave={(time) => {
          handleTimeSave(time);
          setTimePickerDay(null);
        }}
        title="Sélectionne l'heure de début"
      />
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
    padding: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    gap: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  daysGrid: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  emptyState: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    textAlign: 'center',
  },
  dayDetailsList: {
    gap: Spacing.md,
  },
  dayDetailsCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  dayTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  daySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  scheduleField: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  fieldLabel: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  fieldValue: {
    ...Typography.body,
    color: Colors.text,
  },
  durationField: {
    flex: 1,
    gap: Spacing.xs,
  },
  typeSelector: {
    gap: Spacing.sm,
  },
  typeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  typeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}22`,
  },
  typeChipLabel: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  typeChipLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default ProfileTrainingScreen;
