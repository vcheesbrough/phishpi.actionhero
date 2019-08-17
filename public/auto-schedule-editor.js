'use strict'

export function registerAutoTimeCanvas (client, canvasElement) {
  const topGutter = 20
  const bottomGutter = 50
  const rightGutter = 50
  const leftGutter = 50
  const nodeRadius = 5
  const colourLookup = {
    red: '#ff0000',
    blue: '#0008ff',
    white: '#000000'
  }

  const resizeCanvas = () => {
    canvasElement.style.width = '100%'
    canvasElement.style.height = '100%'
    canvasElement.width = canvasElement.offsetWidth
    canvasElement.height = canvasElement.offsetHeight
  }

  resizeCanvas()

  window.addEventListener('resize', (event) => {
    resizeCanvas()
    redrawCanvas()
  })

  const translateTimeMsToX = (timeMs) => {
    const ratio = 86400000.0 / (canvasElement.width - rightGutter - leftGutter)
    return leftGutter + (timeMs / ratio)
  }

  const translateIntensityToY = (intensity) => {
    const ratio = 1.0 / (canvasElement.height - topGutter - bottomGutter)
    return canvasElement.height - ((intensity / ratio) + bottomGutter)
  }

  const renderChannelSchedule = function (channelValues, ctx) {
    const coordinates = channelValues
      .orderBy(schedulePoint => schedulePoint.timeMs)
      .select(schedulePoint => ({
        x: translateTimeMsToX(schedulePoint.timeMs),
        y: translateIntensityToY(schedulePoint.intensity),
        schedulePoint
      }))
    ctx.beginPath()
    ctx.strokeStyle = colourLookup[(channelValues.key())]

    const firstCoordinate = coordinates.first()
    const lastCoordinate = coordinates.last()
    const midnightCrossingDeltaTimeMs = firstCoordinate.schedulePoint.timeMs - (0 - lastCoordinate.schedulePoint.timeMs)
    const midnightCrossingDeltaIntensity = firstCoordinate.schedulePoint.intensity - lastCoordinate.schedulePoint.intensity
    const midnightCrossingSlopRatio = midnightCrossingDeltaIntensity / midnightCrossingDeltaTimeMs

    ctx.moveTo(
      translateTimeMsToX(0),
      translateIntensityToY(firstCoordinate.schedulePoint.intensity - ((firstCoordinate.schedulePoint.timeMs) * midnightCrossingSlopRatio)))

    coordinates
      .concat([({
        x: translateTimeMsToX(86400000),
        y: translateIntensityToY(lastCoordinate.schedulePoint.intensity + lastCoordinate.schedulePoint.timeMs * midnightCrossingSlopRatio)
      })])
      .forEach(coordinate => {
        ctx.lineTo(coordinate.x, coordinate.y)
      })
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = 'white'
    coordinates.forEach(coordinate => {
      ctx.beginPath()
      ctx.arc(coordinate.x, coordinate.y, nodeRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })
  }

  let currentSchedule

  const redrawCanvas = () => {
    if (currentSchedule) {
      const ctx = canvasElement.getContext('2d')
      Enumerable.from(currentSchedule)
        .groupBy(element => element.channel)
        .forEach(group => {
          renderChannelSchedule(group, ctx)
        })
    }
  }

  client.on('say', function (data) {
    const messageObj = JSON.parse(data.message)
    if (messageObj.type === 'notifyAutoScheduleChange') {
      console.log(messageObj)
      currentSchedule = messageObj.schedule
      redrawCanvas()
    }
  })
};
