const pythonBridge = require('python-bridge')

export class PythonFacenet {
  private python: any

  constructor() {
    this.python = pythonBridge({
      env: {
        PYTHONPATH: '/python-facenet/src/',
      },
    })
  }

  public async test1() {
    return await this.python`1+1`
  }

}
