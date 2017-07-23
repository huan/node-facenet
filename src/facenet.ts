import { promisify } from 'util'

import * as ndarray from 'ndarray'

const distance  = require('ndarray-distance')
const getPixels = require('get-pixels')
// const nj        = require('numjs')

import { PythonFacenet } from './python-facenet'

export type FeatureVector = ndarray  // 128 dim
export type ImageVector   = ndarray

export interface FaceRect {
  top:    number,
  left:   number,
  width:  number,
  height: number,
}

export class Facenet {
  private pythonFacenet: PythonFacenet

  constructor() {
    //
  }

  public async init(): Promise<void> {
    this.pythonFacenet = new PythonFacenet()
    await this.pythonFacenet.init()
  }

  public async image(url: string): Promise<ImageVector> {
    return await promisify(getPixels)(url)
  }

  public async scan(image: ImageVector): Promise<FaceRect[]> {
    const top     = 0
    const left    = 0
    const height  = image.shape[0]
    const width   = image.shape[1]
    return [{
      top,
      left,
      width,
      height,
    }]
  }

  /**
   * Get the 128 dims embeding from image(s)
   */
  public async embeding(image: ImageVector): Promise<FeatureVector[]> {
    console.log(image)
    // TODO
    return [ndarray([1, 2, 3])]
  }

  public distance(embedding1: FeatureVector, embedding2: FeatureVector): number {
    return distance(embedding1, embedding2)
  }
}
