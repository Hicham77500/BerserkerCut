import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isDemoMode } from '../services/appModeService';
import { Colors, Typography, Spacing } from '../utils/theme';

/**
 * Badge indiquant le mode actuel de l'application (démo ou production)
 */
export const ModeBadge: React.FC = () => {
  const demoMode = isDemoMode();
  
  if (!demoMode) return null; // Ne pas afficher le badge en mode production
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>MODE DÉMO</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: Colors.accentDark,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 999,
  },
  text: {
    ...Typography.caption,
    color: Colors.surface,
    fontWeight: '700',
    fontSize: 10,
  },
});

export default ModeBadge;