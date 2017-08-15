
import * as nj            from 'numjs'

import {
  Face,
}                         from './face'
// import { FaceImage }      from './face-image'
import {
  FaceEmbedding,
  log,
  VERSION,
}                         from './config'
import {
  PythonFacenet,
}                         from './python-facenet'

import {
  imageToData,
  loadImage,
  resizeImage,
}                         from './misc'

// export interface FacenetOptions {
//   log?: LogLevelName
// }

export class Facenet {
  private pythonFacenet: PythonFacenet

  constructor() {
    log.info('Facenet', `constructor() v${VERSION}`)
    this.pythonFacenet = new PythonFacenet()
  }

  public async init(): Promise<void> {
    await this.initFacenet()
    await this.initMtcnn()
  }

  public async initFacenet(): Promise<void> {
    log.info('Facenet', 'initFacenet()')
    const start = Date.now()
    await this.pythonFacenet.initFacenet()
    log.info('Facenet', 'initFacenet() cost %d milliseconds', Date.now() - start)
  }

  public async initMtcnn(): Promise<void> {
    log.info('Facenet', 'initMtcnn()')
    const start = Date.now()
    await this.pythonFacenet.initMtcnn()
    log.info('Facenet', 'initMtcnn() cost %d milliseconds', Date.now() - start)
  }

  public async quit(): Promise<void> {
    log.info('Facenet', 'quit()')
    await this.pythonFacenet.quit()
  }

  /**
   * Alignment the image, get faces list
   * @param image
   */
  public async align(imageData: ImageData | string): Promise<Face[]> {
    if (typeof imageData === 'string') {
      const image = await loadImage(imageData)
      imageData = imageToData(image)
    }
    log.verbose('Facenet', 'align(%dx%d)', imageData.width, imageData.height)

    log.silly('Facenet', 'align() pythonFacenet.align() ...')
    const [boundingBoxes, landmarks] = await this.pythonFacenet.align(imageData)
    log.silly('Facenet', 'align() pythonFacenet.align() done')

    const xyLandmarks = this.transformMtcnnLandmarks(landmarks)

    const faceList: Face[] = []
    for (const i in boundingBoxes) {
      const boundingBox = boundingBoxes[i]
      const confidence = boundingBox[4]
      const marks = xyLandmarks[i]

      const face = new Face(imageData, boundingBox)
      face.init(marks, confidence)
      // face.confidence(confidence)
      // face.landmarks(marks)
      faceList.push(face)
    }

    return faceList
  }

  /**
   * Get the 128 dims embeding from image(s)
   */
  public async embedding(face: Face): Promise<FaceEmbedding> {
    log.verbose('Facenet', 'embedding(Face#%d)', face.id)

    let imageData = face.imageData
    if (imageData.width !== imageData.height) {
      throw new Error('should be a square image because it will be resized to 160x160')
    }

    if (imageData.width !== 160) {
      imageData = await resizeImage(imageData, 160, 160)
    }

    const embedding = await this.pythonFacenet.embedding(imageData)

    // Set embedding to face
    face.embedding =  nj.array(embedding)

    return face.embedding
  }

  public distance(v1: FaceEmbedding, v2: FaceEmbedding): number {
    const l2 = v1.subtract(v2)
                  .pow(2)
                  .sum()

    return nj.sqrt(l2)
            .get(0)
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
      nj.array(tLandmarks).slice(null as any, [null, 5] as any),
      false,
    )
    yLandmarks.assign(
      nj.array(tLandmarks).slice(null as any, [5, 10] as any),
      false,
    )

    const pairedLandmarks = xyLandmarks.reshape(faceNum, 5, 2) as nj.NdArray<number>  // number[][][]

    return pairedLandmarks.tolist() as any as number[][][]
  }

}

export {
  FaceEmbedding,
}
