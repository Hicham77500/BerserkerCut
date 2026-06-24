import AsyncStorage from '@react-native-async-storage/async-storage';
import { PROFILE_HISTORY_STORAGE_KEY } from '@/constants/storageKeys';
import { User, UserProfile } from '@/types';

export type ProfileHistoryReason =
  | 'account_created'
  | 'profile_updated'
  | 'onboarding_completed'
  | 'goal_updated';

export type ProfileHistoryEntry = {
  id: string;
  userId: string;
  at: string;
  reason: ProfileHistoryReason;
  objective: UserProfile['objective'];
  snapshot: {
    name: string;
    weight: number;
    height: number;
    age: number;
    activityLevel: UserProfile['health']['activityLevel'];
    averageSleepHours: number;
    trainingDaysPerWeek: number;
    supplementsCount: number;
    allergies: string[];
    foodPreferences: string[];
  };
};

type ProfileHistoryStore = Record<string, ProfileHistoryEntry[]>;

const MAX_HISTORY_PER_USER = 120;

async function readStore(): Promise<ProfileHistoryStore> {
  const raw = await AsyncStorage.getItem(PROFILE_HISTORY_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as ProfileHistoryStore;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.warn('[ProfileHistoryService] read parse error', error);
    return {};
  }
}

async function writeStore(store: ProfileHistoryStore): Promise<void> {
  await AsyncStorage.setItem(PROFILE_HISTORY_STORAGE_KEY, JSON.stringify(store));
}

function buildEntry(user: User, reason: ProfileHistoryReason): ProfileHistoryEntry {
  return {
    id: `${user.id}-${Date.now()}`,
    userId: user.id,
    at: new Date().toISOString(),
    reason,
    objective: user.profile.objective,
    snapshot: {
      name: user.profile.name,
      weight: user.profile.health.weight,
      height: user.profile.health.height,
      age: user.profile.health.age,
      activityLevel: user.profile.health.activityLevel,
      averageSleepHours: user.profile.health.averageSleepHours,
      trainingDaysPerWeek: user.profile.training.trainingDays.length,
      supplementsCount: user.profile.supplements.available.length,
      allergies: user.profile.allergies,
      foodPreferences: user.profile.foodPreferences,
    },
  };
}

export class ProfileHistoryService {
  static async append(user: User, reason: ProfileHistoryReason): Promise<void> {
    const store = await readStore();
    const existing = store[user.id] ?? [];
    const next = [buildEntry(user, reason), ...existing].slice(0, MAX_HISTORY_PER_USER);
    store[user.id] = next;
    await writeStore(store);
  }

  static async getForUser(userId: string): Promise<ProfileHistoryEntry[]> {
    const store = await readStore();
    return store[userId] ?? [];
  }

  static async clearForUser(userId: string): Promise<void> {
    const store = await readStore();
    delete store[userId];
    await writeStore(store);
  }
}

export default ProfileHistoryService;
