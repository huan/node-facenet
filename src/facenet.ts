import * as nj            from 'numjs'

import {
  FaceEmbedding,
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
const MIN_FACE_SIZE       = 40
const MIN_FACE_CONFIDENCE = 0.95

// Interface for Cache
export interface Alignable {
  align(imageData: ImageData | string): Promise<Face[]>,
}

// Interface for Cache
export interface Embeddingable {
  embedding(face: Face): Promise<FaceEmbedding>,
}

export class Facenet implements Alignable, Embeddingable {
  private pythonFacenet: PythonFacenet

  constructor() {
    log.verbose('Facenet', `constructor() v${VERSION}`)
    this.pythonFacenet = new PythonFacenet()
  }

  public async init(): Promise<void> {
    await this.initFacenet()
    await this.initMtcnn()
  }

  public async initFacenet(): Promise<void> {
    log.verbose('Facenet', 'initFacenet()')
    const start = Date.now()
    await this.pythonFacenet.initFacenet()
    log.verbose('Facenet', 'initFacenet() cost %d milliseconds', Date.now() - start)
  }

  public async initMtcnn(): Promise<void> {
    log.verbose('Facenet', 'initMtcnn()')
    const start = Date.now()
    await this.pythonFacenet.initMtcnn()
    log.verbose('Facenet', 'initMtcnn() cost %d milliseconds', Date.now() - start)
  }

  public async quit(): Promise<void> {
    log.verbose('Facenet', 'quit()')
    await this.pythonFacenet.quit()
  }

  /**
   * Alignment the image, get faces list
   * @param image
   */
  public async align(imageData: ImageData | string): Promise<Face[]> {
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
   * Get the 128 dims embeding from image(s)
   */
  public async embedding(face: Face): Promise<FaceEmbedding> {
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

    if (imageData.width !== 160) {
      log.verbose('Facenet', 'embedding(%dx%d) got a face not 160x160, resizing...',
                            imageData.width, imageData.height)
      imageData = await resizeImage(imageData, 160, 160)
    }

    const embedding = await this.pythonFacenet.embedding(imageData)

    // Set embedding to face
    // face.embedding =  nj.array(embedding)

    return nj.array(embedding)
  }

  public transformMtcnnLandmarks(landmarks: number[][]): number[][][] {
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

  public squareBox(box: number[]): number[] {
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

  public distance(face: Face, faceList: Face[]): number[] {
    if (!face.embedding) {
      throw new Error('no face embedding!')
    }
    for (const aFace of faceList) {
      if (!aFace.embedding) {
        throw new Error('no aFace embedding!')
      }
    }
    const embeddingList     = faceList.map(f => f.embedding)
    const embeddingNdArray  = nj.stack<number>(embeddingList as any)

    return distance(
      face.embedding,
      embeddingNdArray,
    )
  }
}
