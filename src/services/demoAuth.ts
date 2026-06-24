/**
 * Module: src/services/demoAuth.ts
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import { User, UserProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_AUTH_ACCOUNTS_STORAGE_KEY = 'BERSERKERCUT_DEMO_AUTH_ACCOUNTS_V1';
const DEMO_AUTH_ACTIVE_EMAIL_STORAGE_KEY = 'BERSERKERCUT_DEMO_AUTH_ACTIVE_EMAIL_V1';

type PersistedUser = Omit<User, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  profile: Omit<UserProfile, 'health'> & {
    health: Omit<UserProfile['health'], 'lastUpdated' | 'dataSource'> & {
      lastUpdated: string;
      dataSource: Omit<UserProfile['health']['dataSource'], 'lastSyncDate'> & {
        lastSyncDate?: string;
      };
    };
  };
};

type PersistedAccount = {
  password: string;
  user: PersistedUser;
};

type PersistedAccountsStore = Record<string, PersistedAccount>;

const BASE_PROFILE: UserProfile = {
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
    lastUpdated: new Date(),
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

const DEMO_USER: User = {
  id: 'demo-user-123',
  email: 'demo@berserkercut.com',
  profile: {
    ...BASE_PROFILE,
    name: 'Utilisateur Démo',
    health: {
      ...BASE_PROFILE.health,
      weight: 80,
      height: 180,
      age: 25,
      averageDailySteps: 8000,
      restingHeartRate: 65,
    },
    training: {
      trainingDays: [
        {
          dayOfWeek: 1,
          type: 'strength',
          startTime: '06:30',
          duration: 60,
          timeSlot: 'morning',
        },
        {
          dayOfWeek: 3,
          type: 'strength',
          startTime: '06:30',
          duration: 60,
          timeSlot: 'morning',
        },
        {
          dayOfWeek: 5,
          type: 'strength',
          startTime: '06:30',
          duration: 60,
          timeSlot: 'morning',
        },
      ],
      experienceLevel: 'intermediate',
      preferredTimeSlots: ['morning'],
    },
    supplements: {
      available: [
        {
          id: 'whey-protein',
          name: 'Whey Protein',
          type: 'protein',
          dosage: '30g',
          timing: 'post_workout',
          available: true,
          quantity: 30,
          unit: 'gram',
        },
        {
          id: 'creatine',
          name: 'Créatine Monohydrate',
          type: 'creatine',
          dosage: '5g',
          timing: 'post_workout',
          available: true,
          quantity: 5,
          unit: 'gram',
        },
      ],
      preferences: BASE_PROFILE.supplements.preferences,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Classe: DemoAuthService
 * Utilite: Regroupe des comportements et etats lies a un domaine precis.
 */
export class DemoAuthService {
  private static currentUser: User | null = null;
  private static listeners: Array<(user: User | null) => void> = [];
  private static accounts: PersistedAccountsStore = {};

  private static serializeUser(user: User): PersistedUser {
    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      profile: {
        ...user.profile,
        health: {
          ...user.profile.health,
          lastUpdated: user.profile.health.lastUpdated.toISOString(),
          dataSource: {
            ...user.profile.health.dataSource,
            lastSyncDate: user.profile.health.dataSource.lastSyncDate
              ? user.profile.health.dataSource.lastSyncDate.toISOString()
              : undefined,
          },
        },
      },
    };
  }

  private static deserializeUser(user: PersistedUser): User {
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      profile: {
        ...user.profile,
        health: {
          ...user.profile.health,
          lastUpdated: new Date(user.profile.health.lastUpdated),
          dataSource: {
            ...user.profile.health.dataSource,
            lastSyncDate: user.profile.health.dataSource.lastSyncDate
              ? new Date(user.profile.health.dataSource.lastSyncDate)
              : undefined,
          },
        },
      },
    } as User;
  }

  private static async loadAccounts(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(DEMO_AUTH_ACCOUNTS_STORAGE_KEY);
      if (!raw) {
        this.accounts = {};
        return;
      }
      const parsed = JSON.parse(raw) as PersistedAccountsStore;
      this.accounts = parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      console.warn('[DemoAuthService] loadAccounts error', error);
      this.accounts = {};
    }
  }

  private static async persistAccounts(): Promise<void> {
    await AsyncStorage.setItem(
      DEMO_AUTH_ACCOUNTS_STORAGE_KEY,
      JSON.stringify(this.accounts)
    );
  }

  private static async persistCurrentSession(email: string | null): Promise<void> {
    if (email) {
      await AsyncStorage.setItem(DEMO_AUTH_ACTIVE_EMAIL_STORAGE_KEY, email);
      return;
    }
    await AsyncStorage.removeItem(DEMO_AUTH_ACTIVE_EMAIL_STORAGE_KEY);
  }

  static async initialize(): Promise<void> {
    await this.loadAccounts();
    const activeEmail = await AsyncStorage.getItem(DEMO_AUTH_ACTIVE_EMAIL_STORAGE_KEY);
    if (activeEmail && this.accounts[activeEmail]?.user) {
      this.currentUser = this.deserializeUser(this.accounts[activeEmail].user);
      this.notify();
      return;
    }
    this.currentUser = null;
  }

  static async login(email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const account = this.accounts[email];
    if (account && account.password === password) {
      this.currentUser = this.deserializeUser(account.user);
      await this.persistCurrentSession(email);
      this.notify();
      return this.currentUser;
    }

    if (email === DEMO_USER.email && password === 'demo123') {
      this.currentUser = { ...DEMO_USER };
      await this.persistCurrentSession(null);
      this.notify();
      return this.currentUser;
    }

    throw new Error('Identifiants invalides');
  }

  static async register(email: string, _password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (this.accounts[email]) {
      throw new Error('Cette adresse email est déjà utilisée en mode local.');
    }

    const demoProfile: UserProfile = {
      ...BASE_PROFILE,
      name: email.split('@')[0] ?? '',
    };

    this.currentUser = {
      id: `demo-user-${Date.now()}`,
      email,
      profile: demoProfile,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.accounts[email] = {
      password: _password,
      user: this.serializeUser(this.currentUser),
    };
    await this.persistAccounts();
    await this.persistCurrentSession(email);

    this.notify();
    return this.currentUser;
  }

  static async logout(): Promise<void> {
    this.currentUser = null;
    await this.persistCurrentSession(null);
    this.notify();
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<User> {
    if (!this.currentUser) {
      throw new Error('Utilisateur non connecté');
    }

    this.currentUser = {
      ...this.currentUser,
      profile: {
        ...this.currentUser.profile,
        ...updates,
      },
      updatedAt: new Date(),
    };

    const account = this.accounts[this.currentUser.email];
    if (account) {
      this.accounts[this.currentUser.email] = {
        ...account,
        user: this.serializeUser(this.currentUser),
      };
      await this.persistAccounts();
    }

    this.notify();
    return this.currentUser;
  }

  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  static getUserById(userId: string): Promise<User> {
    if (this.currentUser && this.currentUser.id === userId) {
      return Promise.resolve(this.currentUser);
    }

    const fromAccounts = Object.values(this.accounts)
      .map((account) => this.deserializeUser(account.user))
      .find((accountUser) => accountUser.id === userId);
    if (fromAccounts) {
      return Promise.resolve(fromAccounts);
    }

    if (DEMO_USER.id === userId) {
      return Promise.resolve({ ...DEMO_USER });
    }

    return Promise.reject(new Error('Utilisateur non trouvé'));
  }

  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);

    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  private static notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('Erreur listener demo auth', error);
      }
    });
  }
}

export default DemoAuthService;
