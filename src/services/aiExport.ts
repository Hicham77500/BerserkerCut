import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import {
  AI_EXPORT_LAST_SNAPSHOT_STORAGE_KEY,
  CLOUD_CONSENT_AUDIT_STORAGE_KEY,
  CLOUD_CONSENT_STORAGE_KEY,
} from '@/constants/storageKeys';
import { ProfileHistoryService } from '@/services/profileHistory';
import { PLAN_RANGE_CACHE_KEY } from '@/services/plan';
import { User } from '@/types';
import { getSecureItem, getSecureJSON } from '@/utils/storage/secureStorage';

type ConsentAuditEntry = {
  at: number;
  action: 'enabled' | 'disabled';
  removeCloudAlbum: boolean;
};

type PlanRangeCachePayload = {
  userId: string;
  from: string;
  to: string;
  updatedAt: string;
  plans: Array<{
    id: string;
    date: string;
    dayType: 'training' | 'rest' | 'cheat';
    completed: boolean;
    nutritionPlan: {
      totalCalories: number;
      macros: {
        protein: number;
        carbs: number;
        fat: number;
      };
    };
    dailyTip?: string;
  }>;
};

export type AIRecapExport = {
  exportVersion: '1.0';
  exportedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    objective: User['profile']['objective'];
    health: Omit<User['profile']['health'], 'lastUpdated' | 'dataSource'> & {
      lastUpdated: string;
      dataSource: Omit<User['profile']['health']['dataSource'], 'lastSyncDate'> & {
        lastSyncDate?: string;
      };
    };
    training: User['profile']['training'];
    supplements: User['profile']['supplements'];
    allergies: string[];
    foodPreferences: string[];
  };
  privacy: {
    cloudConsent: boolean;
    consentAudit: ConsentAuditEntry[];
  };
  profileHistory: Awaited<ReturnType<typeof ProfileHistoryService.getForUser>>;
  recentPlanRange: PlanRangeCachePayload | null;
  promptForAI: string;
};

function sanitizeUserDates(user: User) {
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

function buildAIPrompt(payload: AIRecapExport): string {
  return [
    'Tu es un coach nutrition/sport.',
    'Fais un recap hebdomadaire du profil utilisateur ci-joint.',
    'Identifie les points bloquants, propose 3 ajustements concrets et 1 objectif prioritaire.',
    'Contrainte: respecte son objectif actuel et ses allergies.',
    '',
    `Objectif actuel: ${payload.user.objective}`,
    `Poids: ${payload.user.health.weight} kg`,
    `Taille: ${payload.user.health.height} cm`,
    `Age: ${payload.user.health.age}`,
  ].join('\n');
}

export async function buildAIRecapExport(user: User): Promise<AIRecapExport> {
  const [cloudConsentRaw, consentAudit, profileHistory, planRangeRaw] = await Promise.all([
    getSecureItem(CLOUD_CONSENT_STORAGE_KEY),
    getSecureJSON<ConsentAuditEntry[]>(CLOUD_CONSENT_AUDIT_STORAGE_KEY, []),
    ProfileHistoryService.getForUser(user.id),
    AsyncStorage.getItem(PLAN_RANGE_CACHE_KEY),
  ]);

  let recentPlanRange: PlanRangeCachePayload | null = null;
  if (planRangeRaw) {
    try {
      const parsed = JSON.parse(planRangeRaw) as PlanRangeCachePayload;
      if (parsed?.userId === user.id) {
        recentPlanRange = parsed;
      }
    } catch (error) {
      console.warn('[AIExportService] plan range parse error', error);
    }
  }

  const sanitizedUser = sanitizeUserDates(user);
  const payload: AIRecapExport = {
    exportVersion: '1.0',
    exportedAt: new Date().toISOString(),
    user: {
      id: sanitizedUser.id,
      email: sanitizedUser.email,
      name: sanitizedUser.profile.name,
      objective: sanitizedUser.profile.objective,
      health: sanitizedUser.profile.health,
      training: sanitizedUser.profile.training,
      supplements: sanitizedUser.profile.supplements,
      allergies: sanitizedUser.profile.allergies,
      foodPreferences: sanitizedUser.profile.foodPreferences,
    },
    privacy: {
      cloudConsent: cloudConsentRaw === 'true',
      consentAudit: Array.isArray(consentAudit) ? consentAudit : [],
    },
    profileHistory,
    recentPlanRange,
    promptForAI: '',
  };

  payload.promptForAI = buildAIPrompt(payload);
  await AsyncStorage.setItem(AI_EXPORT_LAST_SNAPSHOT_STORAGE_KEY, JSON.stringify(payload));

  return payload;
}

export async function exportAIRecapToJsonFile(user: User): Promise<{ uri: string; size: number }> {
  const payload = await buildAIRecapExport(user);
  const json = JSON.stringify(payload, null, 2);

  const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!baseDir) {
    throw new Error('Répertoire local indisponible pour l\'export.');
  }

  const safeEmail = user.email.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const fileName = `berserkercut-ai-export-${safeEmail}-${Date.now()}.json`;
  const uri = `${baseDir}${fileName}`;

  await FileSystem.writeAsStringAsync(uri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return {
    uri,
    size: json.length,
  };
}
