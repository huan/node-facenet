import { Facenet }        from './src/facenet'
import { PythonFacenet }  from './src/python-facenet'

let VERSION: string

try {
  VERSION = require('./package.json').version
} catch (e) {
  try {
    VERSION = require('../package.json').version
  } catch (e) {/* */}
}

export {
  Facenet,
  PythonFacenet,
  VERSION,
}
