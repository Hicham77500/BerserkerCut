/**
 * Module: src/screens/profile/ProfileGoalsScreen.tsx
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { Button, Card } from '../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../utils/theme';

const OBJECTIVE_OPTIONS = [
  { key: 'cutting', label: 'Sèche' },
  { key: 'recomposition', label: 'Recomposition' },
  { key: 'maintenance', label: 'Maintien' },
] as const;

type ObjectiveKey = (typeof OBJECTIVE_OPTIONS)[number]['key'];

/**
 * Composant: ProfileGoalsScreen
 * Utilite: Gere le rendu UI et les interactions utilisateur de cet ecran/composant.
 */
export const ProfileGoalsScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();
/**
 * Fonction: currentObjective
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const currentObjective = (user?.profile?.objective ?? 'cutting') as ObjectiveKey;
  const [objective, setObjective] = useState<ObjectiveKey>(currentObjective);
  const [loading, setLoading] = useState(false);

/**
 * Fonction: handleSave
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ objective });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Objectif principal</Text>
          <View style={styles.options}>
            {OBJECTIVE_OPTIONS.map((option) => {
              const active = option.key === objective;
              return (
                <Button
                  key={option.key}
                  title={option.label}
                  variant={active ? 'primary' : 'outline'}
                  onPress={() => setObjective(option.key)}
                />
              );
            })}
          </View>
          <Button title="Enregistrer" onPress={handleSave} loading={loading} />
        </Card>
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
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
  },
  cardTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  options: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
});

export default ProfileGoalsScreen;
