import * as path  from 'path'

import { Brolog } from 'brolog'

export const log = new Brolog()

export function parentDirectory(): string {     // export for test
  const parentDir = __dirname.split(path.sep)   // [... 'node_modules', 'facenet', 'dist', 'src']
                              .slice(-2, -1)[0] // 'dist'
  return parentDir
}

export const MODULE_ROOT = parentDirectory() === 'dist'
                            ? path.normalize(`${__dirname}/../..`)
                            : path.normalize(`${__dirname}/..`)

const packageFile = path.join(MODULE_ROOT, 'package.json')
export const VERSION = require(packageFile).version

export type FaceEmbedding = nj.NdArray<number>  // 128 dim
