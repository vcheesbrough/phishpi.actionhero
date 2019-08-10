'use strict'

export function registerColourChannelInput (client, sliderElement, debounceDelay, colourChannel) {
  sliderElement.disabled = false
  client.on('disconnected', () => sliderElement.disabled = true)
  client.on('connected', () => sliderElement.disabled = false)

  client.on('say', function (data) {
    const messageObj = JSON.parse(data.message)
    if (messageObj.type === 'notifyChannelIntensity') {
      if (messageObj.channel === colourChannel) {
        console.log('Received channel update ' + data.message)
        sliderElement.value = messageObj.intensity
      }
    }
  })
  let timeout
  let lastSetColourChannelParams

  const doSetColourChannel = (setColourChannelParams) => {
    if (lastSetColourChannelParams !== setColourChannelParams) {
      lastSetColourChannelParams = setColourChannelParams
      client.action('setColourChannel', setColourChannelParams)
    }
  }
  let timerColourChannelParams
  const debounceSetColourChannel = function (setColourChannelParams, debounceTime) {
    timerColourChannelParams = setColourChannelParams
    if (timeout === undefined) {
      doSetColourChannel(timerColourChannelParams)
      timeout = setTimeout(() => {
        doSetColourChannel(timerColourChannelParams)
        timeout = undefined
      }, debounceTime)
    }
  }

  return sliderElement.addEventListener('input', (event) => {
    const setColourChannelParams = { channel: colourChannel, intensity: event.srcElement.value }
    debounceSetColourChannel(setColourChannelParams, debounceDelay)
  })
}
