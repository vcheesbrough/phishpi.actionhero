'use strict'

import { debounce } from './debounce.js'

export function registerColourChannelInput (client, sliderElement, debounceDelay, colourChannel) {
  sliderElement.disabled = false
  client.on('disconnected', () => sliderElement.disabled = true)
  client.on('connected', () => sliderElement.disabled = false)

  client.on('say', function (data) {
    const messageObj = JSON.parse(data.message)
    if (messageObj.type === 'notifyChannelIntensity') {
      if (messageObj.channel === colourChannel) {
        console.log('Received channel update ',messageObj)
        sliderElement.value = messageObj.intensity
      }
    }
  })

  return sliderElement.addEventListener('input', (event) => {
    const setColourChannelParams = { channel: colourChannel, intensity: event.srcElement.value }
    debounce(() => client.action('setColourChannel', setColourChannelParams), debounceDelay)
  })
}
