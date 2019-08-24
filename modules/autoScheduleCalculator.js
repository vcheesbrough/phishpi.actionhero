'use strict'

const EventEmitter = require('events')
const Enumerable = require('linq/linq.js')

module.exports = class AutosScheduleCalculator {

  constructor (channel, timeOfDayUtc) {
    this._eventEmitter = new EventEmitter()
    this._channel = channel
    this._timeOfDayUtc = timeOfDayUtc || (() => new Date().getTime())
    this._schedule = undefined
    this._lastIntensityEventValue = undefined
  }

  get schedule () {
    return this._schedule
  }

  setSchedule (newSchedule, changedBy) {
    const newScheduleEnumerable = Enumerable.from(newSchedule)
      .orderBy(scheduleItem => scheduleItem.timeMs)

    if (this._schedule === undefined || !newScheduleEnumerable.sequenceEqual(this._schedule, scheduleItem => JSON.stringify(scheduleItem))) {
      this._schedule = newScheduleEnumerable.toArray()
      this._eventEmitter.emit('schedulechange', this._channel, this._schedule, changedBy)
      this.checkAndTriggerIntensityEvent(changedBy)
    }
  }

  checkAndTriggerIntensityEvent (changedBy) {
    const currentTime = this._timeOfDayUtc()
    const currentTimeOfDay = currentTime % 86400000
    const itemBeforeCurrentTimeOfDay = Enumerable.from(this._schedule)
      .insert(0, Enumerable.repeat({
        timeMs: Enumerable.from(this._schedule).last().timeMs - 86400000,
        intensity: Enumerable.from(this._schedule).last().intensity,
      }, 1))
      .takeWhile(scheduleItem => scheduleItem.timeMs < currentTimeOfDay)
      .last()
    const itemsOnOrAfterCurrentTimeOfDay = Enumerable.from(this._schedule)
      .insert(this._schedule.length, Enumerable.repeat({
        timeMs: Enumerable.from(this._schedule).first().timeMs + 86400000,
        intensity: Enumerable.from(this._schedule).first().intensity,
      }, 1))
      .skipWhile(scheduleItem => scheduleItem.timeMs <= currentTimeOfDay)

    const deltaTimeMs = itemsOnOrAfterCurrentTimeOfDay.first().timeMs - itemBeforeCurrentTimeOfDay.timeMs
    const deltaIntensity = itemsOnOrAfterCurrentTimeOfDay.first().intensity - itemBeforeCurrentTimeOfDay.intensity
    const slope = deltaIntensity / deltaTimeMs

    const currentIntensity = itemBeforeCurrentTimeOfDay.intensity + (slope * (currentTimeOfDay - itemBeforeCurrentTimeOfDay.timeMs))
    if (currentIntensity !== this._lastIntensityEventValue) {
      this._lastIntensityEventValue = currentIntensity
      this._eventEmitter.emit('intensitychange', this._channel, Math.floor(currentIntensity), changedBy)
    }

    const midnight = Math.floor(currentTime / 86400000)
    const thing = Enumerable.repeat({
        timeMs: midnight + (Enumerable.from(this._schedule).last().timeMs - 86400000),
        intensity: Enumerable.from(this._schedule).last().intensity
      }, 1)
      .concat(Enumerable.from(this._schedule).select(scheduleItem => ({
        timeMs: midnight + scheduleItem.timeMs,
        intensity: scheduleItem.intensity,
      })))
      .concat(Enumerable.from(this._schedule).select(scheduleItem => ({
        timeMs: midnight + scheduleItem.timeMs + 86400000,
        intensity: scheduleItem.intensity,
      })))
    const nextChange = Enumerable.repeat(undefined, 1)
      .concat(thing)
      .zip(thing, (first, second) => ({ first, second }))
      .skip(1)
      .skipWhile(pair => currentTime >= pair.second.timeMs)
      .skipWhile(pair => pair.first.intensity === currentIntensity && pair.second.intensity === currentIntensity)
      .firstOrDefault()
    if (nextChange) {
      const factor = Math.abs((nextChange.second.intensity - nextChange.first.intensity) / (nextChange.second.timeMs - nextChange.first.timeMs))
      let changeTime = nextChange.first.timeMs
      if (currentTime > changeTime) {
        changeTime = currentTime
      }
      this._eventEmitter.emit('nextintensitychangetime', this._channel, factor + changeTime)
    }

  }

  addOnIntensityChangeListener (func) {
    this._eventEmitter.on('intensitychange', func)
  }

  addOnScheduleChangeListener (func) {
    this._eventEmitter.on('schedulechange', func)
  }

  addNextIntensityChangeTimeListener (func) {
    this._eventEmitter.on('nextintensitychangetime', func)
  }
}
