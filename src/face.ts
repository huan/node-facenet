/**
 *
 */
import * as nj from 'numjs'

import { FaceImage } from './face-image'

export type Point = [number, number]
export type FacialLandmarkPoints = [Point, Point, Point, Point, Point]
export type FaceEmbedding = nj.NdArray<number>  // 128 dim

export interface BoundingBox {
  y1:  number,
  x1:  number,
  x2:  number,
  y2:  number,
  confidence?: number,
}

export interface FacialLandmark {
  [idx: string]:    Point,
  leftEye:          Point,
  rightEye:         Point,
  nose:             Point,
  leftMouthCorner:  Point,
  rightMouthCorner: Point,
}

export class Face {
  public static id = 0
  public id: number

  public facialLandmark:  FacialLandmark
  public boundingBox:     BoundingBox

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

  public init(
    parentImage: FaceImage,
    box: number[],        // Bounding Box
    marks: FacialLandmarkPoints,  // Facial Landmark
    confidence: number,
  ): void {
    this.parentImage = parentImage
    this.box = box

    this.facialLandmark = {
      leftEye:          marks[0],
      rightEye:         marks[1],
      nose:             marks[2],
      leftMouthCorner:  marks[3],
      rightMouthCorner: marks[4],
    }

    this.boundingBox = {
      x1:  Math.round(box[0]),
      y1:  Math.round(box[1]),
      x2:  Math.round(box[2]),
      y2:  Math.round(box[3]),
      confidence,
    }
  }

  public toString(): string {
    return `Face<${this.parentImage.url}#${this.box.join(',')}#${this._embedding}`
  }

  public image(): FaceImage {
    const data = this.parentImage.data

    const {x1, y1, x2, y2} = this.boundingBox
    const [r1, c1, r2, c2] = [y1, x1, y2, x2]
    const img = data.hi(r2, c2).lo(r1, c1) as any
    return new FaceImage(img)
  }
}
