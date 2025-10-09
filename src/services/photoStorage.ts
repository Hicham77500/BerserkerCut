import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { MEAL_PHOTOS_STORAGE_KEY, PHOTOS_STORAGE_KEY } from '@/constants/storageKeys';
import { getSecureJSON, removeSecureItem, setSecureJSON } from '@/utils/storage/secureStorage';

export interface StoredPhoto {
  id?: string;
  uri: string;
  timestamp: number;
  cloudSynced?: boolean;
}

export interface MealPhoto extends StoredPhoto {
  id: string;
  mealId: string;
}

// No photo limit
const DEFAULT_MAX_PHOTOS = Number.MAX_SAFE_INTEGER;
const DOCUMENT_DIRECTORY = (FileSystem as unknown as { documentDirectory?: string | null }).documentDirectory ?? null;
const PHOTO_FOLDER = DOCUMENT_DIRECTORY
  ? `${DOCUMENT_DIRECTORY.replace(/\/$/, '')}/berserkercut/photos`
  : null;

const ensurePhotoDirectory = async () => {
  if (!PHOTO_FOLDER) return;
  try {
    const info = await FileSystem.getInfoAsync(PHOTO_FOLDER);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(PHOTO_FOLDER, { intermediates: true });
    }
  } catch (error) {
    console.warn('[photoStorage] unable to ensure directory', error);
  }
};

const isManagedUri = (uri: string | null | undefined): boolean => {
  if (!uri || !PHOTO_FOLDER) return false;
  return uri.startsWith(PHOTO_FOLDER);
};

const deleteManagedFile = async (uri: string | null | undefined) => {
  if (!uri || !PHOTO_FOLDER || !isManagedUri(uri)) return;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.warn('[photoStorage] unable to delete file', error);
  }
};

const sanitizeExtension = (uri: string): string => {
  const match = /\.(\w+)(?:\?|$)/.exec(uri);
  if (!match) return '.jpg';
  const ext = match[1]?.toLowerCase();
  if (!ext) return '.jpg';
  if (ext === 'jpeg' || ext === 'jpg' || ext === 'png' || ext === 'heic' || ext === 'heif' || ext === 'gif') {
    return `.${ext}`;
  }
  return '.jpg';
};

const sanitizeIdentifier = (identifier: string, fallback: string): string => {
  const safe = identifier.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^[-_]+|[-_]+$/g, '');
  return safe.length ? safe : fallback;
};

const createManagedCopy = async (sourceUri: string, identifier: string): Promise<string> => {
  if (!PHOTO_FOLDER) {
    return sourceUri;
  }

  await ensurePhotoDirectory();
  const extension = sanitizeExtension(sourceUri);
  const safeIdentifier = sanitizeIdentifier(identifier, `photo-${Date.now()}`);
  const targetUri = `${PHOTO_FOLDER}/${safeIdentifier}${extension}`;

  try {
    // Overwrite if the file already exists to avoid leaking files.
    await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
    return targetUri;
  } catch (error) {
    console.warn('[photoStorage] copy failed, falling back to original URI', error);
    return sourceUri;
  }
};

const loadMealPhotosFlat = async (): Promise<MealPhoto[]> => {
  try {
    const stored = await AsyncStorage.getItem(MEAL_PHOTOS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is MealPhoto => Boolean(item?.mealId && item?.id && item?.uri));
  } catch (error) {
    console.warn('[photoStorage] unable to parse meal photos', error);
    return [];
  }
};

const persistMealPhotosFlat = async (photos: MealPhoto[]) => {
  try {
    await AsyncStorage.setItem(MEAL_PHOTOS_STORAGE_KEY, JSON.stringify(photos));
  } catch (error) {
    console.warn('[photoStorage] unable to save meal photos', error);
  }
};

const loadGalleryPhotos = async (): Promise<StoredPhoto[]> => {
  return getSecureJSON<StoredPhoto[]>(PHOTOS_STORAGE_KEY, []);
};

const persistGalleryPhotos = async (photos: StoredPhoto[]) => {
  await setSecureJSON(PHOTOS_STORAGE_KEY, photos);
};

export const photoStorage = {
  MAX_GALLERY_PHOTOS: DEFAULT_MAX_PHOTOS,
  ensureLocalCopy: createManagedCopy,
  deleteLocalCopy: deleteManagedFile,
  isManagedUri,

  async loadMealPhotosByMeal(): Promise<Record<string, MealPhoto[]>> {
    const flat = await loadMealPhotosFlat();
    return flat.reduce<Record<string, MealPhoto[]>>((acc, photo) => {
      if (!acc[photo.mealId]) {
        acc[photo.mealId] = [];
      }
      acc[photo.mealId].push(photo);
      return acc;
    }, {});
  },

  async appendMealPhoto(photo: MealPhoto) {
    const flat = await loadMealPhotosFlat();
    flat.push(photo);
    await persistMealPhotosFlat(flat);
  },

  async saveMealPhotoMap(map: Record<string, MealPhoto[]>) {
    const flat = Object.values(map).flat();
    await persistMealPhotosFlat(flat);
  },

  async clearMealPhotos() {
    const flat = await loadMealPhotosFlat();
    const managedUris = Array.from(new Set(flat.map((item) => item.uri)));
    await Promise.all(managedUris.map((uri) => deleteManagedFile(uri)));
    await AsyncStorage.removeItem(MEAL_PHOTOS_STORAGE_KEY);
  },

  async removeMealPhotosByTimestamp(timestamp: number) {
    const flat = await loadMealPhotosFlat();
    const { keep, removed } = flat.reduce<{
      keep: MealPhoto[];
      removed: MealPhoto[];
    }>(
      (acc, photo) => {
        if (photo.timestamp === timestamp) {
          acc.removed.push(photo);
        } else {
          acc.keep.push(photo);
        }
        return acc;
      },
      { keep: [], removed: [] }
    );

    await persistMealPhotosFlat(keep);

    const managedUris = Array.from(new Set(removed.map((item) => item.uri)));
    await Promise.all(managedUris.map((uri) => deleteManagedFile(uri)));

    return removed;
  },

  async loadGallery() {
    return loadGalleryPhotos();
  },

  async setGallery(photos: StoredPhoto[]) {
    await persistGalleryPhotos(photos);
  },

  async pushToGallery(photo: StoredPhoto) {
    const current = await loadGalleryPhotos();
    // Add the new photo to the gallery without limiting the number
    const next = [...current, photo].sort((a, b) => a.timestamp - b.timestamp);
    await persistGalleryPhotos(next);
    return next;
  },

  async removeFromGallery(timestamp: number) {
    const current = await loadGalleryPhotos();
    const target = current.find((item) => item.timestamp === timestamp);
    const next = current.filter((item) => item.timestamp !== timestamp);
    await persistGalleryPhotos(next);
    if (target?.uri) {
      await deleteManagedFile(target.uri);
    }
    return { next, removed: target ?? null };
  },

  async clearGallery() {
    const current = await loadGalleryPhotos();
    const managedUris = Array.from(new Set(current.map((item) => item.uri)));
    await Promise.all(managedUris.map((uri) => deleteManagedFile(uri)));
    await removeSecureItem(PHOTOS_STORAGE_KEY);
  },

  async clearAll() {
    await Promise.all([this.clearGallery(), this.clearMealPhotos()]);
  },
};

export default photoStorage;
