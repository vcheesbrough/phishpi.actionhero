'use strict'

const EventEmitter = require('events')
const Enumerable = require('linq/linq.js')

module.exports = class AutosScheduleCalculator {

  constructor (channel, timeOfDayUtc) {
    this.eventEmitter = new EventEmitter()
    this.channel = channel
    this.timeOfDayUtc = timeOfDayUtc
    this._schedule = undefined
  }

  get schedule () {
    return this._schedule
  }

  set schedule (newSchedule) {
    const newScheduleEnumerable = Enumerable.from(newSchedule)
      .orderBy(scheduleItem => scheduleItem.timeMs)

    if (this._schedule === undefined || !newScheduleEnumerable.sequenceEqual(this._schedule, scheduleItem => JSON.stringify(scheduleItem))) {
      this._schedule = newScheduleEnumerable.toArray()
      const currentTime = this.timeOfDayUtc()
      const before = newScheduleEnumerable
        .insert(0, Enumerable.repeat({
          intensity: newScheduleEnumerable.last().intensity,
          timeMs: newScheduleEnumerable.last().timeMs - 86400000
        }, 1))
        .takeWhile(scheduleItem => scheduleItem.timeMs < currentTime)
        .last()
      const after = newScheduleEnumerable
        .insert(newSchedule.length, Enumerable.repeat({
          intensity: newScheduleEnumerable.first().intensity,
          timeMs: newScheduleEnumerable.first().timeMs + 86400000
        }, 1))
        .skipWhile(scheduleItem => scheduleItem.timeMs <= currentTime)
        .first()

      const deltaTimeMs = after.timeMs - before.timeMs
      const deltaIntensity = after.intensity - before.intensity
      const slope = deltaIntensity / deltaTimeMs

      const eventIntensity = before.intensity + (slope * (currentTime - before.timeMs))

      this.eventEmitter.emit('intensitychange', this.channel, Math.floor(eventIntensity))
    }
  }

  addOnIntensityChangeListener (func) {
    this.eventEmitter.on('intensitychange', func)
  }
}
