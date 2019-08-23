'use strict'

import * as AutoScheduleUtils from './auto-schedule-utils.js'

export class AutoScheduleAxis {
  static mouseAxisTickLength = 20
  static mouseAxisTickWidth = 10
  static mouseAxisTickColour = '#abaaaa'
  static mouseAxisTextColour = '#6a6a6a'
  static mouseAxisTextFont = '20px sans-serif'
  static axisColour = '#d9d9d9'

  #chartAreaDimensions
  #axisCanvas
  #mouseCanvas

  constructor (containerElement,dimensions) {
    this.#chartAreaDimensions = dimensions
    this.#axisCanvas = AutoScheduleUtils.createCanvasAndAddToContainingElement('axisCanvas',2, containerElement)
    this.#mouseCanvas = AutoScheduleUtils.createCanvasAndAddToContainingElement('mouseCanvas',1, containerElement)
  }

  get mouseCanvas() {
    return this.#mouseCanvas
  }

  drawMouseTicks(mouseCoordinate, intensity, timeMs) {
    const ctx = this.#mouseCanvas.getContext('2d')
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)
    ctx.strokeStyle = AutoScheduleAxis.mouseAxisTickColour
    ctx.fillStyle = AutoScheduleAxis.mouseAxisTickColour

    ctx.beginPath()
    ctx.moveTo(mouseCoordinate.x - AutoScheduleAxis.mouseAxisTickWidth/2, ctx.canvas.clientHeight - this.#chartAreaDimensions.bottomGutter + AutoScheduleAxis.mouseAxisTickLength)
    ctx.lineTo(mouseCoordinate.x, ctx.canvas.clientHeight - this.#chartAreaDimensions.bottomGutter)
    ctx.lineTo(mouseCoordinate.x + AutoScheduleAxis.mouseAxisTickWidth/2, ctx.canvas.clientHeight - this.#chartAreaDimensions.bottomGutter + AutoScheduleAxis.mouseAxisTickLength)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(this.#chartAreaDimensions.leftGutter - AutoScheduleAxis.mouseAxisTickLength, mouseCoordinate.y - AutoScheduleAxis.mouseAxisTickWidth/2)
    ctx.lineTo(this.#chartAreaDimensions.leftGutter, mouseCoordinate.y)
    ctx.lineTo(this.#chartAreaDimensions.leftGutter - AutoScheduleAxis.mouseAxisTickLength, mouseCoordinate.y + AutoScheduleAxis.mouseAxisTickWidth/2)
    ctx.closePath()
    ctx.fill()

    ctx.font = AutoScheduleAxis.mouseAxisTextFont
    ctx.fillStyle = AutoScheduleAxis.mouseAxisTextColour

    ctx.textBaseline = 'top'
    ctx.textAlign = 'center'
    const date = new Date(timeMs || AutoScheduleUtils.translateXToTimeMs(ctx,mouseCoordinate.x,this.#chartAreaDimensions))
    // noinspection JSUnresolvedVariable,JSUnresolvedFunction
    ctx.fillText(moment.utc(date).format('HH:mm'),mouseCoordinate.x, ctx.canvas.clientHeight - this.#chartAreaDimensions.bottomGutter + AutoScheduleAxis.mouseAxisTickLength + 5)

    ctx.textBaseline = 'middle'
    ctx.textAlign = 'right'
    ctx.fillText(''+Math.round((intensity || AutoScheduleUtils.translateYToIntensity(ctx, mouseCoordinate.y, this.#chartAreaDimensions))*100)+'%', this.#chartAreaDimensions.leftGutter - AutoScheduleAxis.mouseAxisTickLength - 5,mouseCoordinate.y)
  }

  drawAxis() {
    const ctx = this.#axisCanvas.getContext('2d')
    ctx.lineWidth = 1
    ctx.strokeStyle = AutoScheduleAxis.axisColour
    ctx.strokeRect(this.#chartAreaDimensions.leftGutter, this.#chartAreaDimensions.topGutter, ctx.canvas.clientWidth - this.#chartAreaDimensions.rightGutter - this.#chartAreaDimensions.leftGutter, ctx.canvas.clientHeight - this.#chartAreaDimensions.bottomGutter - this.#chartAreaDimensions.topGutter)
    Enumerable.range(0, 25, 60 * 60 * 1000)
      .forEach(timeMs => {
        ctx.beginPath()
        const x = AutoScheduleUtils.translateTimeMsToX(ctx, timeMs, this.#chartAreaDimensions)
        const y = AutoScheduleUtils.translateIntensityToY(ctx, 0, this.#chartAreaDimensions)
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + 10)
        ctx.stroke()
      })
  }

  onResize() {
    AutoScheduleUtils.resizeCanvasToFitInParent(this.#axisCanvas)
    AutoScheduleUtils.resizeCanvasToFitInParent(this.#mouseCanvas)
    this.drawAxis()
  }

  convertMouseEventCoordinates(event) {
    let x = event.offsetX
    if(x < this.#chartAreaDimensions.leftGutter) {
      x = this.#chartAreaDimensions.leftGutter
    }
    if(x > this.#mouseCanvas.clientWidth - this.#chartAreaDimensions.rightGutter)
    {
      x = this.#mouseCanvas.clientWidth - this.#chartAreaDimensions.rightGutter
    }
    let y = event.offsetY
    if(y < this.#chartAreaDimensions.topGutter) {
      y = this.#chartAreaDimensions.topGutter
    }
    if(y > this.#mouseCanvas.clientHeight - this.#chartAreaDimensions.bottomGutter) {
      y = this.#mouseCanvas.clientHeight - this.#chartAreaDimensions.bottomGutter
    }
    return {x,y}
  }

}