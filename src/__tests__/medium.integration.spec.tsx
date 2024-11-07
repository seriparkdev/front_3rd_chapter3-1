import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';
import { expect } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerReading,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByRole('button', { name: '일정 추가' }));
};

const updateSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.clear(screen.getByLabelText(/제목/));
  await user.type(screen.getByLabelText(/제목/), title);
  await user.clear(screen.getByLabelText(/날짜/));
  await user.type(screen.getByLabelText(/날짜/), date);
  await user.clear(screen.getByLabelText(/시작 시간/));
  await user.type(screen.getByLabelText(/시작 시간/), startTime);
  await user.clear(screen.getByLabelText(/종료 시간/));
  await user.type(screen.getByLabelText(/종료 시간/), endTime);
  await user.clear(screen.getByLabelText(/설명/));
  await user.type(screen.getByLabelText(/설명/), description);
  await user.clear(screen.getByLabelText(/위치/));
  await user.type(screen.getByLabelText(/위치/), location);
  await user.selectOptions(screen.getByLabelText(/카테고리/), category);

  await user.click(screen.getByRole('button', { name: '일정 수정' }));
};

const findSchedule = (
  eventList: HTMLElement,
  event: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  expect(within(eventList).getByText(event.title)).toBeInTheDocument();
  expect(within(eventList).getByText(event.date)).toBeInTheDocument();
  expect(within(eventList).getByText(new RegExp(event.startTime))).toBeInTheDocument();
  expect(within(eventList).getByText(new RegExp(event.endTime))).toBeInTheDocument();
  expect(within(eventList).getByText(event.description)).toBeInTheDocument();
  expect(within(eventList).getByText(event.location)).toBeInTheDocument();
  expect(within(eventList).getByText(new RegExp(event.category))).toBeInTheDocument();
};

let user: UserEvent = null;

beforeEach(() => {
  user = userEvent.setup();
});

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    setupMockHandlerCreation([]);
    setup(<App />);

    const newEvent = {
      title: '저녁 약속',
      date: '2024-10-30',
      startTime: '20:00',
      endTime: '23:00',
      description: '대학 동기와 저녁 약속',
      location: '회사 앞',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await saveSchedule(user, newEvent);

    const eventList = screen.getByTestId('event-list');

    findSchedule(eventList, newEvent);
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    setup(<App />);

    const eventList = screen.getByTestId('event-list');

    const editButton = await within(eventList).findAllByRole('button', { name: 'Edit event' });

    await user.click(editButton[0]);

    const editedEvent = {
      title: '수정된 이벤트',
      date: '2024-10-08',
      startTime: '18:00',
      endTime: '19:00',
      description: '수정된 설명',
      location: '수정된 장소',
      category: '가족',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    };

    await updateSchedule(user, editedEvent);

    const updatedEventList = screen.getByTestId('event-list');

    findSchedule(updatedEventList, editedEvent);
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    setup(<App />);

    const eventList = await screen.findByTestId('event-list');
    expect(within(eventList).getByText('삭제할 이벤트')).toBeInTheDocument();

    const deleteButton = within(eventList).getAllByRole('button', { name: 'Delete event' });

    await user.click(deleteButton[0]);

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerReading(events);
    setup(<App />);

    await user.selectOptions(screen.getByLabelText(/view/), 'week');

    const weekView = screen.getByTestId('week-view');
    expect(within(weekView).queryByText('기존 회의')).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerReading(events);
    setup(<App />);

    await user.selectOptions(screen.getByLabelText(/view/), 'week');

    const weekView = screen.getByTestId('week-view');
    expect(within(weekView).getByText('기존 회의')).toBeInTheDocument();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '기존 회의',
        date: '2024-11-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerReading(events);
    setup(<App />);

    await user.selectOptions(screen.getByLabelText(/view/), 'month');

    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).queryByText('기존 회의')).not.toBeInTheDocument();
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '일정 1',
        date: '2024-10-01',
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
        title: '일정 2',
        date: '2024-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerReading(events);
    setup(<App />);

    await user.selectOptions(screen.getByLabelText(/view/), 'month');

    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getByText('일정 1')).toBeInTheDocument();
    expect(within(monthView).getByText('일정 2')).toBeInTheDocument();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date(2024, 0, 1));

    setup(<App />);

    const monthView = screen.getByTestId('month-view');
    expect(within(monthView).getByText('신정')).toBeInTheDocument();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '일정 1',
        date: '2024-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerReading(events);
    setup(<App />);

    await user.selectOptions(screen.getByLabelText(/view/), 'month');

    const eventList = screen.getByTestId('event-list');
    expect(within(eventList).getByText('일정 1')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/일정 검색/), '검색어');
    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerReading(events);
    setup(<App />);

    await user.selectOptions(screen.getByLabelText(/view/), 'month');

    const eventList = screen.getByTestId('event-list');
    await user.type(screen.getByLabelText(/일정 검색/), '팀 회의');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-01',
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
        title: '점심 약속',
        date: '2024-10-02',
        startTime: '09:00',
        endTime: '10:00',
        description: '대학 동기 약속',
        location: '회사 앞',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerReading(events);
    setup(<App />);

    await user.selectOptions(screen.getByLabelText(/view/), 'month');

    const eventList = screen.getByTestId('event-list');
    await user.type(screen.getByLabelText(/일정 검색/), '팀 회의');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    expect(within(eventList).queryByText('점심 약속')).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(/일정 검색/));
    expect(within(eventList).queryByText('점심 약속')).toBeInTheDocument();
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const events: Event[] = [
      {
        id: '1',
        title: '팀 회의',
        date: '2024-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '기존 팀 미팅',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ];

    setupMockHandlerCreation(events);
    setup(<App />);

    const newEvent = {
      title: '아침 약속',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '11:00',
      description: '친구랑 약속',
      location: '학교 앞',
      category: '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await saveSchedule(user, newEvent);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    setupMockHandlerUpdating();
    setup(<App />);

    const eventList = screen.getByTestId('event-list');

    const editButton = await within(eventList).findAllByRole('button', { name: 'Edit event' });

    await user.click(editButton[0]);

    const editedEvent = {
      title: '수정된 이벤트',
      date: '2024-10-15',
      startTime: '11:00',
      endTime: '19:00',
      description: '수정된 설명',
      location: '수정된 장소',
      category: '가족',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 60,
    };

    await updateSchedule(user, editedEvent);

    expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date(2024, 9, 1, 8, 50));
  const events: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2024-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  setupMockHandlerReading(events);
  setup(<App />);

  await screen.findByTestId('event-list');

  const alert = await screen.findByRole('alert');
  expect(
    await within(alert).findByText(`10분 후 ${events[0].title} 일정이 시작됩니다.`)
  ).toBeInTheDocument();
});
