'use strict'

module.exports = class IntensityTranslator {
  constructor (maximumNativeValue) {
    this.maximumNativeValue = maximumNativeValue
  }

  translateToNative  (percentageValue)  {
    return Math.floor(percentageValue * this.maximumNativeValue)
  }

  translateToPercentage (nativeValue) {
    return nativeValue / this.maximumNativeValue
  }
}