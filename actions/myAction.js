'use strict'
const ActionHero = require('actionhero')

module.exports = class MyAction extends ActionHero.Action {
  constructor () {
    super()
    this.name = 'myAction'
    this.description = 'an actionhero action'
    this.outputExample = {randomNumber: 0.1234}
  }

  async run (data) {
    data.response.randomNumber = Math.random()
  }
}
