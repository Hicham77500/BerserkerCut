/**
 * Utilitaires de debug pour BerserkerCut (backend MongoDB + mode démo).
 */

import { getCurrentMode, checkBackendConnection, listLocalProfiles } from '@/services/trainingService';
import { AppConfig, isBackendConfigured } from '@/utils/config';
import { apiClient } from '@/services/apiClient';

/**
 * Diagnostique complet de l'état de l'application.
 */
export const diagnoseApp = async () => {
  console.log('\n🔍 === DIAGNOSTIC BERSERKERCUT ===');

  const mode = getCurrentMode();
  console.log(`📱 Mode actuel: ${mode}`);

  const backendConfigured = isBackendConfigured();
  console.log(`⚙️ Backend configuré: ${backendConfigured ? '✅' : '❌'}`);
  console.log(`🌐 API Base URL: ${apiClient.baseUrl}`);

  if (mode === 'cloud') {
    try {
      const connected = await checkBackendConnection();
      console.log(`🌐 Connexion backend: ${connected ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`🌐 Connexion backend: ❌ (${error})`);
    }
  }

  try {
    const localProfiles = await listLocalProfiles();
    console.log(`💾 Profils locaux: ${localProfiles.length}`);
    if (localProfiles.length > 0) {
      console.log(`    → ${localProfiles.join(', ')}`);
    }
  } catch (error) {
    console.log(`💾 Profils locaux: ❌ (${error})`);
  }

  console.log(`🔧 Demo mode: ${AppConfig.DEMO_MODE ? '✅' : '❌'}`);
  console.log(`🐛 Debug mode: ${AppConfig.DEBUG_MODE ? '✅' : '❌'}`);

  console.log('=== FIN DIAGNOSTIC ===\n');
};

/** Affiche les informations de configuration backend. */
export const showBackendConfig = () => {
  console.log('\n☁️ === CONFIGURATION BACKEND ===');

  const config = {
    apiBaseUrl: apiClient.baseUrl,
    forceDemoMode: process.env.EXPO_PUBLIC_FORCE_DEMO_MODE,
  };

  Object.entries(config).forEach(([key, value]) => {
    console.log(`${value ? '✅' : '❌'} ${key}: ${value || 'NON DÉFINI'}`);
  });

  console.log('=== FIN CONFIG BACKEND ===\n');
};

/** Test complet de sauvegarde (mode debug). */
export const testSaveProfile = async (userId: string = 'test-user') => {
  console.log('\n🧪 === TEST SAUVEGARDE ===');

  try {
    const { saveTrainingProfile } = await import('../services/trainingService');

    const testProfile = {
      objectives: { primary: 'cutting' as const },
      weeklySchedule: {
        monday: true,
        tuesday: false,
        wednesday: true,
        thursday: false,
        friday: true,
        saturday: false,
        sunday: false,
      },
      preferredTimes: { morning: true, afternoon: false, evening: false },
      activityTypes: {
        strength_training: true,
        cardio: true,
        yoga: false,
        sports: false,
        other: false,
      },
      neatLevel: { level: 'moderate' as const, description: 'Test' },
      healthLimitations: { hasLimitations: false },
      healthDeclaration: { declareGoodHealth: true, acknowledgeDisclaimer: true },
      completedAt: new Date(),
      isComplete: true,
    };

    await saveTrainingProfile(userId, testProfile);
    console.log('✅ Test de sauvegarde réussi');
  } catch (error) {
    console.log(`❌ Test de sauvegarde échoué: ${error}`);
  }

  console.log('=== FIN TEST ===\n');
};

/** Affiche les recommandations selon la configuration. */
export const showRecommendations = () => {
  console.log('\n💡 === RECOMMANDATIONS ===');

  const mode = getCurrentMode();
  const backendConfigured = isBackendConfigured();

  if (mode === 'demo') {
    console.log('🔧 Mode développement actif');
    console.log('   → Les données sont sauvegardées localement');
    if (!backendConfigured) {
      console.log('   → Configurez EXPO_PUBLIC_API_BASE_URL pour activer la synchronisation cloud');
    }
  }

  if (mode === 'cloud' && backendConfigured) {
    console.log('☁️ Mode cloud actif');
    console.log('   → Les données sont synchronisées via l\'API backend');
    console.log('   → Assurez-vous que les endpoints sécurisés sont opérationnels');
  }

  console.log('=== FIN RECOMMANDATIONS ===\n');
};

/** Diagnostic rapide avec toutes les informations. */
export const quickDiagnose = async () => {
  await diagnoseApp();
  showBackendConfig();
  showRecommendations();
};

export default {
  diagnoseApp,
  showBackendConfig,
  testSaveProfile,
  showRecommendations,
  quickDiagnose,
};
