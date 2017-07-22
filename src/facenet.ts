import * as ndarray from 'ndarray'
const nj = require('numjs')

export type FeatureVector = number[]  // 128 dim

export class Facenet {

  constructor() {
    // TODO
  }

  /**
   * Get the 128 dims embeding from image(s)
   */
  public embeding(image: ndarray): FeatureVector[] {
    console.log(image)
    // TODO
    return [[1, 2, 3]]
  }

  public distance(embedding1: FeatureVector, embedding2: FeatureVector): number {
    return nj.linalg.distance(embedding1, embedding2)
  }
}
