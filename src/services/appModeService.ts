/**
 * Gestion simple du mode application (démo / production).
 * Le choix de l'utilisateur n'est plus persisté automatiquement pour éviter les bascules forcées.
 */
import { AppConfig } from '../utils/config';

export type ModeChangeListener = (isDemoMode: boolean) => void;

let isDemoModeInternal = AppConfig.DEMO_MODE;
const listeners: ModeChangeListener[] = [];

export async function initializeAppMode(): Promise<boolean> {
  updateGlobalConfig(isDemoModeInternal);
  return isDemoModeInternal;
}

export function isDemoMode(): boolean {
  return isDemoModeInternal;
}

export async function setDemoMode(enabled: boolean): Promise<void> {
  if (isDemoModeInternal === enabled) return;

  isDemoModeInternal = enabled;
  updateGlobalConfig(enabled);

  if (!enabled) {
    try {
      const { DemoAuthService } = await import('./demoAuth');
      await DemoAuthService.logout();
    } catch (error) {
      console.warn('Impossible de réinitialiser la session démo:', error);
    }
  }

  notifyListeners(enabled);
}

export function addModeChangeListener(listener: ModeChangeListener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

function notifyListeners(isDemo: boolean) {
  listeners.forEach((listener) => {
    try {
      listener(isDemo);
    } catch (error) {
      console.error('Erreur listener mode application', error);
    }
  });
}

function updateGlobalConfig(isDemo: boolean) {
  (AppConfig as any).DEMO_MODE = isDemo;
  if ((global as any).USE_DEMO_MODE !== undefined) {
    (global as any).USE_DEMO_MODE = isDemo;
  }
}
