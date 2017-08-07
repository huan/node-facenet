import * as fs          from 'fs'
import * as http        from 'http'
import * as path        from 'path'
import * as readline    from 'readline'

const tar = require('tar')
import printf = require('printf')

import {
  log,
  MODULE_ROOT,
}                         from './config'

export type LfwPair = [string, string, boolean] // image1, image2, isSame

/**
 * https://github.com/davidsandberg/facenet/wiki/Validate-on-LFW
 */
export class Lfw {
  public rootDir:    string

  private downloadUrl = 'http://vis-www.cs.umass.edu/lfw/lfw.tgz'

  private tgzFile:        string
  private extractDir:     string
  private pairListCache:  LfwPair[]

  constructor(
    directory?: string,
  ) {
    log.verbose('Lfw', 'constructor(%s)', directory)

    this.rootDir    = directory || path.join(MODULE_ROOT, 'lfw')
    this.tgzFile    = path.join(this.rootDir, 'lfw.tgz')
    this.extractDir = path.join(this.rootDir, 'raw')
  }

  public async init(): Promise<void> {
    log.verbose('Lfw', 'init()')

    if (!fs.existsSync(this.rootDir)) {
      log.silly('Lfw', 'init() creating rootDir %s', this.rootDir)
      fs.mkdirSync(this.rootDir)
    }

    await this.download()
    await this.extract()
  }

  public async download(): Promise<void> {
    log.verbose('Lfw', 'download()')
    // https://stackoverflow.com/a/22793628/1123955

    const tmpname   = this.tgzFile + '.tmp'

    if (fs.existsSync(this.tgzFile)) {
      log.silly('Lfw', 'download() %s already downloaded', this.tgzFile)
      return
    }

    return new Promise<void>((resolve, reject) => {
      const file = fs.createWriteStream(tmpname)
      http.get(this.downloadUrl, response => {
        log.verbose('Lfw', 'download() start downloading... ')
        response.on('readable', () => {
          process.stdout.write('.')
        })
        response.pipe(file)
        file.on('finish', () => {
          log.silly('Lfw', 'download() finished')
          file.close()
          fs.rename(tmpname, this.tgzFile, err => {
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

    const tarExtractor = tar.x({
      strip:  1,
      cwd:   this.extractDir,
    })

    fs.createReadStream(this.tgzFile)
      .pipe(tarExtractor)

    return new Promise<void>((resolve, reject) => {
      tarExtractor.on('finish', () => {
        log.silly('Lfw', 'extract() finished')
        resolve()
      })
      tarExtractor.on('error', reject)
    })
  }

  public async pairList(): Promise<LfwPair[]> {
    log.verbose('Lfw', 'pairList()')

    if (this.pairListCache && this.pairListCache.length) {
      log.silly('Lfw', 'pairList() return cached list')
      return this.pairListCache
    }
    this.pairListCache = []

    const pairsTxt = path.join(MODULE_ROOT, 'python3/facenet/data/pairs.txt')
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

    rl.on('line', line => {
      if (this.pairListCache.length % 1000 === 0) {
        log.silly('Lfw', 'pairList() loading %d ...', this.pairListCache.length)
      }

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

      this.pairListCache.push(pair)
    })

    return new Promise<LfwPair[]>((resolve, reject) => {
      rl.on('close', () => {
        log.silly('Lfw', 'pairList() fully loaded: %d pairs', this.pairListCache.length)
        resolve(this.pairListCache)
      })
      rl.on('error', reject)
    })
  }

}
