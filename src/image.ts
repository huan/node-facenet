/**
 *
 */
import * as nj from 'numjs'

export type ImageArray = nj.NdArray<Uint32Array>

export class Image {
  constructor() {
    // throw new Error('static class')
  }

  public toString(): string {
    return 'image!'
  }

  public static load(url: string): ImageArray {
    return nj.images.read(url)
  }
}
