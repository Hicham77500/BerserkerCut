import * as SecureStore from 'expo-secure-store';

const isAvailable = async (): Promise<boolean> => {
  try {
    return await SecureStore.isAvailableAsync();
  } catch (error) {
    console.warn('SecureStore indisponible', error);
    return false;
  }
};

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (!(await isAvailable())) return;
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getSecureItem(key: string): Promise<string | null> {
  if (!(await isAvailable())) return null;
  return SecureStore.getItemAsync(key);
}

export async function removeSecureItem(key: string): Promise<void> {
  if (!(await isAvailable())) return;
  await SecureStore.deleteItemAsync(key);
}

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

export async function setSecureJSON<T>(key: string, value: T): Promise<void> {
  await setSecureItem(key, JSON.stringify(value));
}

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
