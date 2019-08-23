'use strict'

import { AutoScheduleChannel } from './auto-schedule-channel.js'
import { AutoScheduleAxis } from './auto-schedule-axix.js'
import { AutoScheduleMouseController } from './auto-schedule-mouse-controller.js'

export function registerAutoTimeCanvas (client, containingElement) {
  const chartAreaDimensions = {
    topGutter: 20,
    bottomGutter:  50,
    rightGutter:  20,
    leftGutter: 80
  }

  const channels = {}

  Enumerable.from(['red', 'blue', 'white'])
    .forEach(channelName => {
      channels[channelName] = new AutoScheduleChannel(channelName, containingElement, chartAreaDimensions)
    })

  const axis = new AutoScheduleAxis(containingElement,chartAreaDimensions)

  const mouseController = new AutoScheduleMouseController(containingElement,axis, Enumerable.from(channels).select(pair => pair.value))

  client.on('say', function (data) {
    const messageObj = JSON.parse(data.message)
    if (messageObj.type === 'notifyAutoScheduleChange') {
      console.info('Received auto schedule update',messageObj)
      Enumerable.from(messageObj.schedule)
        .groupBy(element => element.channel)
        .forEach(oneChannelSchedule => {
          channels[oneChannelSchedule.key()].schedule = oneChannelSchedule
        })
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

