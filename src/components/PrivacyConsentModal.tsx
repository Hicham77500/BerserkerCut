import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { IOSButton } from './IOSButton';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Typography, Spacing, BorderRadius } from '@/utils/theme';

interface PrivacyConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onConsent: (cloudConsent: boolean) => void;
  initialCloudConsent?: boolean;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  visible,
  onClose,
  onConsent,
  initialCloudConsent = false,
}) => {
  const { colors } = useThemeMode();
  const [cloudConsent, setCloudConsent] = useState(initialCloudConsent);

  const handleSubmit = () => {
    onConsent(cloudConsent);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>Paramètres de confidentialité</Text>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.text }]}>Stockage de données</Text>
              <Text style={[styles.text, { color: colors.textLight }]}>
                BerserkerCut stocke vos données de santé et vos photos de repas sur votre appareil. 
                Vos informations sont chiffrées et ne sont jamais partagées sans votre consentement.
              </Text>
            </View>
            
            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.text }]}>Stockage cloud (optionnel)</Text>
              <Text style={[styles.text, { color: colors.textLight }]}>
                Vous pouvez choisir de synchroniser vos photos de repas avec votre compte iCloud 
                pour les sauvegarder et y accéder depuis tous vos appareils. Les photos sont stockées 
                dans un album "BerserkerCut" dans votre photothèque.
              </Text>
            </View>
            
            <View style={styles.switchRow}>
              <View style={styles.switchLabelGroup}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Activer la synchronisation iCloud</Text>
                <Text style={[styles.switchDescription, { color: colors.textLight }]}>
                  Vous pouvez modifier ce paramètre à tout moment dans les réglages de confidentialité
                </Text>
              </View>
              <Switch
                value={cloudConsent}
                onValueChange={setCloudConsent}
                thumbColor={cloudConsent ? colors.primary : colors.textMuted}
                trackColor={{ true: colors.primary + '55', false: colors.border }}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={[styles.heading, { color: colors.text }]}>Utilisation des données</Text>
              <Text style={[styles.text, { color: colors.textLight }]}>
                BerserkerCut utilise vos données de nutrition uniquement pour améliorer votre expérience personnelle. 
                Nous pouvons collecter des statistiques anonymisées pour améliorer nos algorithmes de recommandation.
              </Text>
            </View>
          </ScrollView>
          
          <View style={styles.buttonRow}>
            <IOSButton 
              label="Annuler" 
              variant="ghost" 
              onPress={onClose} 
              style={styles.button} 
            />
            <IOSButton 
              label="Confirmer" 
              onPress={handleSubmit} 
              style={styles.button} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: Spacing.lg,
  },
  container: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  content: {
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  heading: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  text: {
    ...Typography.body,
    marginBottom: Spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  switchLabelGroup: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchLabel: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  switchDescription: {
    ...Typography.caption,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: Spacing.md,
  },
  button: {
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
});