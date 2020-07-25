'use strict'
const ActionHero = require('actionhero')

module.exports = class TriggerTimeUpdateTask extends ActionHero.Task {
  constructor () {
    super()
    this.name = 'triggerTimeUpdate'
    this.description = 'an actionhero task'
    this.frequency = 0
    this.queue = 'low'
    this.middleware = []
  }

  async run (data) {
    await TriggerTimeUpdateTask.sendTimeUpdate()
  }

  static async sendTimeUpdate () {
    await ActionHero.api.chatRoom.broadcast(
      {},
      'defaultRoom',
      JSON.stringify({
        type: 'notifyTime',
        currentTimeUtc: new Date().getTime()
      }))
  }
}
