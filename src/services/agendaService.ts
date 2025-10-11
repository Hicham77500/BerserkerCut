import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

const CALENDAR_NAME = 'BerserkerCut Agenda';
const CALENDAR_COLOR = '#C2633A';

export type AgendaEventType = 'training' | 'nutrition' | 'supplement' | 'check-in';

export interface AgendaEventInput {
  title: string;
  notes?: string;
  startDate: Date;
  endDate?: Date;
  type?: AgendaEventType;
  location?: string;
}

export interface AgendaEvent extends AgendaEventInput {
  id: string;
  calendarId: string;
}

const getDefaultCalendarSource = async (): Promise<Calendar.Source> => {
  if (Platform.OS === 'ios') {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    if (defaultCalendar?.source) {
      return defaultCalendar.source;
    }
  }

  return {
    isLocalAccount: true,
    name: CALENDAR_NAME,
    type: 'local',
  } as Calendar.Source;
};

export const getCalendarPermissionStatusAsync = async (): Promise<Calendar.PermissionStatus> => {
  const { status } = await Calendar.getCalendarPermissionsAsync();
  return status;
};

export const requestCalendarPermissionAsync = async (): Promise<Calendar.PermissionStatus> => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status;
};

export const ensureCalendarAsync = async (): Promise<string> => {
  const initialStatus = await getCalendarPermissionStatusAsync();
  const status =
    initialStatus === Calendar.PermissionStatus.GRANTED
      ? initialStatus
      : await requestCalendarPermissionAsync();

  if (status !== Calendar.PermissionStatus.GRANTED) {
    throw new Error("Permission calendrier refusée");
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const existing = calendars.find((calendar) => calendar.name === CALENDAR_NAME);
  if (existing) {
    return existing.id;
  }

  const source = await getDefaultCalendarSource();

  return Calendar.createCalendarAsync({
    title: CALENDAR_NAME,
    name: CALENDAR_NAME,
    color: CALENDAR_COLOR,
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
    entityType: Calendar.EntityTypes.EVENT,
    source,
    ownerAccount: 'berserkercut',
    timeZone: undefined,
  });
};

export const scheduleAgendaEvent = async (input: AgendaEventInput): Promise<string> => {
  const calendarId = await ensureCalendarAsync();
  const endDate = input.endDate ?? new Date(input.startDate.getTime() + 60 * 60 * 1000);

  return Calendar.createEventAsync(calendarId, {
    title: input.title,
    notes: input.notes,
    startDate: input.startDate,
    endDate,
    location: input.location,
    alarms: [
      {
        relativeOffset: -15,
      },
    ],
    timeZone: undefined,
  });
};

export const removeAgendaEvent = async (eventId: string): Promise<void> => {
  await Calendar.deleteEventAsync(eventId, { futureEvents: false, instanceStartDate: undefined });
};

export const listUpcomingEvents = async (daysForward = 7): Promise<Calendar.Event[]> => {
  const calendarId = await ensureCalendarAsync();
  const now = new Date();
  const future = new Date(now.getTime() + daysForward * 24 * 60 * 60 * 1000);

  return Calendar.getEventsAsync([calendarId], now, future);
};
