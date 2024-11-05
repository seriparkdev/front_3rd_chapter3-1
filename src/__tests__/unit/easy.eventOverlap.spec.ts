import { events } from '../../__mocks__/response/test_events.json';
import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

const testEvents = events as Event[];

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const date = parseDateTime('2024-07-01', '14:30');
    expect(date).toEqual(new Date(2024, 6, 1, 14, 30));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2024-07-33', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const date = parseDateTime('2024-07-01', '25:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const date = parseDateTime('', '14:30');
    expect(date).toEqual(new Date('Invalid Date'));
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const dateRange = convertEventToDateRange(testEvents[0]);

    expect(dateRange).toEqual({
      start: new Date(2024, 9, 1, 10, 0),
      end: new Date(2024, 9, 1, 11, 0),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2024-14-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const dateRange = convertEventToDateRange(event);
    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2024-10-01',
      startTime: '29:00',
      endTime: '25:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const dateRange = convertEventToDateRange(event);
    expect(dateRange).toEqual({
      start: new Date('Invalid Date'),
      end: new Date('Invalid Date'),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2024-10-29',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const event2: Event = {
      id: '80d85368-b4a4-47b3-b959-25171d49371f',
      title: '팀 회의',
      date: '2024-10-29',
      startTime: '10:30',
      endTime: '12:00',
      description: '주간 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const result = isOverlapping(event1, event2);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1: Event = {
      id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
      title: '팀 회의',
      date: '2024-10-28',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const event2: Event = {
      id: '80d85368-b4a4-47b3-b959-25171d49371f',
      title: '팀 회의',
      date: '2024-10-29',
      startTime: '10:30',
      endTime: '12:00',
      description: '주간 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const result = isOverlapping(event1, event2);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const newEvent: Event = {
      id: '80d85368-b4a4-47b3-b959-25171d49371f',
      title: '팀 회의',
      date: '2024-10-29',
      startTime: '10:30',
      endTime: '12:00',
      description: '주간 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const events: Event[] = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2024-10-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
        title: '점심 약속',
        date: '2024-10-05',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
        title: '프로젝트 마감',
        date: '2024-10-25',
        startTime: '09:00',
        endTime: '18:00',
        description: '분기별 프로젝트 마감',
        location: '사무실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const result = findOverlappingEvents(newEvent, events);
    expect(result).toStrictEqual([events[0]]);
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const newEvent: Event = {
      id: '80d85368-b4a4-47b3-b959-25171d49371f',
      title: '팀 회의',
      date: '2024-10-08',
      startTime: '10:30',
      endTime: '12:00',
      description: '주간 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 1,
    };

    const events: Event[] = [
      {
        id: '2b7545a6-ebee-426c-b906-2329bc8d62bd',
        title: '팀 회의',
        date: '2024-10-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: '09702fb3-a478-40b3-905e-9ab3c8849dcd',
        title: '점심 약속',
        date: '2024-10-05',
        startTime: '12:30',
        endTime: '13:30',
        description: '동료와 점심 식사',
        location: '회사 근처 식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
      {
        id: 'da3ca408-836a-4d98-b67a-ca389d07552b',
        title: '프로젝트 마감',
        date: '2024-10-25',
        startTime: '09:00',
        endTime: '18:00',
        description: '분기별 프로젝트 마감',
        location: '사무실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      },
    ];

    const result = findOverlappingEvents(newEvent, events);
    expect(result).toStrictEqual([]);
  });
});
