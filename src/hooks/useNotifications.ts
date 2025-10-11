import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import {
  configureNotifications,
  requestPermissionsAsync,
  scheduleNotification as scheduleNotificationUtil,
  scheduleDailyReminder,
  cancelAllNotifications,
  cancelNotification,
  listScheduledNotifications,
} from '@/utils/notifications';

export type NotificationPermissionState = 'granted' | 'denied' | 'undetermined';

interface ScheduleOptions {
  title: string;
  body: string;
  date?: Date | null;
  data?: Record<string, unknown>;
}

interface DailyReminderScheduleOptions {
  title: string;
  body: string;
  hour: number;
  minute: number;
}

const resolvePermissionState = (
  status: Notifications.NotificationPermissionsStatus,
): NotificationPermissionState => {
  if (status.granted || status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return 'granted';
  }

  return status.status;
};

export const useNotifications = () => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionState>('undetermined');
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listenerRef = useRef<Notifications.Subscription | null>(null);

  const readPermissions = useCallback(async (): Promise<NotificationPermissionState> => {
    const status = await Notifications.getPermissionsAsync();
    const resolved = resolvePermissionState(status);
    setPermissionStatus(resolved);
    return resolved;
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await configureNotifications();
        const resolved = await readPermissions();
        if (mounted) {
          setPermissionStatus(resolved);
        }
      } catch (err) {
        if (mounted) {
          setError((err as Error).message);
        }
      } finally {
        if (mounted) {
          setInitializing(false);
        }
      }
    })();

    listenerRef.current = Notifications.addNotificationResponseReceivedListener(() => {
      // Future analytics hook or navigation action
    });

    return () => {
      mounted = false;
      listenerRef.current?.remove();
    };
  }, [readPermissions]);

  const requestPermission = useCallback(async () => {
    setError(null);
    const granted = await requestPermissionsAsync();
    setPermissionStatus(granted ? 'granted' : 'denied');
    return granted;
  }, []);

  const ensurePermission = useCallback(async () => {
    if (permissionStatus === 'granted') {
      return true;
    }

    return requestPermission();
  }, [permissionStatus, requestPermission]);

  const scheduleNotification = useCallback(
    async ({ title, body, date = null, data }: ScheduleOptions) => {
      setError(null);
      const allowed = await ensurePermission();
      if (!allowed) {
        throw new Error('Permission notifications refusée');
      }

      return scheduleNotificationUtil(title, body, date ?? null, data ?? {});
    },
    [ensurePermission],
  );

  const scheduleDaily = useCallback(
    async ({ title, body, hour, minute }: DailyReminderScheduleOptions) => {
      setError(null);
      const allowed = await ensurePermission();
      if (!allowed) {
        throw new Error('Permission notifications refusée');
      }

      return scheduleDailyReminder({ title, body, hour, minute });
    },
    [ensurePermission],
  );

  const cancel = useCallback(async (identifier?: string) => {
    setError(null);
    if (identifier) {
      await cancelNotification(identifier);
    } else {
      await cancelAllNotifications();
    }
  }, []);

  const getScheduled = useCallback(async () => listScheduledNotifications(), []);

  return useMemo(
    () => ({
      initializing,
      permissionStatus,
      error,
      requestPermission,
      scheduleNotification,
      scheduleDailyReminder: scheduleDaily,
      cancelAll: () => cancel(),
      cancelNotification: (identifier: string) => cancel(identifier),
      listScheduledNotifications: getScheduled,
    }),
    [
      initializing,
      permissionStatus,
      error,
      requestPermission,
      scheduleNotification,
      scheduleDaily,
      cancel,
      getScheduled,
    ],
  );
};
