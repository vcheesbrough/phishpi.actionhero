'use strict'
const ActionHero = require('actionhero')

module.exports = class SetLightsModeAction extends ActionHero.Action {
  constructor () {
    super()
    this.name = 'setLightsMode'
    this.description = 'Sets the lights to auto/manual/off'
    this.outputExample = {}
    this.inputs = {
      mode: {
        required: true,
        validator: (param, connection, actionTemplate) => {
          if (!['off', 'auto', 'manual'].includes(param)) {
            throw new Error('channel not one of off,auto,manual')
          }
        }
      }
    }
  }

  async run (data) {
    await ActionHero.api.lightsMode.setMode(data.params.mode)
  }
}
