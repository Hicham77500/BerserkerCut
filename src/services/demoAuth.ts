import { User, UserProfile } from '../types';

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
        { dayOfWeek: 1, type: 'strength', timeSlot: 'morning', duration: 60 },
        { dayOfWeek: 3, type: 'strength', timeSlot: 'morning', duration: 60 },
        { dayOfWeek: 5, type: 'strength', timeSlot: 'morning', duration: 60 },
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

export class DemoAuthService {
  private static currentUser: User | null = null;
  private static listeners: Array<(user: User | null) => void> = [];

  static async initialize(): Promise<void> {
    this.currentUser = null;
  }

  static async login(email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (email === DEMO_USER.email && password === 'demo123') {
      this.currentUser = { ...DEMO_USER };
      this.notify();
      return this.currentUser;
    }

    throw new Error('Identifiants invalides');
  }

  static async register(email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));

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

    this.notify();
    return this.currentUser;
  }

  static async logout(): Promise<void> {
    this.currentUser = null;
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
