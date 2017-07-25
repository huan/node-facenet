/**
 *
 */
const nj = require('numjs')

export class Image {
  constructor() {
    // throw new Error('static class')
  }

  public toString(): string {
    return 'image!'
  }

  public static load(url: string): any {
    return nj.images.read(url)
  }
}
