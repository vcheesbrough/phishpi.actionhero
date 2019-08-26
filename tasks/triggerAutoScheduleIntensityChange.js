'use strict'
const ActionHero = require('actionhero')

module.exports = class TriggerAutoScheduleIntensityChangeTask extends ActionHero.Task {
  constructor () {
    super()
    this.name = 'triggerAutoScheduleIntensityChange'
    this.description = 'an actionhero task'
    this.frequency = 0
    this.queue = 'default'
    this.middleware = []
  }

  async run (data) {
    ActionHero.api.log('Triggering ' + data.channel)
    ActionHero.api.autoSchedule.calculators[data.channel].checkAndTriggerIntensityEvent(0)
    return true
  }
}
