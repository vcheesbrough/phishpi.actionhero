'use strict'

const EventEmitter = require('events')
const Enumerable = require('linq/linq.js')

module.exports = class AutosScheduleCalculator {

  constructor (channel, timeOfDayUtc) {
    this._eventEmitter = new EventEmitter()
    this._channel = channel
    this._timeOfDayUtc = timeOfDayUtc || (() => new Date().getTime() % 86400000)
    this._schedule = undefined
  }

  get schedule () {
    return this._schedule
  }

  setSchedule (newSchedule, changedBy) {
    const newScheduleEnumerable = Enumerable.from(newSchedule)
      .orderBy(scheduleItem => scheduleItem.timeMs)

    if (this._schedule === undefined || !newScheduleEnumerable.sequenceEqual(this._schedule, scheduleItem => JSON.stringify(scheduleItem))) {
      this._schedule = newScheduleEnumerable.toArray()
      const currentTime = this._timeOfDayUtc()
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

      this._eventEmitter.emit('schedulechange', this._channel, this._schedule, changedBy)
      this._eventEmitter.emit('intensitychange', this._channel, Math.floor(eventIntensity), changedBy)
    }
  }

  addOnIntensityChangeListener (func) {
    this._eventEmitter.on('intensitychange', func)
  }

  addOnScheduleChangeListener (func) {
    this._eventEmitter.on('schedulechange', func)
  }
}
