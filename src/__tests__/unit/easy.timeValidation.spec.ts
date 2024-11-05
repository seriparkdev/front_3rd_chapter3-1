import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  const ERROR_MESSAGE = {
    START_TIME: '시작 시간은 종료 시간보다 빨라야 합니다.',
    END_TIME: '종료 시간은 시작 시간보다 늦어야 합니다.',
  };

  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage('14:00', '13:00')).toEqual({
      startTimeError: ERROR_MESSAGE.START_TIME,
      endTimeError: ERROR_MESSAGE.END_TIME,
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage('14:00', '14:00')).toEqual({
      startTimeError: ERROR_MESSAGE.START_TIME,
      endTimeError: ERROR_MESSAGE.END_TIME,
    });
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('12:00', '13:00')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('', '13:00')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('12:00', '')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('', '')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
