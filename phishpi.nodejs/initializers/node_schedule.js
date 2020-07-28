'use strict'
const ActionHero = require('actionhero')
const schedule = require('node-schedule')
const Enumerable = require('linq/linq.js')
const TriggerTimeUpdateTask = require('../tasks/triggerTimeUpdate')

module.exports = class Scheduler extends ActionHero.Initializer {
  constructor () {
    super()
    this.name = 'node_schedule'
    this.loadPriority = 1000
    this.startPriority = 1000
    this.stopPriority = 1000
  }

  async initialize () {
    ActionHero.api['node_schedule'] = {
      scheduledJobs: {}
    }
    ActionHero.api.chatRoom.addMiddleware({
      name: 'node_schedule',
      join: (connection, room) => {
        TriggerTimeUpdateTask.sendTimeUpdate()
      }
    })
  }

  async start () {
    const job = schedule.scheduleJob('0 * * * * *', async () => {
      if (ActionHero.api.resque.scheduler && ActionHero.api.resque.scheduler.master) {
        await ActionHero.api.tasks.enqueue('triggerTimeUpdate', {}, 'default')
      }
    })

    ActionHero.api.node_schedule.scheduledJobs['triggerTimeUpdate'] = job
  }

  async stop () {
    Enumerable.from(ActionHero.api.node_schedule.scheduledJobs)
      .forEach(pair => { pair.value.cancel() })
  }
}
