'use strict'
const AutoScheduleCalculator = require('../modules/autoScheduleCalculator')

describe('AutoScheduleCalculator', () => {
  let defaultSchedule
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
    mockTimeOfDayUtc = jest.fn().mockReturnValue(2000)
    target = new AutoScheduleCalculator('colour', mockTimeOfDayUtc)
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
    let mockOnIntensityChange
    beforeEach(() => {
      mockOnIntensityChange = jest.fn()
      target.addOnIntensityChangeListener(mockOnIntensityChange)
    })

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

    test('given schedule set when trigger intensity event then intensity change event fired', () => {
      mockTimeOfDayUtc.mockReturnValue(1000)
      target.setSchedule(defaultSchedule)
      mockOnIntensityChange.mockClear()

      mockTimeOfDayUtc.mockReturnValue(1500)

      target.checkAndTriggerIntensityEvent()

      expect(mockOnIntensityChange).toHaveBeenCalled()
    })
  })

  describe('schedule change event', () => {
    let mockOnScheduleChange
    beforeEach(() => {
      mockOnScheduleChange = jest.fn()
      target.addOnScheduleChangeListener(mockOnScheduleChange)
    })
    test('when schedule set, then schedule change event', () => {
      target.setSchedule(defaultSchedule, 'changedByTest')
      expect(mockOnScheduleChange).toHaveBeenCalledWith('colour', defaultSchedule, 'changedByTest')
    })
  })

  describe('next intensity change time event', () => {
    let mockNextIntensityChangeTimeEvent
    beforeEach(() => {
      mockNextIntensityChangeTimeEvent = jest.fn()
      target.addNextIntensityChangeTimeListener(mockNextIntensityChangeTimeEvent)
    })
    test('when set schedule with intensity values all same then no next intensity change time event', () => {
      defaultSchedule.forEach(scheduleItem => scheduleItem.intensity = 0.5)

      target.setSchedule(defaultSchedule)

      expect(mockNextIntensityChangeTimeEvent).not.toHaveBeenCalled()
    })
    test('when set schedule with intensity starting rise then next intensity change event fired', () => {
      mockTimeOfDayUtc.mockReturnValue(1000)

      target.setSchedule([
        {
          timeMs: 1000,
          intensity: 100
        },
        {
          timeMs: 1100,
          intensity: 200
        },
      ])

      expect(mockNextIntensityChangeTimeEvent).toHaveBeenCalledWith('colour', 1001)
    })
    test('when set schedule with intensity starting fall then next intensity change event fired', () => {
      mockTimeOfDayUtc.mockReturnValue(1000)

      target.setSchedule([
        {
          timeMs: 1000,
          intensity: 200
        },
        {
          timeMs: 1100,
          intensity: 100
        },
      ])

      expect(mockNextIntensityChangeTimeEvent).toHaveBeenCalledWith('colour', 1001)
    })
    test('when set schedule with intensity rising then next intensity change event fired', () => {
      mockTimeOfDayUtc.mockReturnValue(1050)

      target.setSchedule([
        {
          timeMs: 1000,
          intensity: 100
        },
        {
          timeMs: 1100,
          intensity: 200
        },
      ])

      expect(mockNextIntensityChangeTimeEvent).toHaveBeenCalledWith('colour', 1051)
    })
    test('when set schedule with intensity falling then next intensity change event fired', () => {
      mockTimeOfDayUtc.mockReturnValue(1050)

      target.setSchedule([
        {
          timeMs: 1000,
          intensity: 200
        },
        {
          timeMs: 1100,
          intensity: 100
        },
      ])

      expect(mockNextIntensityChangeTimeEvent).toHaveBeenCalledWith('colour', 1051)
    })
    test('when set schedule with intensity rising in future then next intensity change event fired', () => {
      mockTimeOfDayUtc.mockReturnValue(500)

      target.setSchedule([
        {
          timeMs: 1000,
          intensity: 100
        },
        {
          timeMs: 1100,
          intensity: 200
        },
        {
          timeMs: 1200,
          intensity: 100
        },
      ])

      expect(mockNextIntensityChangeTimeEvent).toHaveBeenCalledWith('colour', 1001)
    })
    test('when set schedule with intensity falling in future then next intensity change event fired', () => {
      mockTimeOfDayUtc.mockReturnValue(500)

      target.setSchedule([
        {
          timeMs: 1000,
          intensity: 200
        },
        {
          timeMs: 1100,
          intensity: 100
        },
        {
          timeMs: 1200,
          intensity: 200
        },
      ])

      expect(mockNextIntensityChangeTimeEvent).toHaveBeenCalledWith('colour', 1001)
    })
    test('real scenario 1', () => {
      mockTimeOfDayUtc.mockReturnValue(1566734630261)
      target.setSchedule([
        {
          'timeMs': 42926582,
          'intensity': 0
        },
        {
          'timeMs': 44840506,
          'intensity': 252
        },
        {
          'timeMs': 68400000,
          'intensity': 255
        },
        {
          'timeMs': 72000000,
          'intensity': 0
        }
      ])

      expect(mockNextIntensityChangeTimeEvent).toHaveBeenCalled()
      expect(mockNextIntensityChangeTimeEvent.mock.calls[0][1]).toBeGreaterThan(1566734630261)
    })
  })

})
