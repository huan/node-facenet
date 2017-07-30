import { log }    from 'brolog'
import * as nj    from 'numjs'

import {
  Face,
  FacialLandmarkPoints,
}                         from './face'
import { Image }          from './image'
import { PythonFacenet }  from './python-facenet'

export type FeatureVector = nj.NdArray<number>  // 128 dim

export class Facenet {
  private pythonFacenet: PythonFacenet

  constructor() {
    // Do not put this.puthonFacenet initialization here,
    // because it will force us to call quit() with init()
    this.pythonFacenet = new PythonFacenet()
  }

  public async init(): Promise<void> {
    await this.initFacenet()
    await this.initMtcnn()
  }

  public async initFacenet(): Promise<void> {
    await this.pythonFacenet.initFacenet()
  }

  public async initMtcnn(): Promise<void> {
    await this.pythonFacenet.initMtcnn()
  }

  public async quit(): Promise<void> {
    await this.pythonFacenet.quit()
  }

  /**
   * Alignment the image, get faces list, ordered with biggest first
   * @param image
   */
  public async align(image: Image): Promise<Face[]> {
    log.verbose('Facenet', 'align()')

    const data = image.data()
                      .tolist() as any as number[][][]

    log.silly('Facenet', 'align() pythonFacenet.align(data) ...')
    const [boundingBoxes, landmarks] = await this.pythonFacenet.align(data)
    log.silly('Facenet', 'align() pythonFacenet.align(data) done')

    const xyLandmarks = this.transformLandmarks(landmarks)

    const faceList: Face[] = []
    for (const i in boundingBoxes) {
      const box = boundingBoxes[i]
      const confidence = box[4]
      const mark = xyLandmarks[i]
      faceList.push(new Face(
        image,
        box,
        mark,
        confidence,
      ))
    }

    return faceList
  }

  /**
   * Get the 128 dims embeding from image(s)
   */
  public async embedding(face: Face): Promise<FeatureVector> {
    const data = face.image()
                    .resize(160, 160)
                    .data()
                    .tolist() as any as number[][][]
    const embedding = await this.pythonFacenet.embedding(data)

    const njEmb =  nj.array(embedding)
    face.embedding(njEmb)
    return njEmb
  }

  public distance(v1: FeatureVector, v2: FeatureVector): number {
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
