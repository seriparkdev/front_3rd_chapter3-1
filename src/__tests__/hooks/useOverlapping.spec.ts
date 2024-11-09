import { renderHook, act } from '@testing-library/react';

import { useOverlapping } from '../../hooks/useOverlapping';
import { Event } from '../../types.ts';

describe('useOverlapping 커스텀 훅 테스트', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '기존 회의',
      date: '2024-10-17',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('alertOverlappingEvents 호출 시 다이얼로그가 열리고 중복 이벤트가 설정되어야 한다', () => {
    const { result } = renderHook(() => useOverlapping());

    act(() => {
      result.current.alertOverlappingEvents(mockEvents);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);
    expect(result.current.overlappingEvents).toEqual(mockEvents);
  });

  it('closeDialog 호출 시 다이얼로그가 닫혀야 한다', () => {
    const { result } = renderHook(() => useOverlapping());

    act(() => {
      result.current.alertOverlappingEvents(mockEvents);
    });

    expect(result.current.isOverlapDialogOpen).toBe(true);

    act(() => {
      result.current.closeDialog();
    });

    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('alertOverlappingEvents를 여러 번 호출할 때 중복 이벤트가 올바르게 업데이트되어야 한다', () => {
    const { result } = renderHook(() => useOverlapping());

    const firstEvents = [mockEvents[0]];
    const secondEvents = mockEvents;

    act(() => {
      result.current.alertOverlappingEvents(firstEvents);
    });

    expect(result.current.overlappingEvents).toEqual(firstEvents);

    act(() => {
      result.current.alertOverlappingEvents(secondEvents);
    });

    expect(result.current.overlappingEvents).toEqual(secondEvents);
  });
});
