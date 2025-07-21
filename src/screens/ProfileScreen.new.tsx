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
  Platform
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
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            } finally {
              setLoading(false);
            }
          },
        },
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
        <Text style={styles.title}>Mon Profil</Text>
      </View>

      {/* Informations personnelles */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nom :</Text>
          <Text style={styles.infoValue}>{user.profile.name}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email :</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Âge :</Text>
          <Text style={styles.infoValue}>{user.profile.age} ans</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sexe :</Text>
          <Text style={styles.infoValue}>
            {user.profile.gender === 'male' ? 'Homme' : 'Femme'}
          </Text>
        </View>
      </View>

      {/* Mesures physiques */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mesures physiques</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Taille :</Text>
          <Text style={styles.infoValue}>{user.profile.height} cm</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Poids :</Text>
          <Text style={styles.infoValue}>{user.profile.weight} kg</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>IMC :</Text>
          <Text style={styles.infoValue}>
            {(user.profile.weight / Math.pow(user.profile.height / 100, 2)).toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Objectifs d'entraînement */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Objectifs d'entraînement</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Objectif principal :</Text>
          <Text style={styles.infoValue}>
            {user.profile.trainingProfile.primaryGoal === 'muscle_gain' ? '💪 Prise de masse' :
             user.profile.trainingProfile.primaryGoal === 'fat_loss' ? '🔥 Perte de graisse' :
             user.profile.trainingProfile.primaryGoal === 'strength' ? '💯 Force' :
             user.profile.trainingProfile.primaryGoal === 'endurance' ? '🏃‍♂️ Endurance' :
             user.profile.trainingProfile.primaryGoal === 'general_fitness' ? '🎯 Forme générale' : 
             'Autre'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Expérience :</Text>
          <Text style={styles.infoValue}>
            {user.profile.trainingProfile.experienceLevel === 'beginner' ? 'Débutant' :
             user.profile.trainingProfile.experienceLevel === 'intermediate' ? 'Intermédiaire' :
             'Avancé'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jours d'entraînement :</Text>
          <Text style={styles.infoValue}>
            {user.profile.trainingProfile.trainingDays.length} jours/semaine
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
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
    backgroundColor: '#2c3e50',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Suppression de l'effet carré blanc sur Android
    ...(Platform.OS === 'android' ? {
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    } : {
      elevation: 3,
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 50,
  },
});
