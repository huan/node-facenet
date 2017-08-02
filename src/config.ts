import * as path from 'path'

export function parentDirectory(): string {
  const parentDir = __dirname.split(path.delimiter) // [... 'node_modules', 'facenet', 'dist', 'src']
                              .slice(-2, -1)[0]     // 'dist'
  return parentDir
}

export const MODULE_ROOT = parentDirectory() === 'dist'
                            ? path.normalize(`${__dirname}/../..`)
                            : path.normalize(`${__dirname}/..`)

const packageFile = path.join(MODULE_ROOT, 'package.json')
export const VERSION = require(packageFile).version
