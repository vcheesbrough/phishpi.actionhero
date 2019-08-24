'use strict'
const IntensityTranslator = require('../modules/intensityTranslator.js')

describe('intensityTranslator', () => {
  test('can construct', () => {
    expect(() => new IntensityTranslator(1)).not.toThrow()
  })
  test('native value is maximum for 1.0', () => {
    const target = new IntensityTranslator(255)
    expect(target.translateToNative(1.0)).toEqual(255)
  })
  test('native value is 0 for 0.0', () => {
    const target = new IntensityTranslator(255)
    expect(target.translateToNative(0.0)).toEqual(0)
  })
  test('native value is not a decimal', () => {
    const target = new IntensityTranslator(255)
    expect(target.translateToNative(0.5)).toEqual(127)
  })
  test('percentage value is 1.0 for maximum', () => {
    const target = new IntensityTranslator(255)
    expect(target.translateToPercentage(255)).toEqual(1.0)
  })
  test('percentage value is 0.0 for zero', () => {
    const target = new IntensityTranslator(255)
    expect(target.translateToPercentage(0)).toEqual(0.0)
  })
  test('percentage value is 0.5 for fraction', () => {
    const target = new IntensityTranslator(200)
    expect(target.translateToPercentage(100)).toEqual(0.5)
  })
})

