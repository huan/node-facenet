import { Facenet }        from './src/facenet'
import { Face }           from './src/face'
import { FaceImage }      from './src/face-image'
import { PythonFacenet }  from './src/python-facenet'

let VERSION: string

try {
  VERSION = require('./package.json').version
} catch (e) {
  VERSION = require('../package.json').version
}

export {
  Facenet,
  Face,
  FaceImage,
  PythonFacenet,
  VERSION,
}
