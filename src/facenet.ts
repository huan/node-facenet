// import { promisify } from 'util'

// import * as ndarray from 'ndarray'

const distance  = require('ndarray-distance')
// const getPixels = require('get-pixels')
const nj        = require('numjs')

import { PythonFacenet }  from './python-facenet'
import { Image }          from './image'

export type FeatureVector = any  // 128 dim
export type ImageVector   = any

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

  /**
   * Get image data
   *
   * @param url
   * @return [width, height, channel] of image
   */
  public async image(url: string): Promise<ImageVector> {
    // return await promisify(getPixels)(url)
    return Image.load(url)
    // resized = nj.images.resize(img, H / 2, W / 2),
  }

  /**
   * Alignment the image, get faces list, ordered with biggest first
   * @param image
   */
  public async align(image: ImageVector): Promise<FaceRect[]> {
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
    return [nj.array([1, 2, 3])]
  }

  public distance(embedding1: FeatureVector, embedding2: FeatureVector): number {
    return distance(embedding1, embedding2)
  }
}
