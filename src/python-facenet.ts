import {
  pythonBridge,
  PythonBridge,
}                 from 'python-bridge'

export type Point       = [number, number]
export type BoundingBox = [number, number, number, number, number]
export type Landmark    = [Point, Point, Point, Point, Point]

export class PythonFacenet {
  private python: PythonBridge

  constructor() {
    this.python = pythonBridge({
      python: 'python3',
      env: {
        PYTHONPATH: `${__dirname}/../../python-facenet/src/`,
        TF_CPP_MIN_LOG_LEVEL: '2',  // suppress tensorflow warnings
      },
    })
  }

  public async init(): Promise<void> {
    // we need not to care about session.close()(?)
    await this.python.ex`
      from facenet_bridge import (MtcnnBridge, FacenetBridge)

      mtcnn_bridge = MtcnnBridge()
      facenet_bridge = FacenetBridge()

      mtcnn_bridge.init()
      facenet_bridge.init()
    `
  }

  public async quit(): Promise<void> {
    await this.python.end()
  }

  public async align(data: number[][]): Promise<[BoundingBox[], Landmark[]]> {
    const jsonData = JSON.stringify(data)
    let boundingBoxes: BoundingBox[]
    let landmarks: Landmark[]
    [boundingBoxes, landmarks] = await this.python`mtcnn_bridge.align(${jsonData})`
    return [boundingBoxes, landmarks]
  }

  public async embedding(data: number[][]): Promise<number[]> {
    const jsonData = JSON.stringify(data)
    const embedding: number[] = await this.python`facenet_bridge.embedding(${jsonData})`
    return embedding
  }
}
