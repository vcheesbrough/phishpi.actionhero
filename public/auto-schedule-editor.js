'use strict'

import { AutoScheduleChannel } from './auto-schedule-channel.js'
import { AutoScheduleAxis } from './auto-schedule-axix.js'

export function registerAutoTimeCanvas (client, containingElement) {
  const chartAreaDimensions = {
    topGutter: 20,
    bottomGutter:  50,
    rightGutter:  20,
    leftGutter: 80
  }
  const mouseFudgeFactor = 10

  const channels = {}

  Enumerable.from(['red', 'blue', 'white'])
    .forEach(channelName => {
      channels[channelName] = new AutoScheduleChannel(channelName, containingElement, chartAreaDimensions)
    })

  const axis = new AutoScheduleAxis(containingElement,chartAreaDimensions)

  containingElement.addEventListener('mousemove', (event) => {
    updateMousePosition(axis.convertMouseEventCoordinates(event))
  })
  containingElement.addEventListener('mouseleave', () => {
    updateMousePosition()
  })

  function isEquivalent(a, b) {
    if(a && b)
    {
      const aProps = Object.getOwnPropertyNames(a)
      const bProps = Object.getOwnPropertyNames(b)

      if (aProps.length !== bProps.length) {
        return false;
      }

      for (let i = 0; i < aProps.length; i++) {
        const propName = aProps[i]

        if (a[propName] !== b[propName]) {
          return false;
        }
      }

      return true;
    }
    return a === b
  }

  let lastMouseCoordinate

  const updateMousePosition = (coordinate) => {
    if(coordinate === undefined) {
      lastMouseCoordinate = undefined
      window.requestAnimationFrame(() => {
        const ctx = axis.mouseCanvas.getContext('2d')
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)
        Enumerable.from(channels)
          .forEach(pair => {
            pair.value.highlighted = false
          })
      })
      return
    }

    if(! isEquivalent(lastMouseCoordinate, coordinate) || lastMouseCoordinate === undefined) {
      window.requestAnimationFrame(() => {

        const firstMatchingNode = Enumerable.from(channels)
          .selectMany(pair => pair.value.nodes)
          .firstOrDefault(channelNode => {
            if(channelNode.coordinate.x - mouseFudgeFactor <= coordinate.x && channelNode.coordinate.x + mouseFudgeFactor >= coordinate.x) {
              if(channelNode.coordinate.y - mouseFudgeFactor <= coordinate.y && channelNode.coordinate.y + mouseFudgeFactor >= coordinate.y) {
                return true;
              }
            }
            return false;
          })

        const stickyCoordinate = firstMatchingNode ? firstMatchingNode.coordinate : coordinate
        const intensity = firstMatchingNode ? firstMatchingNode.schedulePoint.intensity : undefined
        const timeMs = firstMatchingNode ? firstMatchingNode.schedulePoint.timeMs : undefined

        axis.drawMouseTicks(stickyCoordinate, intensity, timeMs)
        Enumerable.from(channels)
          .forEach(pair => {
            pair.value.highlighted = firstMatchingNode && firstMatchingNode.schedulePoint.channel === pair.key
          })
      })
    }
    lastMouseCoordinate = coordinate
  }

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

