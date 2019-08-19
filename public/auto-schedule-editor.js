'use strict'

import * as AutoScheduleUtils from './auto-schedule-utils.js'
import { AutoScheduleChannel } from './auto-schedule-channel.js'

export function registerAutoTimeCanvas (client, containingElement) {
  const chartAreaDimensions = {
    topGutter: 20,
    bottomGutter:  50,
    rightGutter:  20,
    leftGutter: 80
  }
  const mouseAxisTickLength = 20
  const mouseAxisTickWidth = 10
  const mouseAxisTickColour = '#abaaaa'
  const mouseAxisTextColour = '#6a6a6a'
  const mouseAxisTextFont = '20px sans-serif'
  const mouseFudgeFactor = 10
  const axisColour = '#d9d9d9'

  const channels = {}

  Enumerable.from(['red', 'blue', 'white'])
    .forEach(channelName => {
      channels[channelName] = new AutoScheduleChannel(channelName, containingElement, chartAreaDimensions)
    })

  const axisCanvas = AutoScheduleUtils.createCanvasAndAddToContainingElement('axisCanvas',2, containingElement)
  const mouseCanvas = AutoScheduleUtils.createCanvasAndAddToContainingElement('mouseCanvas',1, containingElement)

  const convertMouseEventCoordinates = (event) => {
    let x = event.offsetX
    if(x < chartAreaDimensions.leftGutter) {
      x = chartAreaDimensions.leftGutter
    }
    if(x > mouseCanvas.clientWidth - chartAreaDimensions.rightGutter)
    {
      x = mouseCanvas.clientWidth - chartAreaDimensions.rightGutter
    }
    let y = event.offsetY
    if(y < chartAreaDimensions.topGutter) {
      y = chartAreaDimensions.topGutter
    }
    if(y > mouseCanvas.clientHeight - chartAreaDimensions.bottomGutter) {
      y = mouseCanvas.clientHeight - chartAreaDimensions.bottomGutter
    }
    return {x,y}
  }

  containingElement.addEventListener('mousemove', (event) => {
    updateMousePosition(convertMouseEventCoordinates(event))
  })
  containingElement.addEventListener('mouseleave', () => {
    updateMousePosition()
  })

  const drawMouseTicks = (ctx, mouseCoordinate, intensity, timeMs) =>
  {
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)
    ctx.strokeStyle = mouseAxisTickColour
    ctx.fillStyle = mouseAxisTickColour

    ctx.beginPath()
    ctx.moveTo(mouseCoordinate.x - mouseAxisTickWidth/2, ctx.canvas.clientHeight - chartAreaDimensions.bottomGutter + mouseAxisTickLength)
    ctx.lineTo(mouseCoordinate.x, ctx.canvas.clientHeight - chartAreaDimensions.bottomGutter)
    ctx.lineTo(mouseCoordinate.x + mouseAxisTickWidth/2, ctx.canvas.clientHeight - chartAreaDimensions.bottomGutter + mouseAxisTickLength)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(chartAreaDimensions.leftGutter - mouseAxisTickLength, mouseCoordinate.y - mouseAxisTickWidth/2)
    ctx.lineTo(chartAreaDimensions.leftGutter, mouseCoordinate.y)
    ctx.lineTo(chartAreaDimensions.leftGutter - mouseAxisTickLength, mouseCoordinate.y + mouseAxisTickWidth/2)
    ctx.closePath()
    ctx.fill()

    ctx.font = mouseAxisTextFont
    ctx.fillStyle = mouseAxisTextColour

    ctx.textBaseline = 'top'
    ctx.textAlign = 'center'
    const date = new Date(timeMs || AutoScheduleUtils.translateXToTimeMs(ctx,mouseCoordinate.x,chartAreaDimensions))
    // noinspection JSUnresolvedVariable,JSUnresolvedFunction
    ctx.fillText(moment.utc(date).format('HH:mm'),mouseCoordinate.x, ctx.canvas.clientHeight - chartAreaDimensions.bottomGutter + mouseAxisTickLength + 5)

    ctx.textBaseline = 'middle'
    ctx.textAlign = 'right'
    ctx.fillText(''+Math.round((intensity || AutoScheduleUtils.translateYToIntensity(ctx, mouseCoordinate.y, chartAreaDimensions))*100)+'%', chartAreaDimensions.leftGutter - mouseAxisTickLength - 5,mouseCoordinate.y)
  }

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
        const ctx = mouseCanvas.getContext('2d')
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)
        Enumerable.from(channels)
          .forEach(pair => {
            pair.value.highlighted = false
          })
        drawChannelsThatNeedDrawing()
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

        drawMouseTicks(mouseCanvas.getContext('2d'), stickyCoordinate, intensity, timeMs)
        Enumerable.from(channels)
          .forEach(pair => {
            pair.value.highlighted = firstMatchingNode && firstMatchingNode.schedulePoint.channel === pair.key
          })
        drawChannelsThatNeedDrawing()
      })
    }
    lastMouseCoordinate = coordinate
  }

  const drawChannelsThatNeedDrawing = () => {
    Enumerable.from(channels)
      .forEach(pair => {
        pair.value.drawIfNeeded()
      })
  }

  const drawAxis = () => {
    const ctx = axisCanvas.getContext('2d')
    ctx.lineWidth = 1
    ctx.strokeStyle = axisColour
    ctx.strokeRect(chartAreaDimensions.leftGutter, chartAreaDimensions.topGutter, ctx.canvas.clientWidth - chartAreaDimensions.rightGutter - chartAreaDimensions.leftGutter, ctx.canvas.clientHeight - chartAreaDimensions.bottomGutter - chartAreaDimensions.topGutter)
    Enumerable.range(0, 25, 60 * 60 * 1000)
      .forEach(timeMs => {
        ctx.beginPath()
        const x = AutoScheduleUtils.translateTimeMsToX(ctx, timeMs, chartAreaDimensions)
        const y = AutoScheduleUtils.translateIntensityToY(ctx, 0, chartAreaDimensions)
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + 10)
        ctx.stroke()
      })
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
      drawChannelsThatNeedDrawing()
    }
  })

  const onResize = () => {
    AutoScheduleUtils.resizeCanvasToFitInParent(axisCanvas)
    AutoScheduleUtils.resizeCanvasToFitInParent(mouseCanvas)
    Enumerable.from(channels)
      .forEach(pair => pair.value.onResize())
    drawAxis()
    drawChannelsThatNeedDrawing()
  }

  // noinspection ES6ModulesDependencies,JSUnresolvedFunction
  new ResizeObserver(() => {
    onResize()
  }).observe(containingElement)

  onResize()

}

