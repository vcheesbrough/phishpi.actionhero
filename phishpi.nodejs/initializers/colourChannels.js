'use strict'
const ActionHero = require('actionhero')
const Enumerable = require('linq/linq.js')

module.exports = class ColourChannelInitialiser extends ActionHero.Initializer {
  constructor () {
    super()
    this.name = 'colourChannels'
    this.loadPriority = 1001
    this.startPriority = 1001
    this.stopPriority = 1000
  }

  async initialize () {
    ActionHero.api.colourChannels = {
      channelValues: { red: 0, white: 0, blue: 0 }
    }

    ActionHero.api.chatRoom.addMiddleware({
      name: 'sendChannelIntensityOnConnect',
      join: (connection, room) => {
        for (const channel in ActionHero.api.colourChannels.channelValues) {
          ActionHero.api.colourChannels.sendIntensityUpdate(channel, ActionHero.api.colourChannels.channelValues[channel], 0)
        }
      }
    })

    ActionHero.api.colourChannels.setIntensity = async (channel, intensity, changedBy) => {
      if (ActionHero.api.colourChannels.channelValues[channel] !== intensity) {
        ActionHero.api.colourChannels.channelValues[channel] = intensity
        await ActionHero.api.colourChannels.sendIntensityUpdate(channel, intensity, changedBy)
      }
    }

    ActionHero.api.colourChannels.sendIntensityUpdate = async (channel, intensity, changedBy) => {
      ActionHero.api.log('sending channel intensity update: ' + channel, 'debug', {})
      await ActionHero.api.chatRoom.broadcast(
        {},
        'defaultRoom',
        JSON.stringify({
          type: 'notifyChannelIntensity',
          channel: channel,
          intensity: intensity,
          changedBy: changedBy
        }))
    }
    await ActionHero.api.lightsMode.addLightsModeChangeListener(newMode => {
      if (newMode === 'off') {
        Enumerable.from(ActionHero.api.colourChannels.channelValues)
          .select(pair => pair.key)
          .forEach(channel => ActionHero.api.colourChannels.setIntensity(channel, 0, 0))
      }
    })
  }

  async start () {
  }

  async stop () {

  }
}
