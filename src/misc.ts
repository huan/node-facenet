import * as crypto  from 'crypto'
import * as fs      from 'fs'

import * as ndarray from 'ndarray'

const _createCanvas     = require('canvas').createCanvas
const _createImageData  = require('canvas').createImageData
const _loadImage        = require('canvas').loadImage

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
  if (!ctx) {
    throw new Error('getContext found null')
  }

  ctx.drawImage(image, 0, 0, image.width, image.height)
  const imageData = ctx.getImageData(0, 0, image.width, image.height)

  return imageData
}

export async function dataToImage(data: ImageData): Promise<HTMLImageElement> {
  const canvas = createCanvas(data.width, data.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('getContext found null')
  }
  ctx.putImageData(data, 0, 0)
  const dataUrl = canvas.toDataURL()
  const image = await loadImage(dataUrl)
  return image
}

export function cropImage(
  imageData:  ImageData,
  x:          number,
  y:          number,
  width:      number,
  height:     number,
): ImageData {
  const canvas  = createCanvas(imageData.width, imageData.height)
  const ctx     = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('getContext found null')
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/putImageData
  // Issues #12 negative x/y value bug
  ctx.putImageData(imageData, 0, 0)
  const croppedImageData = ctx.getImageData(x, y, width, height)

  return croppedImageData
}

export async function resizeImage(
  image:  ImageData | HTMLImageElement,
  width:  number,
  height: number,
): Promise<ImageData> {
  if ((image as any).data) {  // ImageData
    image = await dataToImage(image as ImageData)
  } else {
    image = image as HTMLImageElement
  }

  const canvas  = createCanvas(width, height)
  const ctx     = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('getContext found null')
  }

  ctx.drawImage(image, 0, 0, width, height)
  const resizedImage = ctx.getImageData(0, 0, width, height)

  return resizedImage
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
  const image = await _loadImage(url)
  return image
}

export function createCanvas(
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = _createCanvas(width, height)
  return canvas
}

export async function saveImage(
  imageData:  ImageData,
  file:       string,
  ext:        'png' | 'jpg' = 'png',
): Promise<void> {
  const out = fs.createWriteStream(`${file}.${ext}`)

  const canvas = createCanvas(imageData.width, imageData.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('no ctx')
  }
  ctx.putImageData(imageData, 0, 0)

  let stream: NodeJS.ReadableStream
  switch (ext) {
    case 'jpg':
      stream = (canvas as any).createJPEGStream({
        bufsize: 2048,
        quality: 80,
      })
      break

    case 'png':
      stream = (canvas as any).createPNGStream()
      break

    default:
      throw new Error('unsupported type:' + ext)
  }
  stream.pipe(out)

  return new Promise<void>((resolve, reject) => {
    out.on('close', resolve)
    out.on('error', reject)
    stream.on('error', reject)
  })
}

export function createImageData(
  array:  Uint8ClampedArray,
  width:  number,
  height: number,
): ImageData {
  return _createImageData(array, width, height)
}