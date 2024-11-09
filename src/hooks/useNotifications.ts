import { useInterval } from '@chakra-ui/react';
import { useState } from 'react';

import { Event } from '../types';
import { createNotifications } from '../utils/notificationUtil.ts';
import { getUpcomingEvents } from '../utils/notificationUtils';

export const useNotifications = (events: Event[]) => {
  const [notifications, setNotifications] = useState<{ id: string; message: string }[]>([]);
  const [notifiedEvents, setNotifiedEvents] = useState<string[]>([]);

  const checkUpcomingEvents = () => {
    const now = new Date();
    const upcomingEvents = getUpcomingEvents(events, now, notifiedEvents);

    setNotifications((prev) => createNotifications(upcomingEvents, prev));

    setNotifiedEvents((prev) => [
      ...prev,
      ...upcomingEvents
        .filter((event) => !prev.some((notificationId) => notificationId === event.id))
        .map(({ id }) => id),
    ]);
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  useInterval(checkUpcomingEvents, 1000); // 1초마다 체크

  return { notifications, notifiedEvents, setNotifications, removeNotification };
};
