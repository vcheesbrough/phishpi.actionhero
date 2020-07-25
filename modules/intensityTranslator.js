'use strict'

const Enumerable = require('linq/linq.js')

module.exports = class IntensityTranslator {
  constructor (maximumNativeValue) {
    this.maximumNativeValue = maximumNativeValue
  }

  translatePercentValueToNative (percentageValue) {
    return Math.round(percentageValue * this.maximumNativeValue)
  }

  translateNativeValueToPercentage (nativeValue) {
    return Math.round((nativeValue / this.maximumNativeValue) * 1000) / 1000
  }

  translateScheduleToNative (schedule) {
    return Enumerable.from(schedule)
      .select(scheduleItem => {
        return {
          timeMs: scheduleItem.timeMs,
          intensity: this.translatePercentValueToNative(scheduleItem.intensity)
        }
      })
  }

  translateScheduleToPercent (schedule) {
    return Enumerable.from(schedule)
      .select(scheduleItem => {
        return {
          timeMs: scheduleItem.timeMs,
          intensity: this.translateNativeValueToPercentage(scheduleItem.intensity)
        }
      })
  }
}