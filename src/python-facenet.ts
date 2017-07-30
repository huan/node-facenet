import * as nj    from 'numjs'
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
    let PYTHONPATH = [
      `${__dirname}/../../python-facenet/src/`,
      `${__dirname}/`,
    ].join(':')
    if (process.env['PYTHONPATH']) {
      PYTHONPATH += ':' + process.env['PYTHONPATH']
    }

    this.python = pythonBridge({
      python: 'python3',
      env: {
        PYTHONPATH,
        TF_CPP_MIN_LOG_LEVEL,
      },
    })
  }

  // /**
  //  * XXX: we need not to care about session.close()(?)
  //  */
  // public async init(): Promise<void> {
  //   await this.initFacenet()
  //   await this.initMtcnn()
  // }

  // public async initPythonBridge(): Promise<void> {
  // }

  public async initFacenet(): Promise<void> {
    if (this.facenetInited) {
      return
    }
    // await this.initPythonBridge()

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
    // await this.initPythonBridge()

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
  public async align(data: number[][][]): Promise<[BoundingBox[], Landmark[]]> {
    await this.initMtcnn()
    // const jsonText = JSON.stringify(data)

    const row     = data.length
    const column  = data[0].length
    const depth   = data[0][0].length

    const flattenData = nj.array(data).flatten().tolist() as number[]

    const typedData = new Uint8Array(flattenData)
    const base64Text = new Buffer(typedData).toString('base64')

    let boundingBoxes: BoundingBox[]
    let landmarks: Landmark[]
    [boundingBoxes, landmarks] = await this.python
      `mtcnn_bridge.align(${base64Text}, ${row}, ${column}, ${depth})`

    return [boundingBoxes, landmarks]
  }

  /**
   *
   * @param data
   */
  public async embedding(data: number[][][]): Promise<number[]> {
    await this.initFacenet()

    const row     = data.length
    const column  = data[0].length
    const depth   = data[0][0].length

    const flattenData = nj.array(data).flatten().tolist() as number[]

    const typedData = new Uint8Array(flattenData)
    const base64Text = new Buffer(typedData).toString('base64')

    const embedding: number[] = await this.python
      `facenet_bridge.embedding(${base64Text}, ${row}, ${column}, ${depth})`

    return embedding
  }

  // public async json_parse(text: string): Promise<any> {
  //   await this.initPythonBridge()
  //   await this.python.ex`from facenet_bridge import json_parse`
  //   return await this.python`json_parse(${text})`
  // }

  public async base64_to_image(
    text:   string,
    row:    number,
    col:    number,
    depth:  number,
  ): Promise<number[][][]> {
    // await this.initPythonBridge()
    await this.python.ex`from facenet_bridge import base64_to_image`
    return await this.python`base64_to_image(${text}, ${row}, ${col}, ${depth})`
  }

}
