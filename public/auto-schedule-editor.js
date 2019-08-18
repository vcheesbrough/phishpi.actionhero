'use strict'

export function registerAutoTimeCanvas (client, containingElement) {
  const topGutter = 20
  const bottomGutter = 50
  const rightGutter = 20
  const leftGutter = 80
  const nodeRadius = 5
  const mouseAxisTickLength = 20
  const mouseAxisTickWidth = 10
  const mouseAxisTickColour = '#abaaaa'
  const mouseAxisTextColour = '#6a6a6a'
  const mouseAxisTextFont = '20px sans-serif'
  const mouseFudgeFactor = nodeRadius + 10
  const nodeFillColour = 'white'
  const highlightBlurLevel = 10
  const highlightBlueColour = 'gray'
  const colourLookup = {
    red: '#ff0000',
    blue: '#0008ff',
    white: '#000000'
  }
  const axisColour = '#d9d9d9'

  const createCanvas = (canvasId, zIndex) => {
    const canvas = document.createElement("canvas");
    canvas.id = canvasId;
    canvas.style.position = 'absolute'
    canvas.style.zIndex = zIndex
    canvas.style.width = containingElement.clientWidth
    canvas.style.height = containingElement.clientHeight
    canvas.style.left = containingElement.clientX
    canvas.style.top = containingElement.clientY
    containingElement.appendChild(canvas);
    return canvas
  }

  const resizeCanvas = (canvas) => {
    canvas.width = containingElement.clientWidth
    canvas.height = containingElement.clientHeight
  }

  const channelData = {}

  Enumerable.from(['red', 'blue', 'white'])
    .select((channel, index) =>
      ({
        channel: channel,
        canvas: createCanvas(channel+'Canvas', 30),
        highlighted: false
      })
    )
    .forEach(element => channelData[element.channel] = element)

  const axisCanvas = createCanvas('axisCanvas',2)
  const mouseCanvas = createCanvas('mouseCanvas',1)

  const convertMouseEventCoordinates = (event) => {
    let x = event.offsetX
    if(x < leftGutter) {
      x = leftGutter
    }
    if(x > mouseCanvas.clientWidth - rightGutter)
    {
      x = mouseCanvas.clientWidth - rightGutter
    }
    let y = event.offsetY
    if(y < topGutter) {
      y = topGutter
    }
    if(y > mouseCanvas.clientHeight - bottomGutter) {
      y = mouseCanvas.clientHeight - bottomGutter
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
    ctx.moveTo(mouseCoordinate.x - mouseAxisTickWidth/2, ctx.canvas.clientHeight - bottomGutter + mouseAxisTickLength)
    ctx.lineTo(mouseCoordinate.x, ctx.canvas.clientHeight - bottomGutter)
    ctx.lineTo(mouseCoordinate.x + mouseAxisTickWidth/2, ctx.canvas.clientHeight - bottomGutter + mouseAxisTickLength)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(leftGutter - mouseAxisTickLength, mouseCoordinate.y - mouseAxisTickWidth/2)
    ctx.lineTo(leftGutter, mouseCoordinate.y)
    ctx.lineTo(leftGutter - mouseAxisTickLength, mouseCoordinate.y + mouseAxisTickWidth/2)
    ctx.closePath()
    ctx.fill()

    ctx.font = mouseAxisTextFont
    ctx.fillStyle = mouseAxisTextColour

    ctx.textBaseline = 'top'
    ctx.textAlign = 'center'
    const date = new Date(timeMs || translateXToTimeMs(ctx,mouseCoordinate.x))
    // noinspection JSUnresolvedVariable,JSUnresolvedFunction
    ctx.fillText(moment.utc(date).format('HH:mm'),mouseCoordinate.x, ctx.canvas.clientHeight - bottomGutter + mouseAxisTickLength + 5)

    ctx.textBaseline = 'middle'
    ctx.textAlign = 'right'
    ctx.fillText(''+Math.round((intensity || translateYToIntensity(ctx, mouseCoordinate.y))*100)+'%', leftGutter - mouseAxisTickLength - 5,mouseCoordinate.y)
  }

  function isEquivalent(a, b) {
    if(a && b)
    {
      const aProps = Object.getOwnPropertyNames(a)
      const bProps = Object.getOwnPropertyNames(b)

      if (aProps.length != bProps.length) {
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
        Enumerable.from(channelData)
          .forEach(pair => {
            pair.value.highlighted = false
          })
        drawAllChannels()
      })
      return
    }

    if(! isEquivalent(lastMouseCoordinate, coordinate) || lastMouseCoordinate === undefined) {
      window.requestAnimationFrame(() => {

        const firstMatchingNode = Enumerable.from(channelData)
          .selectMany(pair => pair.value.nodes)
          .firstOrDefault(channelNode => {
            if(channelNode.coordinate.x - mouseFudgeFactor <= coordinate.x && channelNode.coordinate.x + mouseFudgeFactor >= coordinate.x) {
              if(channelNode.coordinate.y - mouseFudgeFactor <= coordinate.y && channelNode.coordinate.y + mouseFudgeFactor >= coordinate.y) {
                return true;
              }
            }
            return false;
          })

        const stickyCoordinate = firstMatchingNode ? {x: firstMatchingNode.x, y: firstMatchingNode.y} : coordinate
        const intensity = firstMatchingNode ? firstMatchingNode.schedulePoint.intensity : undefined
        const timeMs = firstMatchingNode ? firstMatchingNode.schedulePoint.timeMs : undefined

        drawMouseTicks(mouseCanvas.getContext('2d'), stickyCoordinate, intensity, timeMs)
        Enumerable.from(channelData)
          .forEach(pair => {
            pair.value.highlighted = firstMatchingNode && firstMatchingNode.schedulePoint.channel == pair.key
          })
        drawAllChannels()
      })
    }
    lastMouseCoordinate = coordinate
  }


  const drawAllChannels = () => {
    if(currentSchedule)
    {
      Enumerable.from(channelData)
        .forEach(pair => {
          renderSingleChannelSchedule(pair.key)
        })
    }
  }

  const translateXToTimeMs = (ctx, x) => {
    const ratio = 86400000.0 / (ctx.canvas.clientWidth - rightGutter - leftGutter)
    return Math.floor((x-leftGutter) * ratio)
  }

  const translateTimeMsToX = (ctx, timeMs) => {
    const ratio = 86400000.0 / (ctx.canvas.clientWidth - rightGutter - leftGutter)
    return Math.floor(leftGutter + (timeMs / ratio))
  }

  const translateYToIntensity = (ctx, y) => {
    const ratio = 1.0 / (ctx.canvas.clientHeight - topGutter - bottomGutter)
    return 1.0 - ((y-topGutter) * ratio)
  }

  const translateIntensityToY = (ctx, intensity) => {
    const ratio = 1.0 / (ctx.canvas.clientHeight - topGutter - bottomGutter)
    return Math.floor(ctx.canvas.clientHeight - ((intensity / ratio) + bottomGutter))
  }

  const updateAllChannelCoordinates = () => {
    if(currentSchedule) {
      Enumerable.from(currentSchedule)
        .groupBy(element => element.channel)
        .forEach(channelValues => {
          const ctx = channelData[channelValues.key()].canvas.getContext('2d')
          channelData[channelValues.key()].nodes = channelValues
            .orderBy(schedulePoint => schedulePoint.timeMs)
            .select(schedulePoint => ({
              coordinate: {
                x:translateTimeMsToX(ctx, schedulePoint.timeMs),
                y:translateIntensityToY(ctx, schedulePoint.intensity)
              },
              schedulePoint
            }))
            .toArray()
        })
    }
  }

  const renderSingleChannelSchedule = function (channel) {
    const nodes = channelData[channel].nodes
    const ctx = channelData[channel].canvas.getContext('2d')

    channelData[channel].canvas.style.zIndex = channelData[channel].highlighted ? '35' : '30'
    ctx.shadowBlur = channelData[channel].highlighted ? highlightBlurLevel : 0
    ctx.shadowColor = highlightBlueColour

    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)
    ctx.beginPath()
    ctx.strokeStyle = colourLookup[(channel)]

    const firstNode = nodes[0]
    const lastNode = nodes[nodes.length-1]
    const midnightCrossingDeltaTimeMs = firstNode.schedulePoint.timeMs - (0 - lastNode.schedulePoint.timeMs)
    const midnightCrossingDeltaIntensity = firstNode.schedulePoint.intensity - lastNode.schedulePoint.intensity
    const midnightCrossingSlopRatio = midnightCrossingDeltaIntensity / midnightCrossingDeltaTimeMs

    ctx.moveTo(
      translateTimeMsToX(ctx, 0),
      translateIntensityToY(ctx, firstNode.schedulePoint.intensity - ((firstNode.schedulePoint.timeMs) * midnightCrossingSlopRatio)))

    const coordinates = Enumerable.from(nodes)
      .select(node => node.coordinate)
    coordinates
      .concat([({
        x: translateTimeMsToX(ctx, 86400000),
        y: translateIntensityToY(ctx, lastNode.schedulePoint.intensity + lastNode.schedulePoint.timeMs * midnightCrossingSlopRatio)
      })])
      .forEach(coordinate => {
        ctx.lineTo(coordinate.x, coordinate.y)
      })
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = channelData[channel].highlighted ? colourLookup[(channel)] : nodeFillColour
    coordinates.forEach(coordinate => {
      ctx.beginPath()
      ctx.arc(coordinate.x, coordinate.y, nodeRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })
  }

  let currentSchedule

  const drawAxis = () => {
    const ctx = axisCanvas.getContext('2d')
    ctx.lineWidth = 1
    ctx.strokeStyle = axisColour
    ctx.strokeRect(leftGutter, topGutter, ctx.canvas.clientWidth - rightGutter - leftGutter, ctx.canvas.clientHeight - bottomGutter - topGutter)
    Enumerable.range(0, 25, 60 * 60 * 1000)
      .forEach(timeMs => {
        ctx.beginPath()
        const x = translateTimeMsToX(ctx, timeMs)
        const y = translateIntensityToY(ctx, 0)
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + 10)
        ctx.stroke()
      })
  }

  client.on('say', function (data) {
    const messageObj = JSON.parse(data.message)
    if (messageObj.type === 'notifyAutoScheduleChange') {
      console.info('Received auto schedule update',messageObj)
      currentSchedule = messageObj.schedule
      updateAllChannelCoordinates()
      drawAllChannels()
    }
  })

  const onResize = () => {
    resizeCanvas(axisCanvas)
    resizeCanvas(mouseCanvas)
    Enumerable.from(channelData).forEach(pair => {
      resizeCanvas(pair.value.canvas)
    })
    drawAxis()
    updateAllChannelCoordinates()
    drawAllChannels()
  }

  // noinspection ES6ModulesDependencies,JSUnresolvedFunction
  new ResizeObserver(() => {
    onResize()
  }).observe(containingElement)

  onResize()

}
