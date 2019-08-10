'use strict'
const ActionHero = require('actionhero')

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
    this.loadPriority = 1000
    this.startPriority = 1000
    this.stopPriority = 1000
  }

  async initialize () {
    ActionHero.api.autoSchedule = {
      schedule: [
        {
          channel: 'red',
          timeMs: parseTimeToMs('08:00:00'),
          intensity: 0
        },
        {
          channel: 'red',
          timeMs: parseTimeToMs('08:30:00'),
          intensity: 0.2
        },
        {
          channel: 'red',
          timeMs: parseTimeToMs('09:00:00'),
          intensity: 0.0
        },
        {
          channel: 'blue',
          timeMs: parseTimeToMs('09:00:00'),
          intensity: 0.1
        },
        {
          channel: 'blue',
          timeMs: parseTimeToMs('10:00:00'),
          intensity: 0.5
        },
        {
          channel: 'blue',
          timeMs: parseTimeToMs('20:00:00'),
          intensity: 0.5
        },
        {
          channel: 'blue',
          timeMs: parseTimeToMs('20:30:00'),
          intensity: 0.1
        },
        {
          channel: 'white',
          timeMs: parseTimeToMs('08:45:00'),
          intensity: 0
        },
        {
          channel: 'white',
          timeMs: parseTimeToMs('10:00:00'),
          intensity: 1
        },
        {
          channel: 'white',
          timeMs: parseTimeToMs('20:00:00'),
          intensity: 1
        },
        {
          channel: 'white',
          timeMs: parseTimeToMs('21:00:00'),
          intensity: 0
        }
      ]
    }

    ActionHero.api.chatRoom.addMiddleware({
      name: 'notifyAutoScheduleUpdateOnConnect',
      join: (connection, room) => {
        ActionHero.api.autoSchedule.sendScheduleUpdate(ActionHero.api.autoSchedule.schedule, 0)
      }
    })

    ActionHero.api.autoSchedule.sendScheduleUpdate = async (schedule, changedBy) => {
      await ActionHero.api.chatRoom.broadcast(
        {},
        'defaultRoom',
        JSON.stringify({
          type: 'notifyAutoScheduleChange',
          schedule: schedule,
          changedBy: 0
        }))
    }
  }

  async start () {}

  async stop () {}
}
