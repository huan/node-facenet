import * as path  from 'path'

import { log }    from 'brolog'
import * as nj    from 'numjs'
import {
  pythonBridge,
  PythonBridge,
}                 from 'python-bridge'

export type BoundingBox = [
  number, number, number, number, // x1, y1, x2, y2
  number                          // confidence
]
export type Landmark = number[]

export class PythonFacenet {
  public python3: PythonBridge

  private facenetInited = false
  private mtcnnInited   = false

  private SRC   = __dirname
  // python -m venv $VENV: the directory of vent
  private VENV  = path.normalize(`${__dirname}/../python3`)

  constructor() {
    log.verbose('PythonFacenet', 'constructor() SRC=%s, VIRTUAL_ENV=%s',
                              this.SRC,
                              this.VENV,
              )

    this.initVenv()
    this.python3 = this.initBridge()
  }

  public initVenv(): void {
    log.verbose('PythonFacenet', 'initVenv()')

    const PATH = `${this.VENV}/bin:` + process.env['PATH']

    Object.assign(process.env, {
      VIRTUAL_ENV: this.VENV,
      PATH,
    })

    delete process.env['PYTHONHOME']
  }

  public initBridge(): PythonBridge {
    log.verbose('PythonFacenet', 'initBridge()')

    const TF_CPP_MIN_LOG_LEVEL  = '2'  // suppress tensorflow warnings

    let PYTHONPATH = [
      `${this.VENV}/facenet/src`,
      this.SRC,
    ].join(':')

    if (process.env['PYTHONPATH']) {
      PYTHONPATH += ':' + process.env['PYTHONPATH']
    }

    Object.assign(process.env, {
        PYTHONPATH,
        TF_CPP_MIN_LOG_LEVEL,
    })

    const bridge = pythonBridge({
      python: 'python3',
    })

    return bridge
  }

  public async initFacenet(): Promise<void> {
    log.verbose('PythonFacenet', 'initFacenet()')

    if (this.facenetInited) {
      return
    }

    const start = Date.now()
    await this.python3.ex`
      from facenet_bridge import FacenetBridge
      facenet_bridge = FacenetBridge()
      facenet_bridge.init()
    `
    log.silly('PythonFacenet', 'initFacenet() facenet_bridge.init() cost %d milliseconds',
                                Date.now() - start,
            )

    this.facenetInited = true
  }

  public async initMtcnn(): Promise<void> {
    log.verbose('PythonFacenet', 'initMtcnn()')

    if (this.mtcnnInited) {
      return
    }

    const start = Date.now()
    // we need not to care about session.close()(?)
    await this.python3.ex`
      from facenet_bridge import MtcnnBridge
      mtcnn_bridge = MtcnnBridge()
      mtcnn_bridge.init()
    `
    log.silly('PythonFacenet', 'initMtcnn() mtcnn_bridge.init() cost milliseconds.',
                                Date.now() - start,
            )

    this.mtcnnInited = true
  }

  public async quit(): Promise<void> {
    log.verbose('PythonFacenet', 'quit()')
    if (!this.python3) {
      throw new Error('no phthon3 bridge inited yet!')
    }

    await this.python3.end()
    this.mtcnnInited = this.facenetInited = false
  }

  /**
   *
   * @param image
   */
  public async align(image: nj.NdArray<Uint8Array>): Promise<[BoundingBox[], Landmark[]]> {
    log.verbose('PythonFacenet', 'align(%s)', image.shape)
    await this.initMtcnn()

    const [row, col, depth] = image.shape
    const base64Text = this.image_to_base64(image)

    let boundingBoxes: BoundingBox[]
    let landmarks: Landmark[]

    const start = Date.now();
    [boundingBoxes, landmarks] = await this.python3
      `mtcnn_bridge.align(${base64Text}, ${row}, ${col}, ${depth})`

    log.silly('PythonFacenet', 'align() mtcnn_bridge.align() cost %d milliseconds',
                                Date.now() - start,
            )

    return [boundingBoxes, landmarks]
  }

  /**
   *
   * @param image
   */
  public async embedding(image: nj.NdArray<Uint8Array>): Promise<number[]> {
    log.verbose('PythonFacenet', 'embedding(%s)', image.shape)

    await this.initFacenet()

    const [row, col, depth] = image.shape
    const base64Text = this.image_to_base64(image)

    const start = Date.now();

    const embedding: number[] = await this.python3
      `facenet_bridge.embedding(${base64Text}, ${row}, ${col}, ${depth})`

    log.silly('PythonFacenet', 'embedding() facenet_bridge.embedding() cost %d milliseconds',
                          Date.now() - start,
            )

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
    await this.python3.ex
      `from facenet_bridge import base64_to_image`

    return await this.python3
      `base64_to_image(${text}, ${row}, ${col}, ${depth}).tolist()`
  }

  /**
   * Deal with big file(e.g. 4000 x 4000 JPEG)
   * the following method will cause NODEJS HEAP MEMORY OUT(>1.5GB)
   *
   * MEMORY OUT 1: image.flatten()
   * MEMORY OUT 2: [].concat.apply([], arrays);
   * MEMORY OUT 3: image.reshape()
   *
   * @param image
   */
  public image_to_base64(image: nj.NdArray<Uint8Array>): string {
    const [row, col, depth] = image.shape

    const typedData = new Uint8ClampedArray(row * col * depth)

    let n = 0
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        for (let k = 0; k < depth; k++) {
          typedData[n++] = image.get(i, j, k) as any as number
        }
      }
    }

    const base64Text = Buffer.from(typedData.buffer)
                            .toString('base64')
    return base64Text
  }
}
