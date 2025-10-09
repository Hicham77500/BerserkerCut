import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getAuthToken, saveSession, clearSession } from './sessionStorage';

const expoConfig = Constants.expoConfig?.extra ?? {};

// Gestion optimisée des URLs par défaut selon la plateforme
const DEFAULT_API_URL = (() => {
  if (__DEV__) {
    // En développement
    if (Constants.isDevice) {
      // Sur un appareil physique
      return 'http://192.168.1.195:4000'; // Remplacez par votre IP locale
    }
    // Sur simulateur/émulateur
    return Platform.select({
      web: 'http://localhost:4000',
      ios: 'http://localhost:4000',
      android: 'http://10.0.2.2:4000',
      default: 'http://localhost:4000'
    });
  }
  // En production
  return 'https://api.berserkercut.com';
})();

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

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      const error = await response.json();
      throw new ApiError(
        error.message || 'Une erreur est survenue',
        response.status,
        error
      );
    }
    throw new ApiError('Une erreur est survenue', response.status);
  }

  return isJson ? response.json() : response.text();
}

export const apiClient = {
  baseUrl: API_BASE_URL,
  async request<T = any>(
    path: string,
    method: HttpMethod = 'GET',
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const { query, skipAuth, ...fetchOptions } = options;
    const queryString = buildQueryString(query);
    const headers = await buildHeaders(skipAuth);

    const response = await fetch(`${API_BASE_URL}${path}${queryString}`, {
      method,
      headers: {
        ...headers,
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions,
    });

    return handleResponse(response);
  },

  get: <T = any>(path: string, options?: RequestOptions) =>
    apiClient.request<T>(path, 'GET', undefined, options),

  post: <T = any>(path: string, data?: any, options?: RequestOptions) =>
    apiClient.request<T>(path, 'POST', data, options),

  put: <T = any>(path: string, data?: any, options?: RequestOptions) =>
    apiClient.request<T>(path, 'PUT', data, options),

  patch: <T = any>(path: string, data?: any, options?: RequestOptions) =>
    apiClient.request<T>(path, 'PATCH', data, options),

  delete: <T = any>(path: string, options?: RequestOptions) =>
    apiClient.request<T>(path, 'DELETE', undefined, options),
};