import React, { useCallback, useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Card, IOSButton } from '@/components';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useAgenda } from '@/hooks/useAgenda';
import { Spacing, ThemePalette, Typography } from '@/utils/theme';

const toLocaleDateTime = (value: string | Date) =>
  new Date(value).toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

const computeNextOccurrence = (hour: number, minute: number, dayOffset = 0) => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1 + dayOffset);
  } else if (dayOffset) {
    next.setDate(next.getDate() + dayOffset);
  }

  return next;
};

export const AgendaScreen: React.FC = () => {
  const { colors } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    events,
    loading,
    permissionStatus,
    scheduleEvent,
    refreshEvents,
    requestPermission,
  } = useAgenda();

  const ensurePermission = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        'Accès calendrier requis',
        "Active l'accès au calendrier iOS pour synchroniser tes séances BerserkerCut.",
      );
    }
    return granted;
  }, [requestPermission]);

  useFocusEffect(
    useCallback(() => {
      refreshEvents(14);
    }, [refreshEvents]),
  );

  const handleAddTraining = useCallback(async () => {
    try {
      const allowed = await ensurePermission();
      if (!allowed) {
        return;
      }
      const startDate = computeNextOccurrence(18, 0);
      const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);
      await scheduleEvent({
        title: 'Séance BerserkerCut',
        notes: 'Prépare ton entraînement et ton pré-workout.',
        startDate,
        endDate,
        type: 'training',
      });
      Alert.alert('Séance ajoutée', 'Ta prochaine séance est maintenant dans ton agenda.');
    } catch (error) {
      Alert.alert('Impossible d’ajouter', (error as Error).message);
    }
  }, [ensurePermission, scheduleEvent]);

  const handleAddNutrition = useCallback(async () => {
    try {
      const allowed = await ensurePermission();
      if (!allowed) {
        return;
      }
      const startDate = computeNextOccurrence(12, 30);
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
      await scheduleEvent({
        title: 'Meal prep BerserkerCut',
        notes: 'Prépare ton repas principal et valide tes macros.',
        startDate,
        endDate,
        type: 'nutrition',
      });
      Alert.alert('Rappel nutrition programmé', 'Ton créneau meal prep est planifié.');
    } catch (error) {
      Alert.alert('Impossible d’ajouter', (error as Error).message);
    }
  }, [ensurePermission, scheduleEvent]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshEvents(14);
    } catch (error) {
      Alert.alert('Erreur de synchronisation', (error as Error).message);
    }
  }, [refreshEvents]);

  const emptyState = events.length === 0;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Agenda natif</Text>
            <Text style={styles.subtitle}>
              Synchronise tes séances et blocs nutrition directement dans l’app Calendrier iOS.
            </Text>
          </View>
          <IOSButton
            label="Actualiser"
            variant="ghost"
            align="leading"
            onPress={handleRefresh}
            loading={loading}
          />
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Actions rapides</Text>
          <Text style={styles.cardDescription}>
            Les événements s’ajoutent dans un calendrier dédié "BerserkerCut Agenda".
          </Text>
          {permissionStatus !== 'granted' && (
            <IOSButton
              label="Autoriser l’accès au calendrier"
              variant="primary"
              align="leading"
              onPress={ensurePermission}
            />
          )}
          <View style={styles.quickActions}>
            <IOSButton
              label="Ajouter séance (18h)"
              align="leading"
              onPress={handleAddTraining}
              disabled={permissionStatus === 'denied'}
            />
            <IOSButton
              label="Bloc nutrition (12h30)"
              align="leading"
              variant="secondary"
              onPress={handleAddNutrition}
              disabled={permissionStatus === 'denied'}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Événements à venir</Text>
          {emptyState ? (
            <Text style={styles.emptyState}>
              Aucun événement planifié pour le moment. Ajoute tes rappels BerserkerCut et garde le
              cap.
            </Text>
          ) : (
            <View style={styles.eventsList}>
              {events.map((event) => (
                <View key={`${event.id}`} style={styles.eventRow}>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>{toLocaleDateTime(event.startDate)}</Text>
                    {event.notes ? (
                      <Text style={styles.eventNotes}>{event.notes}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: Spacing.lg,
      gap: Spacing.lg,
      paddingBottom: Spacing.xxl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.md,
    },
    title: {
      ...Typography.h1,
      color: colors.text,
    },
    subtitle: {
      ...Typography.body,
      color: colors.textLight,
    },
    card: {
      gap: Spacing.md,
      padding: Spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: 12,
    },
    cardLabel: {
      ...Typography.caption,
      color: colors.textLight,
      textTransform: 'uppercase',
    },
    cardDescription: {
      ...Typography.body,
      color: colors.textLight,
    },
    quickActions: {
      gap: Spacing.sm,
    },
    eventsList: {
      gap: Spacing.md,
    },
    eventRow: {
      padding: Spacing.md,
      backgroundColor: colors.secondaryBackground,
      borderRadius: 12,
      gap: Spacing.xs,
    },
    eventInfo: {
      gap: Spacing.xs,
    },
    eventTitle: {
      ...Typography.h3,
      color: colors.text,
      textTransform: 'capitalize',
    },
    eventTime: {
      ...Typography.body,
      color: colors.textLight,
    },
    eventNotes: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
    emptyState: {
      ...Typography.body,
      color: colors.textLight,
    },
  });

export default AgendaScreen;
