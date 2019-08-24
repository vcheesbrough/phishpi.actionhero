'use strict'
const ActionHero = require('actionhero')

module.exports = class SetColourChannelAction extends ActionHero.Action {
  constructor () {
    super()
    this.name = 'setColourChannel'
    this.description = 'set a colour channel value'
    this.outputExample = {}
    this.inputs = {
      channel: {
        required: true,
        validator: (param, connection, actionTemplate) => {
          const allColours = Object.keys(ActionHero.api.colourChannels.channelValues)
          if (!allColours.includes(param)) {
            throw new Error('channel not one of ' + allColours.join(','))
          }
        }
      },
      intensity: {
        required: true,
        formatter: (param, connection, actionTemplate) => {
          return parseFloat(param)
        },
        validator: (param, connection, actionTemplate) => {
          if (param < 0.0 || param > 1.0) {
            throw new Error('intensity is not 0.0 - 1.0')
          }
        }
      }
    }
  }

  async run (data) {
    await ActionHero.api.colourChannels.setIntensity(data.params.channel, data.params.intensity, data.connection.id)
    data.response.intensity = data.intensity
    data.response.channel = data.channel
    data.response.changedBy = data.connection.id
  }
}
