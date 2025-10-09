import React, { useState, useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Input, Button, Card, IOSButton } from '@/components';
import { Typography, Spacing, BorderRadius, ThemePalette } from '@/utils/theme';
import { useThemeMode } from '@/hooks/useThemeMode';
import { HealthProfile } from '@/types';

export const ProfileHealthScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { colors } = useThemeMode();
  const defaultHealth: HealthProfile = {
    weight: 0,
    height: 0,
    age: 0,
    gender: 'male',
    activityLevel: 'moderate',
    averageSleepHours: 8,
    dataSource: {
      type: 'manual',
      isConnected: false,
      permissions: [],
    },
    lastUpdated: new Date(),
    isManualEntry: true,
  };

  const health = user?.profile?.health ?? defaultHealth;

  const [form, setForm] = useState({
    weight: String(health.weight || ''),
    height: String(health.height || ''),
    age: String(health.age || ''),
    averageSleepHours: String(health.averageSleepHours || ''),
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        health: {
          ...health,
          weight: Number(form.weight) || 0,
          height: Number(form.height) || 0,
          age: Number(form.age) || 0,
          averageSleepHours: Number(form.averageSleepHours) || 0,
          lastUpdated: new Date(),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSaveSuccess = () => {
    Alert.alert('Profil mis à jour', 'Vos données biométriques ont été enregistrées avec succès.');
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Mesures biométriques</Text>
          
          <Input
            label="Poids (kg)"
            value={form.weight}
            keyboardType="decimal-pad"
            testID="profile-health-weight"
            onChangeText={(weight) => setForm((prev) => ({ ...prev, weight }))}
          />
          <Text style={styles.helpText}>Votre poids actuel en kilogrammes</Text>
          
          <Input
            label="Taille (cm)"
            value={form.height}
            keyboardType="decimal-pad"
            testID="profile-health-height"
            onChangeText={(height) => setForm((prev) => ({ ...prev, height }))}
          />
          <Text style={styles.helpText}>Votre taille en centimètres</Text>
          
          <Input
            label="Âge"
            value={form.age}
            keyboardType="number-pad"
            testID="profile-health-age"
            onChangeText={(age) => setForm((prev) => ({ ...prev, age }))}
          />
          
          <Input
            label="Sommeil moyen (h)"
            value={form.averageSleepHours}
            keyboardType="decimal-pad"
            testID="profile-health-sleep"
            onChangeText={(value) => setForm((prev) => ({ ...prev, averageSleepHours: value }))}
          />
          <Text style={styles.helpText}>Nombre d'heures de sommeil par nuit en moyenne</Text>
          
          <View style={styles.activityContainer}>
            <Text style={styles.activityTitle}>Niveau d'activité</Text>
            <Text style={styles.helpText}>Sélectionnez le niveau qui correspond le mieux à votre mode de vie actuel</Text>
            {/* TODO: Implement activity level selection */}
          </View>

          <IOSButton label="Enregistrer" onPress={() => {
            handleSave().then(handleSaveSuccess).catch(error => {
              Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
            });
          }} />
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
      flexGrow: 1,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    card: {
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      backgroundColor: colors.surface,
      gap: Spacing.md,
    },
    cardTitle: {
      ...Typography.h3,
      marginBottom: Spacing.md,
      color: colors.text,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    radioContainer: {
      flexDirection: 'row',
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    activityContainer: {
      marginBottom: Spacing.md,
    },
    activityTitle: {
      ...Typography.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    helpText: {
      ...Typography.caption,
      color: colors.textLight,
      marginTop: -Spacing.xs,
      marginBottom: Spacing.sm,
    },
  });

export default ProfileHealthScreen;
