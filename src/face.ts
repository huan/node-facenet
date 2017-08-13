/**
 *
 */
import ndarray = require('ndarray')

const { ImageData } = require('canvas')

import {
  FaceEmbedding,
  log,
}                           from './config'
import {
  bufResizeUint8ClampedRGBA,
  md5ImageData,
}                           from './misc'

export interface Point {
  x: number,
  y: number,
}

export interface Rectangle {
  x: number,
  y: number,
  w: number,
  h: number,
}

export interface FacialLandmark {
  [idx: string]:    Point,
  leftEye:          Point,
  rightEye:         Point,
  nose:             Point,
  leftMouthCorner:  Point,
  rightMouthCorner: Point,
}

export interface FaceJsonObject {
  _embedding:     FaceEmbedding,
  boundingBox:    Rectangle,
  confidence:     number,
  data:           string,   // Base64 of Buffer
  facialLandmark: FacialLandmark,
}

export class Face {
  public static id = 0
  public id: number
  public md5: string

  public boundingBox:     Rectangle
  public confidence:      number
  public facialLandmark:  FacialLandmark

  private _embedding: FaceEmbedding

  constructor(
    public imageData:   ImageData,
    box:                number[], // [x0, y0, x1, y1]
  ) {
    this.md5 = md5ImageData(imageData)
    log.silly('Face', 'constructor() md5=%s', this.md5)

    this.boundingBox = this.squareBox(box)

    if (   this.boundingBox.w !== imageData.width
        || this.boundingBox.h !== imageData.height
    ) { // need to corp and reset this.data
      log.silly('Face', 'constructor() w=%d, h=%d; width=%d, height=%d',
                        this.boundingBox.w,
                        this.boundingBox.h,
                        imageData.width,
                        imageData.height,
              )
      const rect = this.boundingBox

      const [c0, r0, c1, r1] = [
        rect.x,
        rect.y,
        rect.x + rect.w - 1,
        rect.y + rect.h - 1,
      ]
      const image = ndarray(
        imageData.data,
        [
          imageData.width,
          imageData.height,
          imageData.data.length / imageData.width / imageData.height, // depth(4)
        ],
      )
      const cropedImage = (image as any).hi(r1 + 1, c1 + 1, null).lo(r0, c0, null)

      const array = bufResizeUint8ClampedRGBA(cropedImage)
      // update this.imageData to the croped one
      this.imageData = new ImageData(array.data, array.shape[0], array.shape[1])
    }
  }

  public toJSON(): FaceJsonObject {
    const data = Buffer.from(this.imageData.data.buffer)
                      .toString('base64')
    const {
      _embedding,
      boundingBox,
      confidence,
      facialLandmark,
    } = this

    return {
      _embedding,
      boundingBox,
      confidence,
      data,
      facialLandmark,
    }
  }

  public static fromJSON(obj: FaceJsonObject | string): Face {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj) as FaceJsonObject
    }

    const buf = Buffer.from(obj.data, 'base64')
    const array = new Uint8ClampedArray(buf)

    const b = obj.boundingBox
    const imageData = new ImageData(array, b.w, b.h)

    const face = new Face(
      imageData,
      [b.x, b.y, b.x + b.w, b.y + b.h],
    )

    face._embedding     = obj._embedding
    face.facialLandmark = obj.facialLandmark
    face.boundingBox    = obj.boundingBox
    face.confidence     = obj.confidence

    return face
  }

  public init(
    marks: number[][],  // Facial Landmark
    confidence: number,
  ): void {
    this.confidence   = confidence

    const leftEye: Point = {
      x: marks[0][0],
      y: marks[0][1],
    }
    const rightEye: Point = {
      x: marks[1][0],
      y: marks[1][1],
    }
    const nose: Point = {
      x: marks[2][0],
      y: marks[2][1],
    }
    const leftMouthCorner: Point = {
      x: marks[3][0],
      y: marks[3][1],
    }
    const rightMouthCorner: Point = {
      x: marks[4][0],
      y: marks[4][1],
    }

    this.facialLandmark = {
      leftEye,
      rightEye,
      nose,
      leftMouthCorner,
      rightMouthCorner,
    }
  }

  public toString(): string {
    return `Face#${this.id}<${this._embedding}>`
  }

  public squareBox(box: number[]): Rectangle {
    let x0 = box[0]
    let y0 = box[1]
    let x1 = box[2]
    let y1 = box[3]

    const x = Math.round(x0)
    const y = Math.round(y0)

    // XXX should width inc 1 ???
    let w = x1 - x0 + 1
    let h = y1 - y0 + 1

    if (w !== h) {
      const halfDiff = Math.abs(w - h) / 2

      if (w > h) {
        y0 -= halfDiff
        y1 += halfDiff
        h += 2 * halfDiff  // update
      } else {
        x0 -= halfDiff
        x1 += halfDiff
        w += 2 * halfDiff // update
      }
    }

    return {
      x, y,
      w, h,
    }
  }

  public get embedding(): FaceEmbedding {
    if (!this._embedding) {
      throw new Error('no embedding yet!')
    }
    return this._embedding
  }

  public set embedding(embedding: FaceEmbedding) {
    if (this._embedding) {
      throw new Error('already had embedding!')
    } else if (embedding.shape[0] !== 128) {
      throw new Error('embedding dim is not 128!')
    }
    this._embedding = embedding
  }

  public get center(): Point {
    const x = Math.round(this.imageData.width / 2)
    const y = Math.round(this.imageData.height / 2)
    return {x, y}
  }

  public get width(): number {
    return this.imageData.width
  }

  public get height(): number {
    return this.imageData.height
  }

  public get depth(): number {
    return this.imageData.data.length
            / this.imageData.width
            / this.imageData.height
  }
}
