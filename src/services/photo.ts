import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

export interface PhotoRecord {
  id: string;
  uri: string;
  timestamp: number;
  localUri?: string;
}

export interface PhotoUploadPayload {
  id?: string;
  uri: string;
  timestamp: number;
}

const ALBUM_NAME = 'BerserkerCut';

const ensurePermissions = async (): Promise<boolean> => {
  try {
    const current = await MediaLibrary.getPermissionsAsync();
    if (current.granted) {
      return true;
    }

    if (Platform.OS === 'ios' && 'requestFullPermissionsAsync' in MediaLibrary) {
      const request = await (MediaLibrary as typeof MediaLibrary & {
        requestFullPermissionsAsync: () => Promise<MediaLibrary.PermissionResponse>;
      }).requestFullPermissionsAsync();
      return request.granted;
    }

    const request = await MediaLibrary.requestPermissionsAsync();
    return request.granted;
  } catch (error) {
    console.warn('[PhotoService] permission error', error);
    return false;
  }
};

const ensureAlbum = async (): Promise<MediaLibrary.Album | null> => {
  const hasPermission = await ensurePermissions();
  if (!hasPermission) {
    return null;
  }

  try {
    const album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
    if (album) {
      return album;
    }
  } catch (error) {
    console.warn('[PhotoService] getAlbum error', error);
  }

  return null;
};

const getTimestampFromAsset = (asset: MediaLibrary.Asset): number => {
  const base = asset.modificationTime ?? asset.creationTime ?? Date.now();
  // Expo returns timestamps in milliseconds. Ensure the value stays in ms.
  return base > 10_000_000_000 ? base : Math.round(base * 1000);
};

const assetToRecord = async (asset: MediaLibrary.Asset): Promise<PhotoRecord> => {
  try {
    const info = await MediaLibrary.getAssetInfoAsync(asset, {
      shouldDownloadFromNetwork: true,
    });
    return {
      id: asset.id,
      uri: info.localUri ?? asset.uri,
      timestamp: getTimestampFromAsset(asset),
      localUri: info.localUri ?? asset.uri,
    };
  } catch (error) {
    console.warn('[PhotoService] asset info error', error);
    return {
      id: asset.id,
      uri: asset.uri,
      timestamp: getTimestampFromAsset(asset),
    };
  }
};

const createAlbumIfNeeded = async (asset: MediaLibrary.Asset): Promise<MediaLibrary.Album | null> => {
  const hasPermission = await ensurePermissions();
  if (!hasPermission) {
    return null;
  }

  try {
    const existing = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
    if (existing) {
      return existing;
    }
    return await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
  } catch (error) {
    console.warn('[PhotoService] createAlbum error', error);
    return null;
  }
};

export const PhotoService = {
  async listPhotos(): Promise<PhotoRecord[]> {
    const album = await ensureAlbum();
    if (!album) {
      return [];
    }

    try {
      const result = await MediaLibrary.getAssetsAsync({
        album,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [MediaLibrary.SortBy.creationTime],
        first: 200,
      });

      const assets = Array.isArray(result)
        ? result
        : Array.isArray(result.assets)
        ? result.assets
        : [];

      const records: PhotoRecord[] = [];
      for (const asset of assets) {
        if (asset.mediaType !== MediaLibrary.MediaType.photo) continue;
        const record = await assetToRecord(asset);
        records.push(record);
      }

      return records;
    } catch (error) {
      console.warn('[PhotoService] list error', error);
      return [];
    }
  },

  async uploadPhoto(payload: PhotoUploadPayload): Promise<PhotoRecord | null> {
    const hasPermission = await ensurePermissions();
    if (!hasPermission) {
      console.warn('[PhotoService] upload aborted – permission refusée');
      return null;
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(payload.uri);
      let album: MediaLibrary.Album | null = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
      if (!album) {
        album = await createAlbumIfNeeded(asset);
        if (!album) {
          return null;
        }
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      return {
        id: asset.id,
        uri: asset.uri,
        timestamp: payload.timestamp ?? getTimestampFromAsset(asset),
      };
    } catch (error) {
      console.warn('[PhotoService] upload error', error);
      return null;
    }
  },

  async deletePhoto(id: string): Promise<boolean> {
    const hasPermission = await ensurePermissions();
    if (!hasPermission) {
      return false;
    }

    try {
      await MediaLibrary.deleteAssetsAsync([id]);
      return true;
    } catch (error) {
      console.warn('[PhotoService] delete error', error);
      return false;
    }
  },

  async clearAlbum(): Promise<number> {
    const album = await ensureAlbum();
    if (!album) {
      return 0;
    }

    try {
      const result = await MediaLibrary.getAssetsAsync({
        album,
        mediaType: MediaLibrary.MediaType.photo,
        first: album.assetCount ?? 200,
      });
      const assets = Array.isArray(result)
        ? result
        : Array.isArray(result.assets)
        ? result.assets
        : [];
      if (!assets.length) {
        return 0;
      }

      await MediaLibrary.removeAssetsFromAlbumAsync(
        assets.map((asset) => asset.id),
        album
      );
      return assets.length;
    } catch (error) {
      console.warn('[PhotoService] clearAlbum error', error);
      return 0;
    }
  },
};

export default PhotoService;
