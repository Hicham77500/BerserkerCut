/**
 * Utilitaires de debug pour BerserkerCut
 * Aide au diagnostic des problèmes de configuration
 */

import { getCurrentMode, checkFirebaseConnection, listLocalProfiles } from '../services/trainingService';
import { AppConfig, isFirebaseConfigured } from '../utils/config';

/**
 * Diagnostique complet de l'état de l'application
 */
export const diagnoseApp = async () => {
  console.log('\n🔍 === DIAGNOSTIC BERSERKERCUT ===');
  
  // Mode de fonctionnement
  const mode = getCurrentMode();
  console.log(`📱 Mode actuel: ${mode}`);
  
  // Configuration Firebase
  const firebaseConfigured = isFirebaseConfigured();
  console.log(`⚙️ Firebase configuré: ${firebaseConfigured ? '✅' : '❌'}`);
  
  // Test de connexion Firebase
  if (mode === 'firebase') {
    try {
      const connected = await checkFirebaseConnection();
      console.log(`🌐 Connexion Firebase: ${connected ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`🌐 Connexion Firebase: ❌ (${error})`);
    }
  }
  
  // Profils locaux
  try {
    const localProfiles = await listLocalProfiles();
    console.log(`💾 Profils locaux: ${localProfiles.length}`);
    if (localProfiles.length > 0) {
      console.log(`    → ${localProfiles.join(', ')}`);
    }
  } catch (error) {
    console.log(`💾 Profils locaux: ❌ (${error})`);
  }
  
  // Configuration app
  console.log(`🔧 Demo mode: ${AppConfig.DEMO_MODE ? '✅' : '❌'}`);
  console.log(`🔥 Firebase enabled: ${AppConfig.FIREBASE_ENABLED ? '✅' : '❌'}`);
  console.log(`🐛 Debug mode: ${AppConfig.DEBUG_MODE ? '✅' : '❌'}`);
  
  console.log('=== FIN DIAGNOSTIC ===\n');
};

/**
 * Affiche les informations de configuration Firebase
 */
export const showFirebaseConfig = () => {
  console.log('\n🔥 === CONFIGURATION FIREBASE ===');
  
  // Variables d'environnement (masquées pour sécurité)
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.substring(0, 20) + '...'
  };
  
  Object.entries(config).forEach(([key, value]) => {
    const status = value && !value.includes('undefined') && !value.includes('your-') ? '✅' : '❌';
    console.log(`${status} ${key}: ${value || 'NON DÉFINI'}`);
  });
  
  console.log('=== FIN CONFIG FIREBASE ===\n');
};

/**
 * Test complet de sauvegarde (mode debug)
 */
export const testSaveProfile = async (userId: string = 'test-user') => {
  console.log('\n🧪 === TEST SAUVEGARDE ===');
  
  try {
    const { saveTrainingProfileToFirestore } = await import('../services/trainingService');
    
    // Profil de test
    const testProfile = {
      objectives: { primary: 'cutting' as const },
      weeklySchedule: {
        monday: true, tuesday: false, wednesday: true, 
        thursday: false, friday: true, saturday: false, sunday: false
      },
      preferredTimes: { morning: true, afternoon: false, evening: false },
      activityTypes: {
        strength_training: true, cardio: true, yoga: false, 
        sports: false, other: false
      },
      neatLevel: { level: 'moderate' as const, description: 'Test' },
      healthLimitations: { hasLimitations: false },
      healthDeclaration: { declareGoodHealth: true, acknowledgeDisclaimer: true },
      completedAt: new Date(),
      isComplete: true
    };
    
    await saveTrainingProfileToFirestore(userId, testProfile);
    console.log('✅ Test de sauvegarde réussi');
    
  } catch (error) {
    console.log(`❌ Test de sauvegarde échoué: ${error}`);
  }
  
  console.log('=== FIN TEST ===\n');
};

/**
 * Affiche les recommandations selon la configuration
 */
export const showRecommendations = () => {
  console.log('\n💡 === RECOMMANDATIONS ===');
  
  const mode = getCurrentMode();
  const firebaseConfigured = isFirebaseConfigured();
  
  if (mode === 'demo') {
    console.log('🔧 Mode développement actif');
    console.log('   → Les données sont sauvegardées localement');
    console.log('   → Parfait pour le développement et les tests');
    
    if (!firebaseConfigured) {
      console.log('   → Pour la production, configurez Firebase dans app.json');
    }
  }
  
  if (mode === 'firebase' && firebaseConfigured) {
    console.log('☁️ Mode Firebase actif');
    console.log('   → Les données sont synchronisées dans le cloud');
    console.log('   → Assurez-vous que les règles Firestore sont configurées');
  }
  
  console.log('\n📚 Consultez FIREBASE_TROUBLESHOOTING.md pour plus d\'aide');
  console.log('=== FIN RECOMMANDATIONS ===\n');
};

/**
 * Diagnostic rapide avec toutes les informations
 */
export const quickDiagnose = async () => {
  await diagnoseApp();
  showFirebaseConfig();
  showRecommendations();
};

export default {
  diagnoseApp,
  showFirebaseConfig,
  testSaveProfile,
  showRecommendations,
  quickDiagnose
};
