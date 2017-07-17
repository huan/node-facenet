const pythonBridge = require('python-bridge')

const python = pythonBridge({
  env: {
    PYTHONPATH: '/python-facenet/src/',
  },
})

export class Facenet {
  constructor() {
    // TODO
  }

  public async test1() {
    return await python`1+1`
  }
}
