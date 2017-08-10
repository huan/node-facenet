/**
 *
 */
import * as nj from 'numjs'

import { FaceImage } from './face-image'

export type FaceEmbedding = nj.NdArray<number>  // 128 dim

export interface Point {
  x: number,
  y: number,
}

export interface BoundingBox {
  p1: Point,
  p2: Point,
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
  boundingBox:    BoundingBox,
  confidence:     number,
  _embedding:     FaceEmbedding,
  parentImageUrl: string,
  box:            number[],
}

export class Face {
  public static id = 0
  public id: number

  public facialLandmark:  FacialLandmark
  public boundingBox:     BoundingBox
  public confidence:      number

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

  public parentImage: FaceImage
  private box:        number[]

  constructor() {
    this.id = ++Face.id
  }

  public toJSON(): FaceJsonObject {
    const {
      facialLandmark,
      boundingBox,
      confidence,
      _embedding,
      parentImage,
      box,
    } = this

    const parentImageUrl = parentImage.url

    return {
      facialLandmark,
      boundingBox,
      confidence,
      _embedding,
      parentImageUrl,
      box,
    }
  }

  public static fromJSON(obj: FaceJsonObject | string): Face {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj) as FaceJsonObject
    }

    const face = new Face()
    face.id             = ++Face.id
    face.facialLandmark = obj.facialLandmark
    face.boundingBox    = obj.boundingBox
    face.confidence     = obj.confidence
    face._embedding     = obj._embedding
    face.box            = obj.box

    const image = new FaceImage(obj.parentImageUrl)
    face.parentImage    = image

    return face
  }

  public init(
    parentImage: FaceImage,
    box: number[],      // Bounding Box
    marks: number[][],  // Facial Landmark
    confidence: number,
  ): void {
    this.box          = box
    this.confidence   = confidence
    this.parentImage  = parentImage

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

    this.boundingBox = this.adjustBox(box)
  }

  public toString(): string {
    return `Face#${this.id}<${this.parentImage.url}#${this.box.join(',')}#${this._embedding}`
  }

  public adjustBox(box: number[]): BoundingBox {
    let x1 = box[0]
    let y1 = box[1]
    let x2 = box[2]
    let y2 = box[3]

    let width   = x2 - x1
    let height  = y2 - y1

    const halfDiff = Math.abs(width - height) / 2

    if (width > height) {
      y1 -= halfDiff
      y2 += halfDiff
      height = y2 - y1  // update
    } else {
      x1 -= halfDiff
      x2 += halfDiff
      width = x2 - x1   // update
    }

    // const margin = width / 10
    // console.log('margin:', margin)

    // x1 -= margin
    // y1 -= margin

    // x2 += margin
    // y2 += margin

    const p1: Point = {
      x:  Math.round(x1),
      y:  Math.round(y1),
    }

    const p2: Point = {
      x:  Math.round(x2),
      y:  Math.round(y2),
    }

    return {
      p1,
      p2,
    }
  }

  public center(): Point {
    const {p1, p2} = this.boundingBox
    const x = (p2.x - p1.x) / 2 + p1.x
    const y = (p2.y - p1.y) / 2 + p1.y
    return {x, y}
  }

  public width(): number {
    const b = this.boundingBox
    return b.p2.x - b.p1.x
  }

  public height(): number {
    const {p1, p2} = this.boundingBox
    return p2.y - p1.y
  }

  public image(): FaceImage {
    const data = this.parentImage.data

    const {p1, p2} = this.boundingBox
    const [r1, c1, r2, c2] = [p1.y, p1.x, p2.y, p2.x]
    const img = data.hi(r2, c2).lo(r1, c1) as any
    return new FaceImage(img)
  }
}
