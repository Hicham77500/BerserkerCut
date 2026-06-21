/**
 * Module: src/utils/storage/secureStorage.ts
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import * as SecureStore from 'expo-secure-store';

/**
 * Fonction: isAvailable
 * Utilite: Encapsule une logique reutilisable locale ou exportee.
 */
const isAvailable = async (): Promise<boolean> => {
  try {
    if (typeof SecureStore.isAvailableAsync !== 'function') {
      return false;
    }
    return await SecureStore.isAvailableAsync();
  } catch (error) {
    console.warn('SecureStore indisponible', error);
    return false;
  }
};

/**
 * Fonction: setSecureItem
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  if (!(await isAvailable())) return;
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

/**
 * Fonction: getSecureItem
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
export async function getSecureItem(key: string): Promise<string | null> {
  if (!(await isAvailable())) return null;
  return SecureStore.getItemAsync(key);
}

/**
 * Fonction: removeSecureItem
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
export async function removeSecureItem(key: string): Promise<void> {
  if (!(await isAvailable())) return;
  await SecureStore.deleteItemAsync(key);
}

/**
 * Fonction: clearAllSensitiveData
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
export async function clearAllSensitiveData(exceptKeys: string[] = []): Promise<void> {
  if (!(await isAvailable())) return;
  
  // Liste des clés à vérifier (clés connues utilisées dans l'application)
  const knownKeys = [
    'BERSERKERCUT_CLOUD_CONSENT_V1',
    'BERSERKERCUT_PHOTOS_V1',
    'BERSERKERCUT_USER_PREFERENCES',
    'BERSERKERCUT_THEME_PREFERENCE',
    // Ajouter ici d'autres clés sensibles connues
  ];
  
  // Filtrer les clés à conserver
  const keysToRemove = knownKeys.filter(key => !exceptKeys.includes(key));
  
  // Supprimer chaque clé
  await Promise.all(keysToRemove.map((key) => SecureStore.deleteItemAsync(key)));
}

/**
 * Fonction: setSecureJSON
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
export async function setSecureJSON<T>(key: string, value: T): Promise<void> {
  await setSecureItem(key, JSON.stringify(value));
}

/**
 * Fonction: getSecureJSON
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
export async function getSecureJSON<T>(key: string, fallback: T): Promise<T> {
  const data = await getSecureItem(key);
  if (!data) return fallback;
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.warn('Impossible de parser les données chiffrées', error);
    return fallback;
  }
}
