/**
 *
 */
import * as nj from 'numjs'

import { Image } from './image'

export type Point = [number, number]
export type FacialLandmarkPoints = [Point, Point, Point, Point, Point]

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
  public facialLandmark:  FacialLandmark
  public boundingBox:     BoundingBox

  private _embedding: nj.NdArray

  constructor(
    public parentImage: Image,
    private box: number[],         // Bounding Box
    mark: FacialLandmarkPoints,  // Facial Landmark
    confidence: number,
  ) {
    this.facialLandmark = {
      leftEye:          mark[0],
      rightEye:         mark[1],
      nose:             mark[2],
      leftMouthCorner:  mark[3],
      rightMouthCorner: mark[4],
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
    return `Face<${this.parentImage.url}#${this.box.join(',')}`
  }

  public embedding(): nj.NdArray
  public embedding(embedding: nj.NdArray): void

  public embedding(embedding?: nj.NdArray): void | nj.NdArray {
    if (embedding) {
      if (this._embedding) {
        throw new Error('already had embedding!')
      }
      this._embedding = embedding
    } else if (!this._embedding) {
      throw new Error('no embedding yet!')
    }
    if (this._embedding.shape[0] !== 128) {
      throw new Error('embedding dim is not 128!')
    }
    return this._embedding
  }

  public image(): Image {
    // TODO corp the face out of parent image
    return this.parentImage
  }

  // public save(imageType: 'png' | 'jpg') {

  // }

}
