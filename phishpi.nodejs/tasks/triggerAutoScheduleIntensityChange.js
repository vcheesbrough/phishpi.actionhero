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
    if (ActionHero.api.lightsMode.currentMode === 'auto') {
      ActionHero.api.autoSchedule.calculators[data.channel].checkAndTriggerIntensityEvent(0)
    }
  }
}
