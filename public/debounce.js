'use strict'

let timer
let lastFunc
export function debounce (func, delayMs) {
  if (timer === undefined) {
    lastFunc = func
    func()
    timer = setTimeout(() => {
      lastFunc()
      timer = undefined
    }, delayMs)
  } else {
    lastFunc = func
  }
}
