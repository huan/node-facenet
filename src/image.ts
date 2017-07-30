/**
 *
 */
import * as crypto  from 'crypto'
import * as nj      from 'numjs'

export type ImageData = nj.NdArray<Uint8Array>

export class Image {
  public url: string

  private _data: ImageData

  constructor(
    urlOrData: string | ImageData,
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

  public data(): ImageData {
    if (!this._data) {
      this._data = nj.images.read(this.url) as any as ImageData
    }
    return this._data
  }

  public resize(width: number, height: number): Image {
    const data = nj.images.resize(this.data() as any, height, width) as any as ImageData
    return new Image(data)
  }

  public calcMd5(data: ImageData): string {
    return crypto
            .createHash('md5')
            .update(new Buffer(data.tolist()))
            .digest('hex')
  }
}
