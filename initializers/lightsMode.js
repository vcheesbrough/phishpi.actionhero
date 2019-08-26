'use strict'
const ActionHero = require('actionhero')
const EventEmitter = require('events')

module.exports = class LightsModeInitialiser extends ActionHero.Initializer {
  constructor () {
    super()
    this.name = 'lightsMode'
    this.loadPriority = 1000
    this.startPriority = 1000
    this.stopPriority = 1000
    this._eventEmitter = new EventEmitter()
  }

  async initialize () {
    ActionHero.api.lightsMode = {
      currentMode: 'auto'
    }

    ActionHero.api.chatRoom.addMiddleware({
      name: 'sendModeNotificationOnConnect',
      join: (connection, room) => {
        ActionHero.api.lightsMode.sendModeNotification(ActionHero.api.lightsMode.currentMode)
      }
    })

    ActionHero.api.lightsMode.setMode = async (newMode) => {
      if (ActionHero.api.lightsMode.currentMode !== newMode) {
        ActionHero.api.lightsMode.currentMode = newMode
        this._eventEmitter.emit('lightsmodechange', newMode)
        await ActionHero.api.lightsMode.sendModeNotification(newMode)
      }
    }

    ActionHero.api.lightsMode.sendModeNotification = async (newMode) => {
      await ActionHero.api.chatRoom.broadcast(
        {},
        'defaultRoom',
        JSON.stringify({
          type: 'notifyLightsMode',
          mode: newMode
        }))
    }

    ActionHero.api.lightsMode.addLightsModeChangeListener = async (listener) => {
      this._eventEmitter.addListener('lightsmodechange', listener)
    }
  }

  async start () {}

  async stop () {}
}
