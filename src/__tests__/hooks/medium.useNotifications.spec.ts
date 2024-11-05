import { act, renderHook } from '@testing-library/react';
import { expect } from 'vitest';

import { events } from '../../__mocks__/response/test_events.json';
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const mockEvents = events as Event[];

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.setSystemTime(new Date(2024, 9, 1, 9, 0));

  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  const mockNotificationEvent = mockEvents[0];

  expect(result.current.notifications[0]).toStrictEqual({
    id: mockNotificationEvent.id,
    message: `${mockNotificationEvent.notificationTime}분 후 ${mockNotificationEvent.title} 일정이 시작됩니다.`,
  });
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.setSystemTime(new Date(2024, 9, 1, 9, 0));

  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.setSystemTime(new Date(2024, 9, 1, 9, 0));

  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(2000);
  });

  expect(result.current.notifications.length).toBe(1);
  expect(result.current.notifiedEvents.length).toBe(1);
});
