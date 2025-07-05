/**
 * Écran de profil utilisateur
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              Alert.alert('Erreur', 'Erreur lors de la déconnexion');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Utilisateur non connecté</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Gérez vos informations personnelles</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Nom</Text>
          <Text style={styles.infoValue}>{user.profile.name}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Poids</Text>
          <Text style={styles.infoValue}>{user.profile.health.weight} kg</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Taille</Text>
          <Text style={styles.infoValue}>{user.profile.health.height} cm</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Âge</Text>
          <Text style={styles.infoValue}>{user.profile.health.age} ans</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Objectif</Text>
          <Text style={styles.infoValue}>
            {user.profile.objective === 'cutting' ? 'Sèche' : 
             user.profile.objective === 'recomposition' ? 'Recomposition' : 'Maintien'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Jours d'entraînement</Text>
        {user.profile.training.trainingDays.length > 0 ? (
          user.profile.training.trainingDays.map((day, index) => (
            <View key={index} style={styles.trainingDay}>
              <Text style={styles.trainingDayText}>
                {['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][day.dayOfWeek]}
              </Text>
              <Text style={styles.trainingDayDetails}>
                {day.type === 'strength' ? 'Musculation' : 'Cardio'} • {day.duration}min
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>Aucun jour d'entraînement configuré</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Suppléments disponibles</Text>
        {user.profile.supplements.available.length > 0 ? (
          user.profile.supplements.available.map((supplement, index) => (
            <View key={index} style={styles.supplementItem}>
              <Text style={styles.supplementName}>{supplement.name}</Text>
              <Text style={styles.supplementDosage}>{supplement.dosage}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>Aucun supplément configuré</Text>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={styles.logoutButtonText}>
            {loading ? 'Déconnexion...' : 'Se déconnecter'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  trainingDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  trainingDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  trainingDayDetails: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  supplementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  supplementName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  supplementDosage: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  noDataText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 50,
  },
});
