import * as fs          from 'fs'
import * as http        from 'http'
import * as path        from 'path'
import * as readline    from 'readline'

import * as tar         from 'tar'
import printf = require('printf')

import {
  log,
  MODULE_ROOT,
}                         from './config'

/**
 * https://github.com/davidsandberg/facenet/wiki/Validate-on-LFW
 */
export class Lfw {
  public rootDir:    string

  private downloadUrl = 'http://vis-www.cs.umass.edu/lfw/lfw.tgz'

  private lfwFile:    string
  private lfwDir:     string

  constructor(
    directory?: string,
  ) {
    log.verbose('Lfw', 'constructor(%s)', directory)

    this.rootDir    = directory || path.join(MODULE_ROOT, 'lfw')
    this.lfwFile    = path.join(this.rootDir, 'lfw.tgz')
    this.lfwDir     = path.join(this.rootDir, 'raw')
  }

  public async init(): Promise<void> {
    log.verbose('Lfw', 'init()')

    if (!fs.existsSync(this.rootDir)) {
      fs.mkdirSync(this.rootDir)
    }

    this.download()
    this.extract()
  }

  public async download(): Promise<void> {
    log.verbose('Lfw', 'download()')
    // https://stackoverflow.com/a/22793628/1123955

    const filename  = path.join(this.rootDir, 'lfw.tgz')
    const tmpname   = filename + '.tmp'

    if (fs.existsSync(filename)) {
      return
    }

    return new Promise<void>((resolve, reject) => {
      const file = fs.createWriteStream(tmpname)
      http.get(this.downloadUrl, function(response) {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          fs.rename(tmpname, filename, err => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
        response.on('error', reject)
        file.on('error', reject)
      })
    })
  }

  public async extract(): Promise<void> {
    log.verbose('Lfw', 'extract()')

    const tarExtractor = tar.Extract({
      strip:  1,
      path:   this.lfwDir,
    })

    fs.createReadStream(this.lfwFile)
      .pipe(tarExtractor)

    return new Promise<void>((resolve, reject) => {
      tarExtractor.on('finish', () => resolve())
      tarExtractor.on('error', reject)
    })
  }

  public async pairList(): Promise<[string, string, boolean][]> {
    const pairsTxt = path.join(MODULE_ROOT, 'python3/facenet/data/pairs.txt')
    const pairArr: [string, string, boolean][] = []
/*
10	300
Abel_Pacheco	1	4
Akhmed_Zakayev	1	3
Abdel_Madi_Shabneh	1	Dean_Barker	1
Abdel_Madi_Shabneh	1	Giancarlo_Fisichella	1
*/

    const rl = readline.createInterface({
      input: fs.createReadStream(pairsTxt),
      terminal: false,
    })

    rl.on('line', function(line) {
      console.log('Line: ' + line)
      let pair: [string, string, boolean]

      let id1: string,
          id2: string,
          num1: string,
          num2: string

      let file1: string,
          file2: string,
          same: boolean

      const arr = line.split('\t')
      switch (arr.length) {
        case 2:
          return
        case 3:
          id1 = arr[0]
          num1 = arr[1]
          num2 = arr[2]

          file1 = printf('%s/%4d', id1, num1)
          file2 = printf('%s/%4d', id1, num2)
          same = true
          pair = [file1, file2, same]
          break
        case 4:
          id1   = arr[0]
          num1  = arr[1]
          id2   = arr[2]
          num2  = arr[3]

          file1 = printf('%s/%4d', id1, num1)
          file2 = printf('%s/%4d', id2, num2)
          same = false
          pair = [file1, file2, same]
          break
        default:
          log.error('Lfw', 'pairList() got arr.length: %d', arr.length)
          return
      }

      pairArr.push(pair)
    })

    return new Promise<[string, string, boolean][]>((resolve, reject) => {
      rl.on('close', () => resolve(pairArr))
      rl.on('error', reject)
    })
  }

}
