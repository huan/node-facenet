import * as crypto  from 'crypto'
import * as ndarray from 'ndarray'

const {
  createCanvas,
}                   = require('canvas')

// TODO: use ndarray instead of nj.NdArray
// export function md5(array: nj.NdArray<any>): string {
//   // https://github.com/nicolaspanel/numjs/blob/master/src/ndarray.js#L24
//   const data = (array as any).selection.data as Uint8Array
//   const buf = new Buffer(data.buffer)
//   return crypto
//           .createHash('md5')
//           .update(buf)
//           // .update(new Buffer(ndarray.tolist()))
//           .digest('hex')
// }

export function bufResizeUint8ClampedRGBA(array: ndarray): ndarray {
  const buf = new Uint8ClampedArray(array.shape[0] * array.shape[1] * 4)
  const newArray = ndarray(buf, array.shape)
  for (let i = 0; i < array.shape[0]; i++) {
    for (let j = 0; j < array.shape[1]; j++) {
      for (let k = 0; k < 4; k++) {
        newArray.set(i, j, k, array.get(i, j, k))
      }
    }
  }
  return newArray
}

export function imageMd5(image: ImageData | HTMLImageElement ): string {
  if ((image as any).src) {  // HTMLImageElement
    image = imageToData(image as HTMLImageElement)
  } else {
    image = image as ImageData
  }

  const buffer = new Buffer(image.data.buffer)
  return crypto.createHash('md5')
              .update(buffer)
              .digest('hex')
}

export function imageToData(image: HTMLImageElement): ImageData {
  const canvas  = createCanvas(image.width, image.height)
  const ctx     = canvas.getContext('2d')

  ctx.drawImage(image, 0, 0, image.width, image.height)
  const imageData = ctx.getImageData(0, 0, image.width, image.height)

  return imageData
}

export function cropImage(
  imageData:  ImageData,
  x:          number,
  y:          number,
  width:      number,
  height:     number,
): ImageData {
  const canvas  = createCanvas(width, height)
  const ctx     = canvas.getContext('2d')

  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
  ctx.putImageData(imageData, 0 - x, 0 - y)
  const croppedImageData = ctx.getImageData(0, 0, width, height)

  return croppedImageData
}
