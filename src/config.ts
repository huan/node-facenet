import * as path  from 'path'

import * as nj    from 'numjs'

// import * as appRoot from 'app-root-path'
// export const MODULE_ROOT = appRoot.path

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

export interface Point {
  x: number,
  y: number,
}

export interface Rectangle {
  x: number,  // left
  y: number,  // top
  w: number,  // width
  h: number,  // height
}

export const FILE_FACENET_ICON_PNG = path.join(
  MODULE_ROOT,
  'docs',
  'images',
  'facenet-icon.png',
)

export { log } from 'brolog'

export const INPUT_FACE_SIZE = 160
