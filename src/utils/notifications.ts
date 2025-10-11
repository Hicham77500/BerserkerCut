import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

type SchedulableTrigger = Notifications.SchedulableNotificationTriggerInput;

/**
 * Configure le gestionnaire par défaut : affiche les notifications même si l'app est au premier plan.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Demande la permission d'envoyer des notifications locales à l'utilisateur.
 * @returns `true` si la permission est accordée.
 */
export const requestPermissionsAsync = async (): Promise<boolean> => {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const { status, granted } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
      allowProvisional: true,
    },
  });

  return granted || status === 'granted';
};

export const configureNotifications = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notifications quotidiennes',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
    });
  }
};

interface DailyReminderOptions {
  title: string;
  body: string;
  hour: number;
  minute: number;
}

export const scheduleDailyReminder = async ({ title, body, hour, minute }: DailyReminderOptions): Promise<string> => {
  const hasPermission = await requestPermissionsAsync();
  if (!hasPermission) {
    throw new Error('Permission notifications refusée');
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

/**
 * Planifie une notification locale à une date précise.
 */
export const scheduleNotification = async (
  title: string,
  body: string,
  trigger: Date | SchedulableTrigger | null = null,
  data: Record<string, unknown> = {},
): Promise<string> => {
  const hasPermission = await requestPermissionsAsync();
  if (!hasPermission) {
    throw new Error('Permission notifications refusée');
  }

  let resolvedTrigger: Notifications.NotificationTriggerInput = null;

  if (trigger instanceof Date) {
    resolvedTrigger = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    };
  } else if (trigger) {
    resolvedTrigger = trigger;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data,
    },
    trigger: resolvedTrigger,
  });
};

/**
 * Supprime toutes les notifications planifiées.
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const cancelNotification = async (identifier: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(identifier);
};

/**
 * Retourne toutes les notifications actuellement planifiées (utilitaire debug).
 */
export const listScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  return Notifications.getAllScheduledNotificationsAsync();
};
