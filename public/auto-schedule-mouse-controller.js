export class AutoScheduleMouseController {
  #lastMouseCoordinate
  #autoScheduleAxis
  #channels
  static mouseFudgeFactor = 10

  constructor(containingElement, autoScheduleAxis, channels) {
    this.#channels = channels
    this.#autoScheduleAxis = autoScheduleAxis

    containingElement.addEventListener('mousemove', (event) => {
      this.#updateMousePosition(autoScheduleAxis.convertMouseEventCoordinates(event))
    })

    containingElement.addEventListener('mouseleave', () => {
      this.#updateMousePosition()
    })

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

        const firstMatchingNode = Enumerable.from(this.#channels)
          .selectMany(channel => channel.nodes)
          .firstOrDefault(channelNode => {
            if(channelNode.coordinate.x - AutoScheduleMouseController.mouseFudgeFactor <= coordinate.x && channelNode.coordinate.x + AutoScheduleMouseController.mouseFudgeFactor >= coordinate.x) {
              if(channelNode.coordinate.y - AutoScheduleMouseController.mouseFudgeFactor <= coordinate.y && channelNode.coordinate.y + AutoScheduleMouseController.mouseFudgeFactor >= coordinate.y) {
                return true;
              }
            }
            return false;
          })

        const stickyCoordinate = firstMatchingNode ? firstMatchingNode.coordinate : coordinate
        const intensity = firstMatchingNode ? firstMatchingNode.schedulePoint.intensity : undefined
        const timeMs = firstMatchingNode ? firstMatchingNode.schedulePoint.timeMs : undefined

        this.#autoScheduleAxis.drawMouseTicks(stickyCoordinate, intensity, timeMs)
        Enumerable.from(this.#channels)
          .forEach(channel => {
            channel.highlighted = firstMatchingNode && firstMatchingNode.schedulePoint.channel === channel.name
          })
      })
    }
    this.#lastMouseCoordinate = coordinate
  }
}