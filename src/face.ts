/**
 *
 */
import * as nj from 'numjs'

import { Image } from './image'

export type Point = [number, number]
export type FacialLandmarkRawArray = [Point, Point, Point, Point, Point]

export interface BoundingBox {
  top:          number,
  left:         number,
  width:        number,
  height:       number,
  confidence?: number,
}

export interface FacialLandmark {
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
    box: number[],              // Bounding Box
    mark: FacialLandmarkRawArray,  // Facial Landmark
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
      top:    box[0],
      left:   box[1],
      width:  box[3] - box[0],
      height: box[4] - box[1],
      confidence,
    }
  }

  public toString(): string {
    return `Face<${this.parentImage.url}#${this.boundingBox}`
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
