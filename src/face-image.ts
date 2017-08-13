/**
 *
 */
import * as nj      from 'numjs'

// const canvas = require('canvas')

import { Face }     from './face'
import { md5 }      from './misc'

export type FaceImageData = nj.NdArray<Uint8Array>

export class FaceImage {
  public static id = 0
  public id: number

  public url: string

  public get data(): FaceImageData {
    if (!this._data) {
      if (!this.url) {
        throw new Error('no url!')
      }
      this._data = nj.images.read(this.url) as FaceImageData
    }
    return this._data
  }
  public set data(image: FaceImageData) {
    this._data = image
    this.url    = md5(image)
  }
  private _data: FaceImageData

  constructor(
    urlOrData: string | FaceImageData,
  ) {
    this.id = ++FaceImage.id

    if (typeof urlOrData === 'string') {
      this.url = urlOrData
      // lazy load this_data
    } else {  // if (urlOrData instanceof ImageData) {
      this.data  = urlOrData
    }
  }

  public toString(): string {
    return `Image#${this.id}<${this.url}>`
  }

  public resize(width: number, height: number): FaceImage {
    const [row, col] = [height, width]
    const data = nj.images.resize(this.data, row, col) as FaceImageData
    return new FaceImage(data)
  }

  public width(): number {
    return this.data.shape[1] // cols
  }

  public height(): number {
    return this.data.shape[1] // rows
  }

  public save(file: string): void {
    nj.images.save(this.data, file)
  }

  public asFace(): Face {
    const imageData = new ImageData(
      (this.data as any).selection.data,
      this.width(),
      this.height(),
    )
    const face = new Face(imageData, [0, 0, this.width(), this.height()])
    face.init(
      [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
      1,
    )
    return face
  }
}
