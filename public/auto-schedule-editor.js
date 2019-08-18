'use strict'

export function registerAutoTimeCanvas (client, containingElement) {
  const topGutter = 20
  const bottomGutter = 50
  const rightGutter = 20
  const leftGutter = 80
  const mouseAxisTickLength = 20
  const mouseAxisTickWidth = 10
  const mouseAxisTickColour = '#abaaaa'
  const mouseAxisTextColour = '#6a6a6a'
  const mouseAxisTextFont = '20px sans-serif'
  const mouseFudgeFactor = 10
  const axisColour = '#d9d9d9'

  const createCanvasAndAddToContainingElement = (canvasId, zIndex) => {
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

  class Channel {
    #name
    #canvas
    #highlighted = false
    #nodes
    #schedule
    #needsDraw = true
    static nodeRadius = 5
    static nodeFillColour = 'white'
    static highlightBlurLevel = 10
    static highlightBlueColour = 'gray'
    static colourLookup = {
      red: '#ff0000',
      blue: '#0008ff',
      white: '#000000'
    }

    constructor(channelName) {
      this.#name = channelName
      this.#canvas = createCanvasAndAddToContainingElement(this.#name + 'Canvas', 30)
    }

    get name() {
      return this.#name
    }

    set highlighted(isHighlighted) {
      if(this.#highlighted !== isHighlighted) {
        this.#highlighted = isHighlighted
        this.#needsDraw = true
      }
    }

    get nodes() {
      if(!this.#nodes) {
        const ctx = this.#canvas.getContext('2d')
        this.#needsDraw = true
        this.#nodes = this.#schedule
          .orderBy(scheduleItem => scheduleItem.timeMs)
          .select(scheduleItem => ({
            coordinate: {
              x:translateTimeMsToX(ctx, scheduleItem.timeMs),
              y:translateIntensityToY(ctx, scheduleItem.intensity)
            },
            schedulePoint: scheduleItem
          }))
          .toArray()
      }
      return this.#nodes
    }

    set schedule(schedule) {
      this.#needsDraw = true
      this.#schedule = schedule
      this.#nodes = undefined
    }

    onResize() {
      this.#needsDraw = true
      resizeCanvas(this.#canvas)
      this.#nodes = undefined
    }

    drawIfNeeded() {
      if(this.#needsDraw && this.#schedule) {
        const ctx = this.#canvas.getContext('2d')

        this.#canvas.style.zIndex = this.#highlighted ? '35' : '30'
        ctx.shadowBlur = this.#highlighted ? Channel.highlightBlurLevel : 0
        ctx.shadowColor = Channel.highlightBlueColour

        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)
        ctx.beginPath()
        ctx.strokeStyle = Channel.colourLookup[(this.#name)]

        const firstNode = this.nodes[0]
        const lastNode = this.nodes[this.nodes.length-1]
        const midnightCrossingDeltaTimeMs = firstNode.schedulePoint.timeMs - (0 - lastNode.schedulePoint.timeMs)
        const midnightCrossingDeltaIntensity = firstNode.schedulePoint.intensity - lastNode.schedulePoint.intensity
        const midnightCrossingSlopRatio = midnightCrossingDeltaIntensity / midnightCrossingDeltaTimeMs

        ctx.moveTo(
          translateTimeMsToX(ctx, 0),
          translateIntensityToY(ctx, firstNode.schedulePoint.intensity - ((firstNode.schedulePoint.timeMs) * midnightCrossingSlopRatio)))

        const coordinates = Enumerable.from(this.nodes)
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

        ctx.fillStyle = this.#highlighted ? Channel.colourLookup[(this.#name)] : Channel.nodeFillColour
        coordinates.forEach(coordinate => {
          ctx.beginPath()
          ctx.arc(coordinate.x, coordinate.y, Channel.nodeRadius, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        })
        this.#needsDraw = false
      }
    }
  }

  const resizeCanvas = (canvas) => {
    canvas.width = containingElement.clientWidth
    canvas.height = containingElement.clientHeight
  }

  const channels = {}

  Enumerable.from(['red', 'blue', 'white'])
    .forEach(channelName => {
      channels[channelName] = new Channel(channelName)
    })

  const axisCanvas = createCanvasAndAddToContainingElement('axisCanvas',2)
  const mouseCanvas = createCanvasAndAddToContainingElement('mouseCanvas',1)

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
        drawAllChannels()
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
        drawAllChannels()
      })
    }
    lastMouseCoordinate = coordinate
  }

  const drawAllChannels = () => {
    Enumerable.from(channels)
      .forEach(pair => {
        pair.value.drawIfNeeded()
      })
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
      Enumerable.from(messageObj.schedule)
        .groupBy(element => element.channel)
        .forEach(oneChannelSchedule => {
          channels[oneChannelSchedule.key()].schedule = oneChannelSchedule
        })
      drawAllChannels()
    }
  })

  const onResize = () => {
    resizeCanvas(axisCanvas)
    resizeCanvas(mouseCanvas)
    Enumerable.from(channels)
      .forEach(pair => pair.value.onResize())
    drawAxis()
    drawAllChannels()
  }

  // noinspection ES6ModulesDependencies,JSUnresolvedFunction
  new ResizeObserver(() => {
    onResize()
  }).observe(containingElement)

  onResize()

}
