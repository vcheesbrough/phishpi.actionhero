'use strict'

import * as AutoScheduleUtils from './auto-schedule-utils.js'

export class AutoScheduleMouseController {
  #lastMouseCoordinate
  #autoScheduleAxis
  #channels
  #draggedNode
  #containingElement
  static mouseFudgeFactor = 10
  #chartAreaDimensions

  constructor(containingElement, autoScheduleAxis, channels, chartAreaDimensions) {
    this.#containingElement = containingElement
    this.#channels = channels
    this.#autoScheduleAxis = autoScheduleAxis
    this.#chartAreaDimensions = chartAreaDimensions

    this.#containingElement.addEventListener('mousemove', (event) => {
      this.#updateMousePosition(autoScheduleAxis.convertMouseEventCoordinates(event))
    })

    this.#containingElement.addEventListener('mouseleave', () => {
      this.#endDrag()
      this.#draggedNode = undefined
      this.#updateMousePosition()
    })

    this.#containingElement.addEventListener("pointerdown", this.#onPointerDown)
    this.#containingElement.addEventListener("pointerup", this.#onPointerUp)
  }

  #onDrag = (event) => {
    if (this.#draggedNode) {
      const coordinate = this.#autoScheduleAxis.convertMouseEventCoordinates(event)

      const intensity = AutoScheduleUtils.translateYToIntensity(this.#draggedNode.channel.context, coordinate.y,this.#chartAreaDimensions)
      let timeMs = AutoScheduleUtils.translateXToTimeMs(this.#draggedNode.channel.context, coordinate.x,this.#chartAreaDimensions)

      const node = this.#draggedNode.channel.nodes[this.#draggedNode.index]
      if(this.#draggedNode.index > 0) {
        if(timeMs < this.#draggedNode.channel.nodes[this.#draggedNode.index-1].schedulePoint.timeMs) {
          timeMs = this.#draggedNode.channel.nodes[this.#draggedNode.index-1].schedulePoint.timeMs
        }
      }
      if(this.#draggedNode.index <= this.#draggedNode.channel.nodes.length -2) {
        if(timeMs > this.#draggedNode.channel.nodes[this.#draggedNode.index+1].schedulePoint.timeMs) {
          timeMs = this.#draggedNode.channel.nodes[this.#draggedNode.index+1].schedulePoint.timeMs
        }
      }

      const schedule = Enumerable.from(this.#draggedNode.channel.schedule).toArray()
      schedule[this.#draggedNode.index] = {
        intensity: intensity,
        timeMs: timeMs
      }
      this.#draggedNode.channel.setSchedule(Enumerable.from(schedule),true)

    }
  }

  #onPointerDown = (event) => {
    const coordinate = this.#autoScheduleAxis.convertMouseEventCoordinates(event)
    const matchingNode = this.#getFirstMatchingNode(coordinate)
    this.#draggedNode = matchingNode
    if(matchingNode) {
      this.#containingElement.addEventListener('pointermove', this.#onDrag)
    }
  }

  #onPointerUp = (event) => {
    this.#endDrag()
  }

  #endDrag = () => {
    this.#containingElement.removeEventListener('pointermove', this.#onDrag)
    this.#draggedNode = undefined
  }

  #isEquivalent = (a, b) => {
    if (a && b) {
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

  #updateMousePosition = (coordinate) => {
    if(coordinate === undefined) {
      this.#lastMouseCoordinate = undefined
      window.requestAnimationFrame(() => {
        const ctx = this.#autoScheduleAxis.mouseCanvas.getContext('2d')
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)
        Enumerable.from(this.#channels)
          .forEach(channel => {
            channel.highlighted = false
          })
      })
      return
    }

    if(! this.#isEquivalent(this.#lastMouseCoordinate, coordinate) || this.#lastMouseCoordinate === undefined) {
      window.requestAnimationFrame(() => {

        const firstMatchingNode = this.#draggedNode || this.#getFirstMatchingNode(coordinate)

        const stickyCoordinate = firstMatchingNode ? firstMatchingNode.channel.nodes[firstMatchingNode.index].coordinate : coordinate
        const intensity = firstMatchingNode ? firstMatchingNode.channel.nodes[firstMatchingNode.index].schedulePoint.intensity : undefined
        const timeMs = firstMatchingNode ? firstMatchingNode.channel.nodes[firstMatchingNode.index].schedulePoint.timeMs : undefined

        this.#autoScheduleAxis.drawMouseTicks(stickyCoordinate, intensity, timeMs)
        Enumerable.from(this.#channels)
          .forEach(channel => {
            channel.highlighted = firstMatchingNode && firstMatchingNode.channel.name === channel.name
          })
      })
    }
    this.#lastMouseCoordinate = coordinate
  }

  #getFirstMatchingNode = (coordinate) => {
    return this.#channels.select(channel => {
        const matchingNode = channel.findNodeAtCoordinate(coordinate, AutoScheduleMouseController.mouseFudgeFactor)
        if (matchingNode) {
          return {
            channel: channel,
            index: matchingNode.index
          }
        }
        return undefined
      })
      .firstOrDefault(element => element)
  }
}