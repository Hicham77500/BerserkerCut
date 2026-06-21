import React, { useCallback, useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button, Card } from '@/components';
import { useThemeMode } from '@/hooks/useThemeMode';
import { useNotifications } from '@/hooks/useNotifications';
import { BorderRadius, Spacing, ThemePalette, Typography } from '@/utils/theme';

export const SystemSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { mode, setMode, colors } = useThemeMode();
  const {
    permissionStatus,
    requestPermission,
    scheduleNotification,
    scheduleDailyReminder,
    cancelAll,
  } = useNotifications();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const notificationsEnabled = permissionStatus === 'granted';

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        'Notifications désactivées',
        "Tu peux les activer depuis les réglages iOS pour recevoir les rappels BerserkerCut.",
      );
    }
  }, [requestPermission]);

  const handleScheduleMorningReminder = useCallback(async () => {
    try {
      const identifier = await scheduleDailyReminder({
        title: 'Briefing matinal',
        body: 'Consulte ton plan BerserkerCut et prépare ta journée.',
        hour: 7,
        minute: 30,
      });
      Alert.alert('Rappel du matin programmé', `Identifiant : ${identifier}`);
    } catch (error) {
      Alert.alert('Impossible de programmer le rappel', (error as Error).message);
    }
  }, [scheduleDailyReminder]);

  const handleScheduleEveningReminder = useCallback(async () => {
    try {
      const identifier = await scheduleDailyReminder({
        title: 'Checklist suppléments',
        body: 'Valide tes suppléments du soir pour clôturer la journée.',
        hour: 21,
        minute: 0,
      });
      Alert.alert('Rappel du soir programmé', `Identifiant : ${identifier}`);
    } catch (error) {
      Alert.alert('Impossible de programmer le rappel', (error as Error).message);
    }
  }, [scheduleDailyReminder]);

  const handleTestNotification = useCallback(async () => {
    try {
      await scheduleNotification({
        title: 'BerserkerCut',
        body: 'Notification test : ton rappel arrive dans 5 secondes.',
        date: new Date(Date.now() + 5_000),
      });
      Alert.alert('Notification test programmée', 'Elle apparaîtra dans quelques secondes.');
    } catch (error) {
      Alert.alert('Notification impossible', (error as Error).message);
    }
  }, [scheduleNotification]);

  const handleCancelReminders = useCallback(async () => {
    try {
      await cancelAll();
      Alert.alert('Rappels réinitialisés', 'Tous les rappels ont été supprimés.');
    } catch (error) {
      Alert.alert('Impossible de supprimer', (error as Error).message);
    }
  }, [cancelAll]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.title}>Parametres systeme</Text>
          <Text style={styles.subtitle}>
            Centralise les reglages de l'application, y compris le theme visuel.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theme de l'application</Text>
            <View style={styles.themeRow}>
              <TouchableOpacity
                style={[styles.themeChip, mode === 'dark' && styles.themeChipActive]}
                onPress={() => setMode('dark')}
                accessibilityRole="button"
                accessibilityLabel="Activer le thème sombre"
                accessibilityState={{ selected: mode === 'dark' }}
                hitSlop={8}
              >
                <Text style={[styles.themeChipText, mode === 'dark' && styles.themeChipTextActive]}>
                  Sombre
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.themeChip, mode === 'light' && styles.themeChipActive]}
                onPress={() => setMode('light')}
                accessibilityRole="button"
                accessibilityLabel="Activer le thème clair"
                accessibilityState={{ selected: mode === 'light' }}
                hitSlop={8}
              >
                <Text style={[styles.themeChipText, mode === 'light' && styles.themeChipTextActive]}>
                  Clair
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Confidentialite</Text>
          <Text style={styles.subtitle}>
            Gere ton consentement cloud et tes donnees sensibles depuis la section dediee.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('ProfileStack' as never, { screen: 'Confidentialité' } as never)}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir les réglages de confidentialité"
            hitSlop={8}
          >
            <Text style={styles.primaryButtonText}>Ouvrir Confidentialite</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Text style={styles.subtitle}>
            Gere les rappels quotidiens et les notifications test depuis cette section.
          </Text>
          {!notificationsEnabled ? (
            <Button
              title="Activer les notifications"
              variant="primary"
              onPress={handleRequestPermission}
              style={styles.button}
            />
          ) : (
            <View style={styles.buttonGroup}>
              <Button
                title="Rappel matin 7h30"
                variant="secondary"
                onPress={handleScheduleMorningReminder}
                style={styles.button}
              />
              <Button
                title="Rappel soir 21h"
                variant="secondary"
                onPress={handleScheduleEveningReminder}
                style={styles.button}
              />
            </View>
          )}

          <View style={styles.buttonGroup}>
            <Button
              title="Notification test (5s)"
              variant="ghost"
              onPress={handleTestNotification}
              disabled={!notificationsEnabled}
              style={styles.button}
            />
            <Button
              title="Réinitialiser les rappels"
              variant="outline"
              onPress={handleCancelReminders}
              disabled={!notificationsEnabled}
              style={styles.button}
            />
          </View>
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
    content: {
      padding: Spacing.lg,
      gap: Spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    title: {
      ...Typography.h2,
      color: colors.text,
    },
    subtitle: {
      ...Typography.bodySmall,
      color: colors.textLight,
    },
    section: {
      gap: Spacing.sm,
    },
    sectionTitle: {
      ...Typography.h3,
      color: colors.text,
    },
    themeRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    themeChip: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      minHeight: 44,
      borderRadius: BorderRadius.round,
      minWidth: 110,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    themeChipText: {
      ...Typography.bodySmall,
      color: colors.text,
      fontWeight: '600',
    },
    themeChipTextActive: {
      color: colors.textDark,
    },
    primaryButton: {
      marginTop: Spacing.xs,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.primary,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      alignItems: 'center',
    },
    primaryButtonText: {
      ...Typography.body,
      color: colors.textDark,
      fontWeight: '600',
    },
    buttonGroup: {
      gap: Spacing.sm,
    },
    button: {
      width: '100%',
    },
  });

export default SystemSettingsScreen;
