import { pythonBridge } from 'python-bridge'

export class PythonFacenet {
  private python: any

  constructor() {
    //
  }

  public async init(): Promise<void> {
    this.python = pythonBridge({
      env: {
        PYTHONPATH: `${__dirname}/../../python-facenet/src/`,
      },
    })
  }
  public async test1() {
    return await this.python`1+1`
  }

}
