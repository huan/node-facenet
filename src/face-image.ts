/**
 *
 */
import * as crypto  from 'crypto'
import * as nj      from 'numjs'

export type FaceImageData = nj.NdArray<Uint8Array>

export class FaceImage {
  public url: string

  private _data: FaceImageData

  constructor(
    urlOrData: string | FaceImageData,
  ) {
    if (typeof urlOrData === 'string') {
      this.url = urlOrData
      // lazy load this_data
    } else {  // if (urlOrData instanceof ImageData) {
      this._data  = urlOrData
      this.url    = this.calcMd5(urlOrData)
    }
  }

  public toString(): string {
    return `Image<${this.url}>`
  }

  public data(): FaceImageData {
    if (!this._data) {
      this._data = nj.images.read(this.url) as any as FaceImageData
    }
    return this._data
  }

  public resize(width: number, height: number): FaceImage {
    const data = nj.images.resize(this.data() as any, height, width) as any as FaceImageData
    return new FaceImage(data)
  }

  public calcMd5(data: FaceImageData): string {
    return crypto
            .createHash('md5')
            .update(new Buffer(data.tolist()))
            .digest('hex')
  }
}
