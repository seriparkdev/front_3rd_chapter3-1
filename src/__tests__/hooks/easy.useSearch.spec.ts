import { act, renderHook } from '@testing-library/react';
import { expect } from 'vitest';

import { events } from '../../__mocks__/response/test_events.json';
import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents = events as Event[];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date(), 'month'));

  expect(result.current.filteredEvents).toHaveLength(mockEvents.length);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date(), 'week'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents).toEqual([mockEvents[0]]);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents).toEqual([mockEvents[0], mockEvents[4]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: weekResult } = renderHook(() => useSearch(mockEvents, new Date(), 'week'));

  expect(weekResult.current.filteredEvents).toHaveLength(2);
  expect(weekResult.current.filteredEvents).toEqual([mockEvents[0], mockEvents[1]]);

  const { result: monthResult } = renderHook(() => useSearch(mockEvents, new Date(), 'month'));

  expect(monthResult.current.filteredEvents).toHaveLength(5);
  expect(monthResult.current.filteredEvents).toEqual([
    mockEvents[0],
    mockEvents[1],
    mockEvents[2],
    mockEvents[3],
    mockEvents[4],
  ]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(2);
  expect(result.current.filteredEvents).toEqual([mockEvents[0], mockEvents[4]]);

  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
});
