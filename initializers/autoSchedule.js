'use strict'
const ActionHero = require('actionhero')
const Enumerable = require('linq/linq.js');
const AutoScheduleCalculator = require('../modules/autoScheduleCalculator')
const IntensityTranslator = require('../modules/intensityTranslator')
const AsyncLock = require('async-lock')
const lock = new AsyncLock()

const parseTimeToMs = (s) => {
  const re = /(\d{2}):(\d{2}):(\d{2})(\.(\d{3}))?/
  const result = re.exec(s)
  if (!result) {
    throw new Error('Cannot parse \'' + s + '\'')
  }
  const milliseconds = result[5]
  const date = new Date(1970, 0, 1, result[1], result[2], result[3], milliseconds || 0)
  return date.getTime()
}

module.exports = class AutoScheduleInitializer extends ActionHero.Initializer {
  constructor () {
    super()
    this.name = 'autoSchedule'
    this.loadPriority = 1001
    this.startPriority = 1001
    this.stopPriority = 1000
  }

  async initialize () {
    ActionHero.api.autoSchedule = {
      calculators: {
        red: new AutoScheduleCalculator('red'),
        blue: new AutoScheduleCalculator('blue'),
        white: new AutoScheduleCalculator('white'),
      },
      translators: {
        red: new IntensityTranslator(255),
        blue: new IntensityTranslator(255),
        white: new IntensityTranslator(255),
      },
      allChannels: ['red', 'white', 'blue']
    }
    ActionHero.api.chatRoom.addMiddleware({
      name: 'notifyAutoScheduleUpdateOnConnect',
      join: (connection, room) => {
        ActionHero.api.autoSchedule.sendScheduleUpdate('red', 0)
        ActionHero.api.autoSchedule.sendScheduleUpdate('blue', 0)
        ActionHero.api.autoSchedule.sendScheduleUpdate('white', 0)
      }
    })

    ActionHero.api.autoSchedule.setSchedule = async (channel, schedule, changedBy) => {
      ActionHero.api.autoSchedule.calculators[channel].setSchedule(ActionHero.api.autoSchedule.translators[channel].translateScheduleToNative(schedule), changedBy)
    }

    ActionHero.api.autoSchedule.sendScheduleUpdate = async (channel, changedBy, newSchedule) => {
      const schedule = ActionHero.api.autoSchedule.translators[channel]
        .translateScheduleToPercent(newSchedule || ActionHero.api.autoSchedule.calculators[channel].schedule)
        .toArray()
      await ActionHero.api.chatRoom.broadcast(
        {},
        'defaultRoom',
        JSON.stringify({
          type: 'notifyAutoScheduleChange',
          channel: channel,
          schedule: schedule,
          changedBy: changedBy
        }))
    }

    Enumerable.from(ActionHero.api.autoSchedule.calculators)
      .select(pair => pair.value)
      .forEach(calculator => {
        calculator.addOnScheduleChangeListener((channel, schedule, changedBy) =>
          ActionHero.api.autoSchedule.sendScheduleUpdate(channel, changedBy, schedule))
        calculator.addOnIntensityChangeListener((channel, intensity, changedBy) => {
          const newIntensity = ActionHero.api.autoSchedule.translators[channel].translateNativeValueToPercentage(intensity)
          ActionHero.api.colourChannels.setIntensity(channel, newIntensity, changedBy)
        })
        calculator.addNextIntensityChangeTimeListener(async (channel, nextIntensityChangeTime) => {
          lock.acquire('scheduleTask', async function (done) {
            ActionHero.api.log('Scheduling task for ' + channel + ' in ' + (nextIntensityChangeTime - (new Date().getTime()) + 'ms'))
            await ActionHero.api.tasks.delDelayed('high', 'triggerAutoScheduleIntensityChange', { channel: channel })
            await ActionHero.api.tasks.enqueueAt(nextIntensityChangeTime, 'triggerAutoScheduleIntensityChange', { channel: channel }, 'high')
            done()
          }, function (err, ret) {
          }, {})
        })
      })
  }

  async start () {
    await ActionHero.api.autoSchedule.setSchedule('red', [
      {
        timeMs: parseTimeToMs('08:00:00'),
        intensity: 0
      },
      {
        timeMs: parseTimeToMs('08:30:00'),
        intensity: 0.2
      },
      {
        timeMs: parseTimeToMs('09:00:00'),
        intensity: 0.05
      }
    ], 0)
    await ActionHero.api.autoSchedule.setSchedule('blue', [
      {
        timeMs: parseTimeToMs('09:00:00'),
        intensity: 0.1
      },
      {
        timeMs: parseTimeToMs('10:00:00'),
        intensity: 0.5
      },
      {
        timeMs: parseTimeToMs('20:00:00'),
        intensity: 0.5
      },
      {
        timeMs: parseTimeToMs('20:30:00'),
        intensity: 0.09
      },
    ], 0)
    await ActionHero.api.autoSchedule.setSchedule('white', [
      {
        timeMs: parseTimeToMs('08:45:00'),
        intensity: 0
      },
      {
        timeMs: parseTimeToMs('10:00:00'),
        intensity: 1
      },
      {
        timeMs: parseTimeToMs('20:00:00'),
        intensity: 1
      },
      {
        timeMs: parseTimeToMs('21:00:00'),
        intensity: 0
      }
    ], 0)
  }

  async stop () {}
}
