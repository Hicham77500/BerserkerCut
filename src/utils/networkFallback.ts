/**
 * Utilitaire de monitoring réseau.
 * Nous ne basculons plus automatiquement en mode démo : la décision appartient à l'utilisateur.
 */
import { AppConfig } from './config';

/**
 * Fonction: enableDemoModeAfterNetworkError
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
export function enableDemoModeAfterNetworkError(error: any): boolean {
  const isNetworkError =
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('Network error') ||
    error?.status === 0;

  if (!isNetworkError) {
    return false;
  }

  if (__DEV__) {
    console.warn('⚠️ Erreur réseau détectée. Mode actuel :', AppConfig.DEMO_MODE ? 'DÉMO' : 'PRODUCTION');
  }

  // Signale au service appelant qu'il peut activer le mode démo automatiquement
  return !AppConfig.DEMO_MODE;
}

/**
 * Fonction: checkPreviousDemoModePreference
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
export async function checkPreviousDemoModePreference(): Promise<boolean> {
  return false;
}

/**
 * Fonction: resetNetworkFallbackFlag
 * Utilite: Execute la logique metier associee a cette fonctionnalite.
 */
export function resetNetworkFallbackFlag(): void {
  // laissé pour compatibilité
}
