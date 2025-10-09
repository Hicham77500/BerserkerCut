import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const TOKEN_KEY = 'berserker.auth.token';
const USER_KEY = 'berserker.auth.user';

type StoredSession = {
  token: string;
  refreshToken: string;
  user: User;
};

export async function saveSession(token: string, refreshToken: string, user: User): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, token),
    AsyncStorage.setItem('berserker.auth.refreshToken', refreshToken),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem('berserker.auth.refreshToken'),
    AsyncStorage.removeItem(USER_KEY),
  ]);
}

export async function getStoredSession(): Promise<StoredSession | null> {
  const [token, refreshToken, rawUser] = await Promise.all([
    AsyncStorage.getItem(TOKEN_KEY),
    AsyncStorage.getItem('berserker.auth.refreshToken'),
    AsyncStorage.getItem(USER_KEY),
  ]);

  if (!token || !refreshToken || !rawUser) {
    return null;
  }

  try {
    const user = JSON.parse(rawUser) as User;
    return { token, refreshToken, user };
  } catch (error) {
    await clearSession();
    return null;
  }
}

export async function getAuthToken(): Promise<string | null> {
  const { token } = (await getStoredSession()) || {};
  return token ?? null;
}

export async function getStoredUser(): Promise<User | null> {
  const { user } = (await getStoredSession()) || {};
  return user ?? null;
}

export async function updateStoredUser(user: User): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export default {
  saveSession,
  clearSession,
  getStoredSession,
  getAuthToken,
  getStoredUser,
  updateStoredUser,
};
