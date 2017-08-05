import {
  log,
  // LogLevelName,
}                         from 'brolog'
import * as nj            from 'numjs'

import {
  Face,
  FaceEmbedding,
  FacialLandmarkPoints,
}                         from './face'
import { FaceImage }      from './face-image'
import { VERSION }        from './config'
import { PythonFacenet }  from './python-facenet'

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
    await this.pythonFacenet.quit()
  }

  /**
   * Alignment the image, get faces list, ordered with biggest first
   * @param image
   */
  public async align(image: FaceImage): Promise<Face[]> {
    log.verbose('Facenet', 'align()')

    log.silly('Facenet', 'align() pythonFacenet.align(data) ...')
    const [boundingBoxes, landmarks] = await this.pythonFacenet.align(image.data)
    log.silly('Facenet', 'align() pythonFacenet.align(data) done')

    const xyLandmarks = this.transformLandmarks(landmarks)

    const faceList: Face[] = []
    for (const i in boundingBoxes) {
      const box = boundingBoxes[i]
      const confidence = box[4]
      const marks = xyLandmarks[i]

      const face = new Face()
      face.init(
        image,
        box,
        marks,
        confidence,
      )
      faceList.push(face)
    }

    return faceList
  }

  /**
   * Get the 128 dims embeding from image(s)
   */
  public async embedding(face: Face): Promise<FaceEmbedding> {
    let image = face.image()
    if (image.width() !== image.height()) {
      throw new Error('should be a square image because facenet expected input image of 160x160')
    }

    image = image.resize(160, 160)

    const embedding = await this.pythonFacenet.embedding(image.data)

    const njEmbedding =  nj.array(embedding)
    // Set embedding to face
    face.embedding = njEmbedding

    return njEmbedding
  }

  public async distance(f1: Face, f2: Face): Promise<number> {
    let v1, v2

    try {
      v1 = f1.embedding
    } catch (e) {
      v1 = await this.embedding(f1)
    }

    try {
      v2 = f2.embedding
    } catch (e) {
      v2 = await this.embedding(f2)
    }

    const l2 = v1.subtract(v2)
                  .pow(2)
                  .sum()
    return nj.sqrt(l2)
            .get(0)
  }

  public transformLandmarks(landmarks: number[][]): FacialLandmarkPoints[] {
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

    const pairedLandmarks = xyLandmarks.reshape(faceNum, 5, 2) as nj.NdArray<number>

    return pairedLandmarks.tolist() as any as FacialLandmarkPoints[]
  }

}
