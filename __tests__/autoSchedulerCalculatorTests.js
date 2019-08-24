'use strict'
const AutoScheduleCalculator = require('../modules/autoScheduleCalculator')

describe('AutoScheduleCalculator', () => {
  let defaultSchedule
  let mockOnIntensityChange
  let mockOnScheduleChange
  let mockTimeOfDayUtc
  let target
  beforeEach(() => {
    defaultSchedule = [
      {
        intensity: 0,
        timeMs: 1000
      },
      {
        intensity: 255,
        timeMs: 2000
      },
      {
        intensity: 255,
        timeMs: 3000
      },
      {
        intensity: 0,
        timeMs: 4000
      }
    ]
    mockOnIntensityChange = jest.fn()
    mockOnScheduleChange = jest.fn()
    mockTimeOfDayUtc = jest.fn().mockReturnValue(2000)
    target = new AutoScheduleCalculator('colour', mockTimeOfDayUtc)
    target.addOnIntensityChangeListener(mockOnIntensityChange)
    target.addOnScheduleChangeListener(mockOnScheduleChange)
  })

  describe('schedule property', () => {
    test('given no schedule set when schedule access, then schedule undefined', () => {
      expect(target.schedule).toBeUndefined()
    })

    test('given schedule set when schedule access, then schedule as previously set', () => {
      target.setSchedule(defaultSchedule)
      expect(target.schedule).toEqual(defaultSchedule)
    })
    test('given schedule set in wrong order when schedule access, then schedule as previously set', () => {
      target.setSchedule([
        {
          intensity: 55,
          timeMs: 500
        },
        {
          intensity: 43,
          timeMs: 100
        },
      ])

      expect(target.schedule).toEqual([
        {
          intensity: 43,
          timeMs: 100
        },
        {
          intensity: 55,
          timeMs: 500
        },
      ])
    })
  })

  describe('Intensity Change Event', () => {
    test('when initial set schedule, then intensity change event', () => {
      target.setSchedule(defaultSchedule)
      expect(mockOnIntensityChange).toHaveBeenCalledTimes(1)
    })

    test('given timeOfDayUtc is same as schedule time when initial set schedule, then intensity change event with schedule intensity ', () => {
      mockTimeOfDayUtc.mockReturnValue(3000)
      defaultSchedule[2].intensity = 127

      target.setSchedule(defaultSchedule)

      expect(mockOnIntensityChange.mock.calls[0][1]).toEqual(127)
    })

    test('given timeOfDayUtc is between rising schedule times when initial set schedule, then intensity change event with calculated intensity', () => {
      mockTimeOfDayUtc.mockReturnValue(1500)

      target.setSchedule(defaultSchedule)

      expect(mockOnIntensityChange.mock.calls[0][1]).toEqual(127)
    })

    test('given timeOfDayUtc is between falling schedule times when initial set schedule, then intensity change event with calculated intensity', () => {
      mockTimeOfDayUtc.mockReturnValue(3500)

      target.setSchedule(defaultSchedule)

      expect(mockOnIntensityChange.mock.calls[0][1]).toEqual(127)
    })

    test('given timeOfDayUtc is before first schedule time when initial set schedule, then intensity change event with calculated intensity', () => {
      mockTimeOfDayUtc.mockReturnValue(500)

      target.setSchedule(defaultSchedule)

      expect(mockOnIntensityChange.mock.calls[0][1]).toEqual(0)
    })

    test('given timeOfDayUtc is after last schedule time when initial set schedule, then intensity change event with calculated intensity', () => {
      mockTimeOfDayUtc.mockReturnValue(4500)

      target.setSchedule(defaultSchedule)

      expect(mockOnIntensityChange.mock.calls[0][1]).toEqual(0)
    })

    test('given schedule already set when  set identical schedule, then intensity change event not fired', () => {
      target.setSchedule(defaultSchedule)
      mockOnIntensityChange.mockClear()

      target.setSchedule(defaultSchedule.slice())

      expect(mockOnIntensityChange).not.toHaveBeenCalled()
    })

  })

  describe('schedule change event', () => {
    test('when schedule set, then schedule change event', () => {
      target.setSchedule(defaultSchedule, 'changedByTest')
      expect(mockOnScheduleChange).toHaveBeenCalledWith('colour', defaultSchedule, 'changedByTest')
    })
  })
})
