/**
 * Version simplifiée du DashboardScreen pour test
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const DashboardScreenTest: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard Test</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 20,
    color: '#333',
  },
});

export default DashboardScreenTest;
