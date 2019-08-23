'use strict'

import * as AutoScheduleUtils from './auto-schedule-utils.js'

export class AutoScheduleChannel {
  #name
  #canvas
  #highlighted = false
  #nodes
  #schedule
  #needsDraw = true
  #dimensions
  #containerElement
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
    this.#containerElement = containerElement
    this.#name = channelName
    this.#dimensions = dimensions
    this.#canvas = AutoScheduleUtils.createCanvasAndAddToContainingElement(this.#name + 'Canvas', 30, this.#containerElement)
  }

  get name () {
    return this.#name
  }

  get context() {
    return this.#canvas.getContext('2d')
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
      const ctx = this.context
      this.#needsDraw = true
      this.#nodes = this.#schedule
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
  setSchedule(schedule,fireEvents) {
    if (this.#schedule && !this.#schedule.sequenceEqual(schedule, element => JSON.stringify(element)) || !this.#schedule) {
      this.#needsDraw = true
      const oldSchedule = this.#schedule
      this.#schedule = schedule
      this.#nodes = undefined
      this.drawIfNeeded()
      if(fireEvents)
      {
        this.#containerElement.dispatchEvent(new CustomEvent('schedulechange', {
          detail: {
            channel: this.name,
            schedule: this.#schedule
          }
        }))

      }
    }
  }

  addScheduleChangeListener(func) {
    this.#containerElement.addEventListener('schedulechange',customEvent => {
      if(this.name === customEvent.detail.channel) {
        func(customEvent.detail.channel,customEvent.detail.schedule)
      }
    })
  }

  get schedule () {
    return this.#schedule
  }

  onResize () {
    this.#needsDraw = true
    AutoScheduleUtils.resizeCanvasToFitInParent(this.#canvas)
    this.#nodes = undefined
    this.drawIfNeeded()
  }

  drawIfNeeded () {
    if (this.#needsDraw && this.#schedule) {
      const ctx = this.context

      this.#canvas.style.zIndex = this.#highlighted ? '35' : '30'
      ctx.shadowBlur = this.#highlighted ? AutoScheduleChannel.highlightBlurLevel : 0
      ctx.shadowColor = AutoScheduleChannel.highlightBlueColour

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.beginPath()
      ctx.strokeStyle = AutoScheduleChannel.colourLookup[(this.#name)]

      const firstNode = this.nodes[0]
      const lastNode = this.nodes[this.nodes.length - 1]
      const midnightCrossingDeltaTimeMs = firstNode.schedulePoint.timeMs - (0 - (86400000-lastNode.schedulePoint.timeMs))
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
          y: AutoScheduleUtils.translateIntensityToY(ctx, lastNode.schedulePoint.intensity + (86400000-lastNode.schedulePoint.timeMs) * midnightCrossingSlopRatio, this.#dimensions)
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

  findNodeAtCoordinate(coordinate, fudgeFactor) {
    for(let index = 0 ; index < this.nodes.length ; index++) {
      const channelNode = this.nodes[index]
      if (channelNode.coordinate.x - fudgeFactor <= coordinate.x && channelNode.coordinate.x + fudgeFactor >= coordinate.x) {
        if (channelNode.coordinate.y - fudgeFactor <= coordinate.y && channelNode.coordinate.y + fudgeFactor >= coordinate.y) {
          return {
            node: channelNode,
            index: index
          }
        }
      }
    }
    return undefined
  }
}