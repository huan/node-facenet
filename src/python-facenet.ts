import {
  pythonBridge,
  PythonBridge,
}                 from 'python-bridge'

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
      import tensorflow as tf

      session = tf.InteractiveSession()
    `
  }

  public async quit(): Promise<void> {
    await this.python.ex`
      session.close()
      graph.close()
    `
    await this.python.end()
  }

  public async align(data: number[][]): Promise<number[]> {
    const r = await this.python`[4, 5, 6]`
    return r
  }

  public async embedding(data: number[][]): Promise<number[]> {
    const v = await this.python`[1, 2, 3]`
    return v
  }
}
