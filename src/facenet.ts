// import * as ndarray from 'ndarray'
// const nj = require('numjs')

const pythonBridge = require('python-bridge')

export class Facenet {
  private python: any

  constructor() {
    // TODO
  }

  public async init(): Promise<void> {
    this.python = pythonBridge({
      env: {
        PYTHONPATH: '/python-facenet/src/',
      },
    })
  }
  public async test1() {
    return await this.python`1+1`
  }

  /**
   * Get the 128 dims embeding from image(s)
   */
  public embeding(file: string): number[]
  public embeding(files: string[]): number[][]

  public embeding(files: string[] | string): number[] | number[][] {
    if (!Array.isArray(files)) {
      return this.embeding([files])[0]
    }

    // TODO
    return [1, 2, 3]
  }
}
