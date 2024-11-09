import { Event } from '../types.ts';
import { createNotificationMessage } from './notificationUtils.ts';

export const filterExistingNotification = (
  upcomingEvents: Event[],
  prevNotifications: { id: string; message: string }[]
) => {
  return upcomingEvents.filter(
    (event) => !prevNotifications.some((prevNotification) => prevNotification.id === event.id)
  );
};

export const createNotifications = (
  upcomingEvents: Event[],
  prevNotifications: { id: string; message: string }[]
) => {
  const newNotifications = filterExistingNotification(upcomingEvents, prevNotifications).map(
    (event) => ({
      id: event.id,
      message: createNotificationMessage(event),
    })
  );

  return [...prevNotifications, ...newNotifications];
};
