/**
 *
 */
import * as crypto  from 'crypto'
import * as nj      from 'numjs'

import { Face }     from './face'

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
    this.url    = this.calcMd5(image)
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
    return `Image<${this.url}>`
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

  public calcMd5(data: FaceImageData): string {
    return crypto
            .createHash('md5')
            .update(new Buffer(data.tolist()))
            .digest('hex')
  }

  public save(file: string): void {
    nj.images.save(this.data, file)
  }

  public asFace(): Face {
    const face = new Face()
    face.init(
      this,
      [0, 0, this.width(), this.height()],
      [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
      1,
    )
    return face
  }
}
