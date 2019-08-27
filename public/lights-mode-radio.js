'use strict'
export const registerOnLightsModeChange = (client, listener) => {
  client.on('say', function (data) {
    const messageObj = JSON.parse(data.message)
    if (messageObj.type === 'notifyLightsMode') {
      listener(messageObj.mode)
    }
  })
}

export const registerLightsModeRadioButton = (client, inputElement) => {
  inputElement.disabled = false
  client.on('disconnected', () => inputElement.disabled = true)
  client.on('connected', () => inputElement.disabled = false)

  registerOnLightsModeChange(client, newMode => {
    inputElement.checked = newMode === inputElement.value
  })

  inputElement.addEventListener('input', (event) => {
    client.action('setLightsMode', { mode: inputElement.value })
  })
}

