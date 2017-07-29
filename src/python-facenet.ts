import {
  pythonBridge,
  PythonBridge,
}                 from 'python-bridge'

export type Point       = [number, number]
export type BoundingBox = [number, number, number, number, number]
export type Landmark    = [Point, Point, Point, Point, Point]

const TF_CPP_MIN_LOG_LEVEL  = '2'  // suppress tensorflow warnings

export class PythonFacenet {
  private python: PythonBridge

  private facenetInited = false
  private mtcnnInited   = false

  constructor() {
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

  public async init(): Promise<void> {
    await this.initFacenet()
    await this.initMtcnn()
  }

  /**
   * XXX: we need not to care about session.close()(?)
   */
  public async initFacenet(): Promise<void> {
    if (this.facenetInited) {
      return
    }

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

  public async align(data: number[][]): Promise<[BoundingBox[], Landmark[]]> {
    await this.initMtcnn()

    console.log(data.length)
    console.log(data[0].length)
    console.log(data)
    const jsonText = JSON.stringify(data)
    console.log(jsonText)
    return await this.python`mtcnn_bridge.align(${jsonText})` // XXX

    // let boundingBoxes: BoundingBox[]
    // let landmarks: Landmark[]
    // [boundingBoxes, landmarks] = await this.python`mtcnn_bridge.align(${jsonData})`
    // return [boundingBoxes, landmarks]
  }

  public async embedding(data: number[][]): Promise<number[]> {
    await this.initFacenet()

    const jsonData = JSON.stringify(data)
    const embedding: number[] = await this.python`facenet_bridge.embedding(${jsonData})`
    return embedding
  }

  public async json_parse(text: string): Promise<any> {
    await this.python.ex`from facenet_bridge import json_parse`
    return await this.python`json_parse(${text})`
  }
}
