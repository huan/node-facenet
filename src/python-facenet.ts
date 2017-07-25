import { pythonBridge } from 'python-bridge'

export class PythonFacenet {
  private python: any

  constructor() {
    //
  }

  public async init(): Promise<void> {
    // suppress tensorflow warnings
    process.env['TF_CPP_MIN_LOG_LEVEL'] = '2'

    this.python = pythonBridge({
      env: {
        PYTHONPATH: `${__dirname}/../../python-facenet/src/`,
      },
    })

  }

  public async prepare(): Promise<void> {
    // we need not to care about session.close()(?)
    await this.python.ex`session = tf.InteractiveSession()`
  }

  public async test1() {
    return await this.python`1+1`
  }

}
