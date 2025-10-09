import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Button, Card, Input } from '@/components';
import { Typography, Spacing, BorderRadius, ThemePalette } from '@/utils/theme';
import { Supplement, SupplementFormType } from '@/types';

const SUPPLEMENT_FORM_OPTIONS: Array<{
  value: SupplementFormType;
  label: string;
  unitLabel: string;
}> = [
  { value: 'gram', label: 'Poudre', unitLabel: 'g' },
  { value: 'capsule', label: 'Gélule', unitLabel: 'capsules' },
  { value: 'milliliter', label: 'Liquide', unitLabel: 'ml' },
];

const getUnitLabel = (unit?: SupplementFormType): string => {
  if (!unit) return '';
  const match = SUPPLEMENT_FORM_OPTIONS.find((option) => option.value === unit);
  return match ? match.unitLabel : '';
};

const formatSupplementDosage = (supplement: Supplement): string => {
  if (supplement.quantity && supplement.unit) {
    const suffix = getUnitLabel(supplement.unit);
    return `${supplement.quantity} ${suffix}`.trim();
  }
  return supplement.dosage ?? '';
};

export const ProfileSupplementsScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { colors } = useThemeMode();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const supplements = user?.profile?.supplements?.available ?? [];
  const preferences = user?.profile?.supplements?.preferences ?? {
    preferNatural: false,
    budgetRange: 'medium' as 'low' | 'medium' | 'high',
    allergies: [] as string[],
  };

  const [items, setItems] = useState<Supplement[]>(supplements);
  const [newSupplement, setNewSupplement] = useState<{
    name: string;
    quantity: string;
    form: SupplementFormType;
  }>({
    name: '',
    quantity: '',
    form: 'gram',
  });
  const [loading, setLoading] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);

  const selectedFormOption = useMemo(
    () => SUPPLEMENT_FORM_OPTIONS.find((option) => option.value === newSupplement.form),
    [newSupplement.form],
  );

  const handleAdd = () => {
    if (!newSupplement.name.trim()) {
      Alert.alert('Nom requis', 'Merci de renseigner un nom');
      return;
    }

    const parsedQuantity = parseFloat(newSupplement.quantity);
    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Dosage requis', 'Veuillez indiquer un dosage numérique valide.');
      return;
    }

    const unitLabel = getUnitLabel(newSupplement.form);
    const dosageText = `${parsedQuantity} ${unitLabel}`.trim();

    setItems((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: newSupplement.name.trim(),
        dosage: dosageText,
        quantity: parsedQuantity,
        unit: newSupplement.form,
        available: true,
        timing: 'with_meals',
        type: 'other',
      },
    ]);
    setNewSupplement({ name: '', quantity: '', form: 'gram' });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        supplements: {
          available: items,
          preferences,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Suppléments disponibles</Text>

          <Input
            label="Nom"
            value={newSupplement.name}
            onChangeText={(name) => setNewSupplement((prev) => ({ ...prev, name }))}
          />

          <View style={styles.formSelector}>
            <Text style={styles.selectorLabel}>Type de supplément</Text>
            <TouchableOpacity
              style={styles.selectorField}
              onPress={() => setTypePickerVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.selectorValue}>
                {selectedFormOption?.label ?? 'Sélectionner'}
              </Text>
              <Text style={styles.selectorChevron}>⌄</Text>
            </TouchableOpacity>
          </View>

          <Input
            label={`Dosage (${getUnitLabel(newSupplement.form)})`}
            value={newSupplement.quantity}
            onChangeText={(quantity) => setNewSupplement((prev) => ({ ...prev, quantity }))}
            keyboardType="numeric"
          />

          <Button title="Ajouter" variant="secondary" onPress={handleAdd} />

          <View style={styles.list}>
            {items.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <View>
                  <Text style={styles.listItemName}>{item.name}</Text>
                  {formatSupplementDosage(item) ? (
                    <Text style={styles.listItemDosage}>{formatSupplementDosage(item)}</Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => removeItem(item.id)}>
                  <Text style={styles.removeLink}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            ))}
            {items.length === 0 && (
              <Text style={styles.emptyText}>Aucun supplément enregistré.</Text>
            )}
          </View>

          <Button title="Enregistrer" onPress={handleSave} loading={loading} />
        </Card>
      </ScrollView>

      <Modal
        visible={typePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTypePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setTypePickerVisible(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionne un type</Text>
            {SUPPLEMENT_FORM_OPTIONS.map((option) => {
              const isActive = option.value === newSupplement.form;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.modalOption, isActive && styles.modalOptionActive]}
                  onPress={() => {
                    setNewSupplement((prev) => ({ ...prev, form: option.value }));
                    setTypePickerVisible(false);
                  }}
                >
                  <View style={styles.modalOptionTextGroup}>
                    <Text
                      style={[styles.modalOptionLabel, isActive && styles.modalOptionLabelActive]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.modalOptionUnit}>{option.unitLabel}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
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
      backgroundColor: colors.background,
      gap: Spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    cardTitle: {
      ...Typography.h3,
      marginBottom: Spacing.md,
      color: colors.text,
    },
    list: {
      gap: Spacing.sm,
      marginVertical: Spacing.lg,
    },
    formSelector: {
      marginBottom: Spacing.md,
    },
    selectorLabel: {
      ...Typography.bodySmall,
      color: colors.textLight,
      marginBottom: Spacing.xs,
    },
    selectorField: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    selectorValue: {
      ...Typography.bodySmall,
      color: colors.text,
    },
    selectorChevron: {
      ...Typography.body,
      color: colors.textLight,
    },
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    listItemName: {
      ...Typography.body,
      color: colors.text,
    },
    listItemDosage: {
      ...Typography.caption,
      color: colors.textLight,
    },
    removeLink: {
      ...Typography.caption,
      color: colors.error,
    },
    emptyText: {
      ...Typography.bodySmall,
      color: colors.textLight,
      textAlign: 'center',
      marginTop: Spacing.md,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      padding: Spacing.lg,
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      gap: Spacing.xs,
    },
    modalTitle: {
      ...Typography.bodySmall,
      color: colors.textLight,
      marginBottom: Spacing.xs,
    },
    modalOption: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      borderRadius: BorderRadius.md,
    },
    modalOptionActive: {
      backgroundColor: colors.primary + '22',
    },
    modalOptionTextGroup: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalOptionLabel: {
      ...Typography.body,
      color: colors.text,
    },
    modalOptionLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    modalOptionUnit: {
      ...Typography.caption,
      color: colors.textLight,
    },
  });

export default ProfileSupplementsScreen;
