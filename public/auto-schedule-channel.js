import * as AutoScheduleUtils from './auto-schedule-utils.js'

export class AutoScheduleChannel {
  #name
  #canvas
  #highlighted = false
  #nodes
  #schedule
  #needsDraw = true
  #dimensions
  static nodeRadius = 5
  static nodeFillColour = 'white'
  static highlightBlurLevel = 10
  static highlightBlueColour = 'gray'
  static colourLookup = {
    red: '#ff0000',
    blue: '#0008ff',
    white: '#000000'
  }

  constructor (channelName, containerElement, dimensions) {
    this.#name = channelName
    this.#dimensions = dimensions
    this.#canvas = AutoScheduleUtils.createCanvasAndAddToContainingElement(this.#name + 'Canvas', 30, containerElement)
  }

  get name () {
    return this.#name
  }

  set highlighted (isHighlighted) {
    if (this.#highlighted !== isHighlighted) {
      this.#highlighted = isHighlighted
      this.#needsDraw = true
      this.drawIfNeeded()
    }
  }

  get nodes () {
    if (!this.#nodes) {
      const ctx = this.#canvas.getContext('2d')
      this.#needsDraw = true
      this.#nodes = this.#schedule
        .orderBy(scheduleItem => scheduleItem.timeMs)
        .select(scheduleItem => ({
          coordinate: {
            x: AutoScheduleUtils.translateTimeMsToX(ctx, scheduleItem.timeMs, this.#dimensions),
            y: AutoScheduleUtils.translateIntensityToY(ctx, scheduleItem.intensity, this.#dimensions)
          },
          schedulePoint: scheduleItem
        }))
        .toArray()
    }
    return this.#nodes
  }

  set schedule (schedule) {
    this.#needsDraw = true
    this.#schedule = schedule
    this.#nodes = undefined
    this.drawIfNeeded()
  }

  onResize () {
    this.#needsDraw = true
    AutoScheduleUtils.resizeCanvasToFitInParent(this.#canvas)
    this.#nodes = undefined
    this.drawIfNeeded()
  }

  drawIfNeeded () {
    if (this.#needsDraw && this.#schedule) {
      const ctx = this.#canvas.getContext('2d')

      this.#canvas.style.zIndex = this.#highlighted ? '35' : '30'
      ctx.shadowBlur = this.#highlighted ? AutoScheduleChannel.highlightBlurLevel : 0
      ctx.shadowColor = AutoScheduleChannel.highlightBlueColour

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.beginPath()
      ctx.strokeStyle = AutoScheduleChannel.colourLookup[(this.#name)]

      const firstNode = this.nodes[0]
      const lastNode = this.nodes[this.nodes.length - 1]
      const midnightCrossingDeltaTimeMs = firstNode.schedulePoint.timeMs - (0 - lastNode.schedulePoint.timeMs)
      const midnightCrossingDeltaIntensity = firstNode.schedulePoint.intensity - lastNode.schedulePoint.intensity
      const midnightCrossingSlopRatio = midnightCrossingDeltaIntensity / midnightCrossingDeltaTimeMs

      ctx.moveTo(
        AutoScheduleUtils.translateTimeMsToX(ctx, 0, this.#dimensions),
        AutoScheduleUtils.translateIntensityToY(ctx, firstNode.schedulePoint.intensity - ((firstNode.schedulePoint.timeMs) * midnightCrossingSlopRatio), this.#dimensions))

      const coordinates = Enumerable.from(this.nodes)
        .select(node => node.coordinate)
      coordinates
        .concat([({
          x: AutoScheduleUtils.translateTimeMsToX(ctx, 86400000, this.#dimensions),
          y: AutoScheduleUtils.translateIntensityToY(ctx, lastNode.schedulePoint.intensity + lastNode.schedulePoint.timeMs * midnightCrossingSlopRatio, this.#dimensions)
        })])
        .forEach(coordinate => {
          ctx.lineTo(coordinate.x, coordinate.y)
        })
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = this.#highlighted ? AutoScheduleChannel.colourLookup[(this.#name)] : AutoScheduleChannel.nodeFillColour
      coordinates.forEach(coordinate => {
        ctx.beginPath()
        ctx.arc(coordinate.x, coordinate.y, AutoScheduleChannel.nodeRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      })
      this.#needsDraw = false
    }
  }
}