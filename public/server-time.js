'use strict'

let lastServerTime = undefined

export const registerServerTimeDisplay = (client, element) => {
  client.on('disconnected', function () {
    element.style.color = 'red'
  })
  client.on('connected', function () {
    element.style.color = 'white'
  })

  const applyServerTimeToElement = (el) => {
    el.innerHTML = lastServerTime ? moment.utc(new Date(lastServerTime)).format('HH:mm') : '??:??'
  }

  addServerTimeChangeListener(() => {
    applyServerTimeToElement(element)
  })
  applyServerTimeToElement(element)
}

export const getLastServerTime = () => {
  return lastServerTime
}

export const addServerTimeChangeListener = (listener) => {
  document.addEventListener('servertimechange', customEvent => {
    listener(customEvent.detail.currentServerTimeUtc)
  })
}

export const connect = (client) => {
  client.on('say', function (data) {
    const messageObj = JSON.parse(data.message)
    if (messageObj.type === 'notifyTime') {
      lastServerTime = messageObj.currentTimeUtc
      document.dispatchEvent(new CustomEvent('servertimechange', {
        detail: {
          currentServerTimeUtc: messageObj.currentTimeUtc,
        }
      }))
    }
  })
}