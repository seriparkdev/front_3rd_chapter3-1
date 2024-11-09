import { Event } from '../../types.ts';
import { createNotifications, filterExistingNotification } from '../../utils/notificationUtil.ts';

describe('알림 유틸리티 테스트', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '이벤트 2',
      date: '2024-10-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const mockPrevNotifications = [
    {
      id: '1',
      message: '이벤트 1 알림',
    },
  ];

  describe('기존 알림 필터링 테스트', () => {
    it('이미 알림이 생성된 이벤트는 필터링되어야 함', () => {
      const result = filterExistingNotification(mockEvents, mockPrevNotifications);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('이전 알림이 없는 경우 모든 이벤트가 반환되어야 함', () => {
      const result = filterExistingNotification(mockEvents, []);

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockEvents);
    });
  });

  describe('알림 생성 테스트', () => {
    it('새로운 알림이 생성되고 이전 알림과 함께 반환되어야 함', () => {
      const result = createNotifications(mockEvents, mockPrevNotifications);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(mockPrevNotifications[0]);
      expect(result.some((notification) => notification.id === '2')).toBe(true);
    });

    it('이전 알림이 없는 경우 모든 이벤트에 대한 새 알림이 생성되어야 함', () => {
      const result = createNotifications(mockEvents, []);

      expect(result).toHaveLength(2);
      expect(
        result.every((notification) => mockEvents.some((event) => event.id === notification.id))
      ).toBe(true);
    });

    it('새로운 이벤트가 없는 경우 이전 알림만 반환되어야 함', () => {
      const result = createNotifications([], mockPrevNotifications);

      expect(result).toHaveLength(1);
      expect(result).toEqual(mockPrevNotifications);
    });
  });
});
