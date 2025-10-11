import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Calendar from 'expo-calendar';
import {
  AgendaEventInput,
  listUpcomingEvents,
  removeAgendaEvent,
  scheduleAgendaEvent,
  getCalendarPermissionStatusAsync,
  requestCalendarPermissionAsync,
} from '@/services/agendaService';

type CalendarPermission = 'granted' | 'denied' | 'undetermined';

const mapPermission = (status: Calendar.PermissionStatus): CalendarPermission => {
  if (status === Calendar.PermissionStatus.GRANTED) {
    return 'granted';
  }
  if (status === Calendar.PermissionStatus.DENIED) {
    return 'denied';
  }
  return 'undetermined';
};

export const useAgenda = () => {
  const [permissionStatus, setPermissionStatus] = useState<CalendarPermission>('undetermined');
  const [events, setEvents] = useState<Calendar.Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPermission = useCallback(async () => {
    const status = await getCalendarPermissionStatusAsync();
    setPermissionStatus(mapPermission(status));
  }, []);

  const refreshEvents = useCallback(
    async (daysForward = 7) => {
      setLoading(true);
      setError(null);
      try {
        const items = await listUpcomingEvents(daysForward);
        setEvents(items);
        setPermissionStatus('granted');
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        if (message.includes('Permission calendrier refusée')) {
          await loadPermission();
        }
      } finally {
        setLoading(false);
      }
    },
    [loadPermission],
  );

  useEffect(() => {
    loadPermission();
  }, [loadPermission]);

  const requestPermission = useCallback(async () => {
    const status = await requestCalendarPermissionAsync();
    const mapped = mapPermission(status);
    setPermissionStatus(mapped);
    return mapped === 'granted';
  }, []);

  const scheduleEvent = useCallback(
    async (input: AgendaEventInput) => {
      setError(null);
      const permissionGranted =
        permissionStatus === 'granted' ? true : await requestPermission();

      if (!permissionGranted) {
        throw new Error('Permission calendrier refusée');
      }

      const eventId = await scheduleAgendaEvent(input);
      await refreshEvents();
      return eventId;
    },
    [permissionStatus, refreshEvents, requestPermission],
  );

  const removeEventById = useCallback(
    async (eventId: string) => {
      setError(null);
      await removeAgendaEvent(eventId);
      await refreshEvents();
    },
    [refreshEvents],
  );

  return useMemo(
    () => ({
      permissionStatus,
      events,
      loading,
      error,
      refreshEvents,
      scheduleEvent,
      removeEvent: removeEventById,
      requestPermission,
    }),
    [permissionStatus, events, loading, error, refreshEvents, scheduleEvent, removeEventById, requestPermission],
  );
};
