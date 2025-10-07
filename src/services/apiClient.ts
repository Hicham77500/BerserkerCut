import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getAuthToken } from './sessionStorage';

const expoConfig = Constants.expoConfig?.extra ?? {};

// Gestion optimisée des URLs par défaut selon la plateforme
const DEFAULT_API_URL = Platform.select({
  web: 'http://localhost:4000',
  ios: 'http://localhost:4000', // Pour simulateur iOS
  android: 'http://10.0.2.2:4000', // Pour émulateur Android
  default: 'http://localhost:4000'
});

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  expoConfig.apiBaseUrl ||
  DEFAULT_API_URL;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

function buildQueryString(params?: RequestOptions['query']): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

async function buildHeaders(skipAuth?: boolean): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function request<T>(path: string, method: HttpMethod, options: RequestOptions = {}): Promise<T> {
  const { body, headers: customHeaders, query, skipAuth, ...rest } = options;
  const headers = {
    ...(await buildHeaders(skipAuth)),
    ...customHeaders,
  };

  const payload = typeof body === 'string' ? body : body ? JSON.stringify(body) : undefined;

  const response = await fetch(`${API_BASE_URL}${path}${buildQueryString(query)}`, {
    method,
    headers,
    body: payload,
    ...rest,
  });

  if (!response.ok) {
    const errorPayload = await safeJson(response);
    const error = new Error(errorPayload?.message || 'Une erreur est survenue');
    (error as any).status = response.status;
    (error as any).details = errorPayload;
    throw error;
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await safeJson(response)) as T;
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, 'GET', options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, 'POST', { ...options, body: body as any }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, 'PATCH', { ...options, body: body as any }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, 'PUT', { ...options, body: body as any }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, 'DELETE', options),
  buildUrl: (path: string) => `${API_BASE_URL}${path}`,
  get baseUrl() {
    return API_BASE_URL;
  },
};

export type ApiClient = typeof apiClient;

export default apiClient;
