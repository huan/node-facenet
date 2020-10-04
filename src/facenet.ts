import nj            from 'numjs'

import {
  FaceEmbedding,
  INPUT_FACE_SIZE,
  log,
  VERSION,
}                         from './config'
import {
  Face,
}                         from './face'
import {
  distance,
  imageToData,
  loadImage,
  resizeImage,
}                         from './misc'

import {
  PythonFacenet,
}                         from './python3/python-facenet'

// minimum width/height of the face image.
// the standard shape of face for facenet is 160x160
// 40 is 1/16 of the low resolution
// Update 2017/11/23: loose the limitation from 40 to 0
const MIN_FACE_SIZE       = 0
const MIN_FACE_CONFIDENCE = 0.5

// Interface for Cache
export interface Alignable {
  align(imageData: ImageData | string): Promise<Face[]>,
}

// Interface for Cache
export interface Embeddingable {
  embedding(face: Face): Promise<FaceEmbedding>,
}

/**
 *
 * Facenet is designed for bring the state-of-art neural network with bleeding-edge technology to full stack developers
 * Neural Network && pre-trained model && easy to use APIs
 * @class Facenet
 */
export class Facenet implements Alignable, Embeddingable {

  private pythonFacenet: PythonFacenet

  constructor () {
    log.verbose('Facenet', `constructor() v${VERSION}`)
    this.pythonFacenet = new PythonFacenet()
  }

  public version (): string {
    return VERSION
  }

  /**
   *
   * Init facenet
   * @returns {Promise<void>}
   */
  public async init (): Promise<void> {
    await this.initFacenet()
    await this.initMtcnn()
  }

  /**
   * @private
   */
  public async initFacenet (): Promise<void> {
    log.verbose('Facenet', 'initFacenet()')
    const start = Date.now()
    await this.pythonFacenet.initFacenet()
    log.verbose('Facenet', 'initFacenet() cost %d milliseconds', Date.now() - start)
  }

  /**
   * @private
   */
  public async initMtcnn (): Promise<void> {
    log.verbose('Facenet', 'initMtcnn()')
    const start = Date.now()
    await this.pythonFacenet.initMtcnn()
    log.verbose('Facenet', 'initMtcnn() cost %d milliseconds', Date.now() - start)
  }

  /**
   *
   * Quit facenet
   * @returns {Promise<void>}
   */
  public async quit (): Promise<void> {
    log.verbose('Facenet', 'quit()')
    await this.pythonFacenet.quit()
  }

  /**
   *
   * Do face alignment for the image, return a list of faces.
   * @param {(ImageData | string)} imageData
   * @returns {Promise<Face[]>} - a list of faces
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * console.info(faceList)
   * // Output
   * // [ Face {
   * //     id: 0,
   * //     imageData: ImageData { data: [Object] },
   * //     confidence: 0.9999634027481079,
   * //     landmark:
   * //      { leftEye: [Object],
   * //        rightEye: [Object],
   * //        nose: [Object],
   * //        leftMouthCorner: [Object],
   * //        rightMouthCorner: [Object] },
   * //      location: { x: 360, y: 94, w: 230, h: 230 },
   * //      md5: '003c926dd9d2368a86e41a2938aacc98' },
   * //   Face {
   * //     id: 1,
   * //     imageData: ImageData { data: [Object] },
   * //     confidence: 0.9998626708984375,
   * //     landmark:
   * //      { leftEye: [Object],
   * //        rightEye: [Object],
   * //        nose: [Object],
   * //        leftMouthCorner: [Object],
   * //        rightMouthCorner: [Object] },
   * //     location: { x: 141, y: 87, w: 253, h: 253 },
   * //     md5: '0451a0737dd9e4315a21594c38bce485' } ]
   * // leftEye: [Object],rightEye: [Object],nose: [Object],leftMouthCorner: [Object],rightMouthCorner: [Object] -- Object is Point, something like { x: 441, y: 181 }
   * // imageData: ImageData { data: [Object] } -- Object is Uint8ClampedArray
   */
  public async align (imageData: ImageData | string): Promise<Face[]> {
    if (typeof imageData === 'string') {
      log.verbose('Facenet', 'align(%s)', imageData)
      const image = await loadImage(imageData)
      imageData = imageToData(image)
    } else {
      log.verbose('Facenet', 'align(%dx%d)', imageData.width, imageData.height)
    }

    const [boundingBoxes, landmarks] = await this.pythonFacenet.align(imageData)
    log.silly('Facenet', 'align() pythonFacenet.align() done: %s', boundingBoxes)

    const xyLandmarks = this.transformMtcnnLandmarks(landmarks)

    const faceList: Face[] = []
    for (const i in boundingBoxes) {
      const boundingBox = this.squareBox(boundingBoxes[i])
      const confidence = boundingBoxes[i][4]
      const marks = xyLandmarks[i]

      // boundary out of image
      if (boundingBox[0] < 0 || boundingBox[1] < 0
        ||  boundingBox[2] > imageData.width
        ||  boundingBox[3] > imageData.height
      ) {
        log.silly('Facenet', 'align(%dx%d) box[%s] out of boundary, skipped',
          imageData.width, imageData.height,
          boundingBox)
        continue
      }

      const face = new Face(imageData)
      await face.init({
        boundingBox,
        landmarks: marks,
        confidence,
      })

      if (face.width < MIN_FACE_SIZE) {
        log.verbose('Facenet', 'align() face skipped because width(%s) is less than MIN_FACE_SIZE(%s)',
          face.width, MIN_FACE_SIZE)
        continue
      }
      if ((face.confidence || 0) < MIN_FACE_CONFIDENCE) {
        log.verbose('Facenet', 'align() face skipped because confidence(%s) is less than MIN_FACE_CONFIDENCE(%s)',
          face.confidence, MIN_FACE_CONFIDENCE)
        continue
      }

      faceList.push(face)
    }

    return faceList
  }

