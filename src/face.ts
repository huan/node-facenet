/**
 *
 */
import * as nj from 'numjs'

import {
  FaceImage,
}                 from './face-image'

import {
  FaceEmbedding,
  log,
}                 from './config'

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
  facialLandmark: FacialLandmark,
  boundingBox:    Rectangle,
  confidence:     number,
  _embedding:     FaceEmbedding,
  box:            number[],
}

export class Face {
  public static id = 0
  public id: number

  public boundingBox:     Rectangle
  public confidence:      number
  public facialLandmark:  FacialLandmark

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

  private _embedding: FaceEmbedding

  constructor(
    public data:  ImageData,
    public box:   number[], // [x0, y0, x1, y1]
  ) {
    this.id = ++Face.id
    log.silly('Face', 'constructor() #%d', this.id)

    this.boundingBox = this.squareBox(box)

    const b = this.boundingBox

    const [r1, c1, r2, c2] = [
      b.y,
      b.x,
      b.y + b.h,
      b.x + b.w,
    ]

    let image = nj.array<Uint8ClampedArray>(data.data)
    image = image.hi(r2, c2).lo(r1, c1) as any

    const array = (image as any).selection.data as Uint8ClampedArray
    this.data = new ImageData(array, r2 - r1, c2 - c1)
  }

  public toJSON(): FaceJsonObject {
    const {
      facialLandmark,
      boundingBox,
      confidence,
      _embedding,
      box,
    } = this

    return {
      facialLandmark,
      boundingBox,
      confidence,
      _embedding,
      box,
    }
  }

  public static fromJSON(obj: FaceJsonObject | string): Face {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj) as FaceJsonObject
    }

    // const face = new Face()
    // face.id             = ++Face.id
    // face.facialLandmark = obj.facialLandmark
    // face.boundingBox    = obj.boundingBox
    // face.confidence     = obj.confidence
    // face._embedding     = obj._embedding
    // face.box            = obj.box

    // const image = new FaceImage(obj.parentImageUrl)

    return {} as any
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

    let w   = x1 - x0
    let h  = y1 - y0

    const halfDiff = Math.abs(w - h) / 2

    if (w > h) {
      y0 -= halfDiff
      y1 += halfDiff
      h = y1 - y0  // update
    } else {
      x0 -= halfDiff
      x1 += halfDiff
      w = x1 - x0   // update
    }

    // const margin = width / 10
    // console.log('margin:', margin)

    const x = Math.round(x0)
    const y = Math.round(y0)

    return {
      x, y,
      w, h,
    }
  }

  public center(): Point {
    const {x, y, w, h} = this.boundingBox
    const cx = w / 2 + x
    const cy = h / 2 + y
    return {x: cx, y: cy}
  }

  public width(): number {
    return this.boundingBox.w
  }

  public height(): number {
    return this.boundingBox.h
  }

  public image(): FaceImage {

    const {x, y, w, h} = this.boundingBox
    const [r1, c1, r2, c2] = [y, x, y + h, x + w]
    const img = nj.array(this.data.data, 'uint8_clamped')
                  .hi(r2, c2)
                  .lo(r1, c1) as any

    return new FaceImage(img)
  }
}
