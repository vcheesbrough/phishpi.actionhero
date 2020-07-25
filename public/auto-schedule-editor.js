'use strict'

import { AutoScheduleChannel } from './auto-schedule-channel.js'
import { AutoScheduleAxis } from './auto-schedule-axix.js'
import { AutoScheduleMouseController } from './auto-schedule-mouse-controller.js'
import { debounce } from './debounce.js'

export function registerAutoTimeCanvas (client, containingElement, debounceDelay) {
  const chartAreaDimensions = {
    topGutter: 10,
    bottomGutter:  50,
    rightGutter: 0,
    leftGutter: 80
  }

  const channels = {}

  Enumerable.from(['red', 'blue', 'white'])
    .forEach(channelName => {
      channels[channelName] = new AutoScheduleChannel(channelName, containingElement, chartAreaDimensions)
      channels[channelName].addScheduleChangeListener((channel,schedule) => {
          debounce(() => client.action('setSchedule', {
            channel: channel,
            schedule: schedule.toArray()
          }), debounceDelay)
      })
    })

  const axis = new AutoScheduleAxis(containingElement,chartAreaDimensions)

  const mouseController = new AutoScheduleMouseController(
    containingElement,
    axis,
    Enumerable.from(channels).select(pair => pair.value),
    chartAreaDimensions)

  client.on('say', function (data) {
    const messageObj = JSON.parse(data.message)
    if (messageObj.type === 'notifyAutoScheduleChange') {
      channels[messageObj.channel].setSchedule(Enumerable.from(messageObj.schedule)
        .orderBy(scheduleElement => scheduleElement.timeMs),false)
    }
  })

  const onResize = () => {
    axis.onResize()
    Enumerable.from(channels)
      .forEach(pair => pair.value.onResize())
  }

  // noinspection ES6ModulesDependencies,JSUnresolvedFunction
  new ResizeObserver(() => {
    onResize()
  }).observe(containingElement)

  onResize()

}

