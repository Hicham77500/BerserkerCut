/**
 * Utilitaire de monitoring réseau.
 * Nous ne basculons plus automatiquement en mode démo : la décision appartient à l'utilisateur.
 */
import { AppConfig } from './config';

export function enableDemoModeAfterNetworkError(error: any): boolean {
  const isNetworkError =
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('Network error') ||
    error?.status === 0;

  if (__DEV__ && isNetworkError) {
    console.warn('⚠️ Erreur réseau détectée. Mode actuel :', AppConfig.DEMO_MODE ? 'DÉMO' : 'PRODUCTION');
  }

  return false;
}

export async function checkPreviousDemoModePreference(): Promise<boolean> {
  return false;
}

export function resetNetworkFallbackFlag(): void {
  // laissé pour compatibilité
}
