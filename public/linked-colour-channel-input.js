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
        sliderElement.value = Math.round(messageObj.intensity * 100.0)
      }
    }
  })

  return sliderElement.addEventListener('input', (event) => {
    const setColourChannelParams = { channel: colourChannel, intensity: event.srcElement.value/100.0 }
    debounce(() => client.action('setColourChannel', setColourChannelParams), debounceDelay)
  })
}

export function registerColourChannelDisplay(client, element, colourChannel) {
  client.on('say', function (data) {
    const messageObj = JSON.parse(data.message)
    if (messageObj.type === 'notifyChannelIntensity') {
      if (messageObj.channel === colourChannel) {
        console.log('Received channel update ',messageObj)
        element.innerHTML = Math.round(messageObj.intensity * 100.0) + '%'
      }
    }
  })
}
