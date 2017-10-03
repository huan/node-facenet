export {
  log,
  // MODULE_ROOT,
  VERSION,
  Rectangle,
}                           from './src/config'
export {
  // Rectangle,
  Face,
}                           from './src/face'
export *                    from './src/misc'

export {
  AlignmentCache,
  EmbeddingCache,
  FaceCache,
}                           from './src/cache/'

export {
  Dataset,
  Lfw,
}                           from './src/dataset/'

// export { PythonFacenet }    from './src/python3/python-facenet'

import { Facenet } from './src/facenet'
export { Facenet }
export default Facenet
