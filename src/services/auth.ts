/**
 * Service d'authentification unifiant backend MongoDB (via API) et mode démo local.
 */

import { User, UserProfile } from '../types';
import { DemoAuthService } from './demoAuth';
import { apiClient } from './apiClient';
import {
  saveSession,
  clearSession,
  getStoredUser,
  updateStoredUser,
} from './sessionStorage';
import { AppConfig } from '../utils/config';

/**
 * Active le mode démo lorsque l'API n'est pas configurée.
 */
export const USE_DEMO_MODE = AppConfig.DEMO_MODE;

type AuthResponse = {
  user: User;
  token: string;
};

type AuthListener = (user: User | null) => void;

const listeners = new Set<AuthListener>();
let initialised = false;

function notifyAuthListeners(user: User | null) {
  listeners.forEach((listener) => {
    try {
      listener(user);
    } catch (error) {
      console.error('Auth listener error', error);
    }
  });
}

async function ensureInitialisation() {
  if (initialised) return;
  initialised = true;
  const storedUser = await getStoredUser();
  notifyAuthListeners(storedUser);
}

function createDefaultProfile(): UserProfile {
  const now = new Date();
  return {
    name: '',
    objective: 'cutting',
    allergies: [],
    foodPreferences: [],
    health: {
      weight: 0,
      height: 0,
      age: 0,
      gender: 'male',
      activityLevel: 'moderate',
      averageSleepHours: 8,
      dataSource: {
        type: 'manual',
        isConnected: false,
        permissions: [],
      },
      lastUpdated: now,
      isManualEntry: true,
    },
    training: {
      trainingDays: [],
      experienceLevel: 'beginner',
      preferredTimeSlots: ['evening'],
    },
    supplements: {
      available: [],
      preferences: {
        preferNatural: false,
        budgetRange: 'medium',
        allergies: [],
      },
    },
  };
}

function normalizeUser(raw: any): User {
  return {
    ...raw,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  } as User;
}

/**
 * Service centralisé pour l'authentification.
 */
export class AuthService {
  static async register(email: string, password: string): Promise<User> {
    if (USE_DEMO_MODE) {
      const user = await DemoAuthService.register(email, password);
      notifyAuthListeners(user);
      return user;
    }

    try {
      const defaultProfile = createDefaultProfile();
      const { user: rawUser, token } = await apiClient.post<AuthResponse>('/auth/register', {
        email,
        password,
        profile: defaultProfile,
      });

      const user = normalizeUser(rawUser);
      await saveSession(token, user);
      notifyAuthListeners(user);
      return user;
    } catch (error: any) {
      throw new Error(formatAuthError(error));
    }
  }

  static async login(email: string, password: string): Promise<User> {
    if (USE_DEMO_MODE) {
      const user = await DemoAuthService.login(email, password);
      notifyAuthListeners(user);
      return user;
    }

    try {
      const { user: rawUser, token } = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      const user = normalizeUser(rawUser);
      await saveSession(token, user);
      notifyAuthListeners(user);
      return user;
    } catch (error: any) {
      throw new Error(formatAuthError(error));
    }
  }

  static async logout(): Promise<void> {
    if (USE_DEMO_MODE) {
      await DemoAuthService.logout();
      notifyAuthListeners(null);
      return;
    }

    try {
      await apiClient.post('/auth/logout', undefined).catch(() => undefined);
    } finally {
      await clearSession();
      notifyAuthListeners(null);
    }
  }

  static async updateProfile(userId: string, profileUpdates: Partial<UserProfile>): Promise<void> {
    if (USE_DEMO_MODE) {
      await DemoAuthService.updateProfile(profileUpdates);
      const user = await DemoAuthService.getCurrentUser();
      notifyAuthListeners(user);
      return;
    }

    try {
      await apiClient.patch(`/users/${userId}/profile`, profileUpdates);
      const updatedUser = await this.getUserProfile(userId);
      await updateStoredUser(updatedUser);
      notifyAuthListeners(updatedUser);
    } catch (error: any) {
      throw new Error(formatAuthError(error));
    }
  }

  static async getUserProfile(userId: string): Promise<User> {
    if (USE_DEMO_MODE) {
      const user = await DemoAuthService.getUserById(userId);
      notifyAuthListeners(user);
      return user;
    }

    try {
      const rawUser = await apiClient.get<User>(`/users/${userId}`);
      return normalizeUser(rawUser);
    } catch (error: any) {
      throw new Error(formatAuthError(error));
    }
  }

  static onAuthStateChanged(callback: AuthListener): () => void {
    if (USE_DEMO_MODE) {
      const unsubscribeDemo = DemoAuthService.onAuthStateChanged((demoUser) => {
        notifyAuthListeners(demoUser);
      });
      listeners.add(callback);
      ensureInitialisation();
      return () => {
        listeners.delete(callback);
        unsubscribeDemo();
      };
    }

    listeners.add(callback);
    ensureInitialisation();
    return () => {
      listeners.delete(callback);
    };
  }
}

function formatAuthError(error: any): string {
  const status = error?.status;
  const message = error?.details?.message || error?.message || 'Erreur inconnue';

  if (status === 401 || status === 403) {
    return 'Identifiants invalides ou session expirée.';
  }

  if (status === 409) {
    return 'Cette adresse email est déjà utilisée.';
  }

  if (status === 400) {
    return message;
  }

  return message || 'Erreur d\'authentification.';
}

export default AuthService;
