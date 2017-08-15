import {
    createCanvas,
}                   from './misc'

export function fixtureImageData3x3(): ImageData {
  const canvas = createCanvas(3, 3)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('no ctx')
  }
  const imageData = ctx.createImageData(3, 3)

  let val = 0
  for (let i = 0; i < imageData.data.length; i += 4) {
    val++
    imageData.data[i + 0] = val
    imageData.data[i + 1] = val
    imageData.data[i + 2] = val
    imageData.data[i + 3] = 255
  }
  /**
   * 1 2 3
   * 4 5 6
   * 7 8 9
   */
  return imageData
}
