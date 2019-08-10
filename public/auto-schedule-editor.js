'use strict'

export function registerAutoTimeCanvas (client, canvas) {
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight
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

  const translateTimeMsToX = (timeMs) => {
    const ratio = 86400000.0 / (canvas.width - rightGutter - leftGutter)
    return leftGutter + (timeMs / ratio)
  }

  const translateIntensityToY = (intensity) => {
    const ratio = 1.0 / (canvas.height - topGutter - bottomGutter)
    return canvas.height - ((intensity / ratio) + bottomGutter)
  }

  const renderChannelSchedule = function (channelValues, ctx) {
    const coordinates = channelValues
      .orderBy(schedulePoint => schedulePoint.timeMs)
      .select(schedulePoint => ({
        x: translateTimeMsToX(schedulePoint.timeMs),
        y: translateIntensityToY(schedulePoint.intensity),
        schedulePoint: schedulePoint
      }))
    ctx.beginPath()
    ctx.strokeStyle = colourLookup[(channelValues.key())]
    const firstCoordinate = coordinates.first()
    ctx.moveTo(firstCoordinate.x, firstCoordinate.y)
    coordinates
      .skip(1)
      .forEach(coordinate => ctx.lineTo(coordinate.x, coordinate.y))
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

  client.on('say', function (data) {
    const messageObj = JSON.parse(data.message)
    if (messageObj.type === 'notifyAutoScheduleChange') {
      console.log(messageObj)
      const ctx = canvas.getContext('2d')
      Enumerable.from(messageObj.schedule)
        .groupBy(element => element.channel)
        .forEach(group => {
          renderChannelSchedule(group, ctx)
        })
    }
  })
};
