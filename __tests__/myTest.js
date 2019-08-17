'use strict'

describe('how does javascript work', () => {
  test('functions with different values are not equal', () => {
    expect(() => 1 + 2).not.toEqual(() => 1 + 3)
  })
  test('functions with same values are equal', () => {
    expect((() => 1 + 2).toString()).toEqual((() => 1 + 2).toString())
  })
})
