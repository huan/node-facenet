import {
  pythonBridge,
  PythonBridge,
}                 from 'python-bridge'

export type BoundingBox = [
  number, number, number, number, // x1, y1, x2, y2
  number                          // confidence
]
export type Landmark    = number[]

const TF_CPP_MIN_LOG_LEVEL  = '2'  // suppress tensorflow warnings

export class PythonFacenet {
  private python: PythonBridge

  private facenetInited = false
  private mtcnnInited   = false

  constructor() {
    //
  }

  // /**
  //  * XXX: we need not to care about session.close()(?)
  //  */
  // public async init(): Promise<void> {
  //   await this.initFacenet()
  //   await this.initMtcnn()
  // }

  public async initPythonBridge(): Promise<void> {
    if (this.python) {
      return
    }
    this.python = pythonBridge({
      python: 'python3',
      env: {
        PYTHONPATH: [
          `${__dirname}/../../python-facenet/src/`,
          `${__dirname}/`,
        ].join(':'),
        TF_CPP_MIN_LOG_LEVEL,
      },
    })
  }

  public async initFacenet(): Promise<void> {
    if (this.facenetInited) {
      return
    }
    await this.initPythonBridge()

    await this.python.ex`
      from facenet_bridge import FacenetBridge
      facenet_bridge = FacenetBridge()
      facenet_bridge.init()
    `
    this.facenetInited = true
  }

  public async initMtcnn(): Promise<void> {
    if (this.mtcnnInited) {
      return
    }
    await this.initPythonBridge()

    // we need not to care about session.close()(?)
    await this.python.ex`
      from facenet_bridge import MtcnnBridge
      mtcnn_bridge = MtcnnBridge()
      mtcnn_bridge.init()
    `
    this.mtcnnInited = true
  }

  public async quit(): Promise<void> {
    await this.python.end()
    this.mtcnnInited = this.facenetInited = false
  }

  /**
   *
   * @param data
   */
  public async align(data: number[][]): Promise<[BoundingBox[], Landmark[]]> {
    await this.initMtcnn()
    const jsonText = JSON.stringify(data)

    let boundingBoxes: BoundingBox[]
    let landmarks: Landmark[]
    [boundingBoxes, landmarks] = await this.python`mtcnn_bridge.align(${jsonText})`
    return [boundingBoxes, landmarks]
  }

  /**
   *
   * @param data
   */
  public async embedding(data: number[][]): Promise<number[]> {
    await this.initFacenet()
    const jsonData = JSON.stringify(data)

    const embedding: number[] = await this.python`facenet_bridge.embedding(${jsonData})`
    return embedding
  }

  public async json_parse(text: string): Promise<any> {
    await this.initPythonBridge()
    await this.python.ex`from facenet_bridge import json_parse`
    return await this.python`json_parse(${text})`
  }
}