  /**
   *
   * Calculate Face Embedding, get the 128 dims embeding from image(s)
   *
   * @param {Face} face
   * @returns {Promise<FaceEmbedding>} - return feature vector
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * for (const face of faceList) {
   *   face.embedding = await facenet.embedding(face)
   * }
   * // Output, there are two faces in the picture, so return two 128 dims array
   * // array([ 0.03132, 0.05678, 0.06192, ..., 0.08909, 0.16793,-0.05703])
   * // array([ 0.03422,-0.08358, 0.03549, ..., 0.07108, 0.14013,-0.01417])
   */
  public async embedding (face: Face): Promise<FaceEmbedding> {
    log.verbose('Facenet', 'embedding(%s)', face)

    let imageData = face.imageData
    if (!imageData) {
      throw new Error('no imageData!')
    }
    if (imageData.width !== imageData.height) {
      log.warn('Facenet', 'embedding(%s) %dx%d not square!',
        face, imageData.width, imageData.height)
      throw new Error('should be a square image because it will be resized to 160x160')
    }

    if (imageData.width !== INPUT_FACE_SIZE) {
      log.verbose('Facenet', 'embedding(%dx%d) got a face not 160x160, resizing...',
        imageData.width, imageData.height)
      imageData = await resizeImage(
        imageData,
        INPUT_FACE_SIZE,
        INPUT_FACE_SIZE,
      )
    }

    const embedding = await this.pythonFacenet.embedding(imageData)

    // Set embedding to face
    // face.embedding =  nj.array(embedding)

    return nj.array(embedding)
  }

  /**
   * @private
   */
  public transformMtcnnLandmarks (landmarks: number[][]): number[][][] {
    // landmarks has a strange data structure:
    // https://github.com/kpzhang93/MTCNN_face_detection_alignment/blob/bace6de9fab6ddf41f1bdf1c2207c50f7039c877/code/codes/camera_demo/test.m#L70
    const tLandmarks = nj.array(landmarks.reduce((a, b) => a.concat(b), []))
      .reshape(10, -1)
      .T as nj.NdArray<number>

    const faceNum = tLandmarks.shape[0]

    const xyLandmarks = nj.zeros(tLandmarks.shape)
    const xLandmarks = xyLandmarks.slice(null as any, [null,  xyLandmarks.shape[1], 2] as any)
    const yLandmarks = xyLandmarks.slice(null as any, [1,     xyLandmarks.shape[1], 2] as any)
    xLandmarks.assign(
      tLandmarks.slice(null as any, [null, 5] as any),
      false,
    )
    yLandmarks.assign(
      tLandmarks.slice(null as any, [5, 10] as any),
      false,
    )

    const pairedLandmarks = xyLandmarks.reshape(faceNum, 5, 2) as nj.NdArray<number>  // number[][][]

    return pairedLandmarks.tolist() as any as number[][][]
  }

  /**
   * @private
   */
  public squareBox (box: number[]): number[] {
    let x0 = box[0]
    let y0 = box[1]
    let x1 = box[2]
    let y1 = box[3]

    // corner point: according to the canvas implementation:
    // it should include top left, but exclude bottom right.
    let w = x1 - x0
    let h = y1 - y0

    if (w !== h) {
      const halfDiff = Math.abs(w - h) / 2

      if (w > h) {
        y0 -= halfDiff
        y1 += halfDiff
      } else {
        x0 -= halfDiff
        x1 += halfDiff
      }
    }

    // update w & h
    w = x1 - x0
    h = y1 - y0

    // keep w === h
    x0 = Math.round(x0)
    y0 = Math.round(y0)
    x1 = Math.round(x0 + w)
    y1 = Math.round(y0 + h)

    log.silly('Facenet', 'squareBox([%s]) -> [%d,%d,%d,%d]',
      box, x0, y0, x1, y1)

    return [x0, y0, x1, y1]
  }

  public distance(face: Face, faceList: Face[]): number[]
  public distance(embedding: number[], embeddingList: number[][]): number[]
  /**
   * Get distance between a face an each face in the faceList.
   *
   * @param {Face} face
   * @param {Face[]} faceList
   * @returns {number[]}
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * for (const face of faceList) {
   * face.embedding = await facenet.embedding(face)
   * }
   * const faceInFaceList = faceList[0]
   * const distance = facenet.distance(faceInFaceList, faceList)
   * console.info('distance:', distance)
   * // Output:
   * // distance: [ 0, 1.2971515811057608 ]
   * // The first face comes from the imageFile, the exactly same face, so the first result is 0.
   */
  public distance (face: Face | number[], faceList: Face[] | number[][]): number[] {
    let embedding     : number[]
    let embeddingList : number[][]

    if (Array.isArray(face)) {
      embedding     = face
      embeddingList = faceList as number[][]
    } else {
      if (!face.embedding) {
        throw new Error('no face embedding!')
      }
      for (const theFace of (faceList as Face[])) {
        if (!theFace.embedding) {
          throw new Error('no aFace embedding!')
        }
      }
      embedding = face.embedding.tolist()
      embeddingList = (faceList as Face[]).map(f => (f.embedding as any).tolist())
      // const embeddingNdArray  = nj.stack<number>(embeddingList as any)
    }

    return distance(
      embedding,
      embeddingList,
    )
  }

}
