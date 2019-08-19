'use strict'

export const resizeCanvasToFitInParent = (canvas) => {
  canvas.width = canvas.parentElement.clientWidth
  canvas.height = canvas.parentElement.clientHeight
}

export const createCanvasAndAddToContainingElement = (canvasId, zIndex, containerElement) => {
  const canvas = document.createElement("canvas");
  canvas.id = canvasId;
  canvas.style.position = 'absolute'
  canvas.style.zIndex = zIndex
  canvas.style.width = containerElement.clientWidth
  canvas.style.height = containerElement.clientHeight
  canvas.style.left = containerElement.clientX
  canvas.style.top = containerElement.clientY
  containerElement.appendChild(canvas);
  return canvas
}

export const translateXToTimeMs = (ctx, x, chartAreaDimensions) => {
  const ratio = 86400000.0 / (ctx.canvas.clientWidth - chartAreaDimensions.rightGutter - chartAreaDimensions.leftGutter)
  return Math.floor((x-chartAreaDimensions.leftGutter) * ratio)
}

export const translateTimeMsToX = (ctx, timeMs, chartAreaDimensions) => {
  const ratio = 86400000.0 / (ctx.canvas.clientWidth - chartAreaDimensions.rightGutter - chartAreaDimensions.leftGutter)
  return Math.floor(chartAreaDimensions.leftGutter + (timeMs / ratio))
}

export const translateYToIntensity = (ctx, y, chartAreaDimensions) => {
  const ratio = 1.0 / (ctx.canvas.clientHeight - chartAreaDimensions.topGutter - chartAreaDimensions.bottomGutter)
  return 1.0 - ((y-chartAreaDimensions.topGutter) * ratio)
}

export const translateIntensityToY = (ctx, intensity, chartAreaDimensions) => {
  const ratio = 1.0 / (ctx.canvas.clientHeight - chartAreaDimensions.topGutter - chartAreaDimensions.bottomGutter)
  return Math.floor(ctx.canvas.clientHeight - ((intensity / ratio) + chartAreaDimensions.bottomGutter))
}



