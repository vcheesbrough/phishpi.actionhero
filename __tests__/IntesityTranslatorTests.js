'use strict'
const IntensityTranslator = require('../modules/intensityTranslator.js')

describe('intensityTranslator', () => {
  test('can construct', () => {
    expect(() => new IntensityTranslator(1)).not.toThrow()
  })
  test('native value is maximum for 1.0', () => {
    const target = new IntensityTranslator(255)
    expect(target.translatePercentValueToNative(1.0)).toEqual(255)
  })
  test('native value is 0 for 0.0', () => {
    const target = new IntensityTranslator(255)
    expect(target.translatePercentValueToNative(0.0)).toEqual(0)
  })
  test('native value is not a decimal', () => {
    const target = new IntensityTranslator(255)
    expect(target.translatePercentValueToNative(0.5)).toEqual(127)
  })
  test('percentage value is 1.0 for maximum', () => {
    const target = new IntensityTranslator(255)
    expect(target.translateNativeValueToPercentage(255)).toEqual(1.0)
  })
  test('percentage value is 0.0 for zero', () => {
    const target = new IntensityTranslator(255)
    expect(target.translateNativeValueToPercentage(0)).toEqual(0.0)
  })
  test('percentage value is 0.5 for fraction', () => {
    const target = new IntensityTranslator(200)
    expect(target.translateNativeValueToPercentage(100)).toEqual(0.5)
  })
  test('percentage schedule is 0.5 for fraction', () => {
    const target = new IntensityTranslator(200)
    expect(
      target.translateScheduleToPercent([{ intensity: 100, timeMs: 29 }])
        .toArray())
      .toEqual([{ intensity: 0.5, timeMs: 29 }])
  })
  test('native schedule is half maximum for 0.5', () => {
    const target = new IntensityTranslator(200)
    expect(
      target.translateScheduleToNative([{ intensity: 0.5, timeMs: 29 }])
        .toArray())
      .toEqual([{ intensity: 100, timeMs: 29 }])
  })
})

