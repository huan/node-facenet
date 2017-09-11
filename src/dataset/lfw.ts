import * as fs          from 'fs'
import * as http        from 'http'
import * as path        from 'path'
import * as readline    from 'readline'

import mkdirp         = require('mkdirp')
import printf         = require('printf')
const tar             = require('tar')

import {
  log,
  MODULE_ROOT,
}                         from '../config'

import { Dataset }        from './'

export type LfwPair = [string, string, boolean] // image1, image2, isSame

/**
 * https://github.com/davidsandberg/facenet/wiki/Validate-on-LFW
 */
export class Lfw extends Dataset {
  private downloadUrl = 'http://vis-www.cs.umass.edu/lfw/lfw.tgz'
  private downloadFile:   string
  private pairListCache:  LfwPair[]

  constructor(
    public workDir = path.join(MODULE_ROOT, 'datasets', 'lfw'),
    public ext     = 'jpg',
  ) {
    super(workDir, ext)
    log.verbose('Lfw', 'constructor()')

    this.downloadFile = path.join(workDir, 'lfw.tgz')
  }

  public async setup(): Promise<void> {
    log.verbose('Lfw', 'setup()')

    if (!fs.existsSync(this.directory)) {
      log.silly('Lfw', 'setup() creating directory %s', this.directory)
      mkdirp.sync(this.directory)
    }

    await this.download()
    await this.extract()
  }

  public async download(): Promise<void> {
    log.verbose('Lfw', 'download() to %s', this.directory)

    if (fs.existsSync(this.downloadFile)) {
      log.silly('Lfw', 'download() %s already downloaded', this.downloadFile)
      return
    }

    const tmpname   = this.downloadFile + '.tmp'
    const file = fs.createWriteStream(tmpname)

    return new Promise<void>((resolve, reject) => {
      // https://stackoverflow.com/a/22793628/1123955
      http.get(this.downloadUrl, response => {
        log.verbose('Lfw', 'download() start... ')
        response.on('readable', () => {
          process.stdout.write('.')
        })
        response.pipe(file)
        file.on('finish', () => {
          process.stdout.write('\n')
          log.silly('Lfw', 'download() finished')
          file.close()
          fs.rename(tmpname, this.downloadFile, err => {
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

    const EXTRACTED_MARK_FILE = path.join(this.directory, 'EXTRACTED')
    if (fs.existsSync(EXTRACTED_MARK_FILE)) {
      log.silly('Lfw', 'extract() already extracted')
      return
    }

    await tar.x({
      file:   this.downloadFile,
      strip:  1,
      cwd:    this.directory,
    })

    fs.closeSync(fs.openSync(EXTRACTED_MARK_FILE, 'w')) // touch the file
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
      let pair: [string, string, boolean]

      let id1: string,
          id2: string,
          num1: string,
          num2: string

      let file1: string,
          file2: string,
          same: boolean

      const arr = line.split('\t')
      if (arr.length === 2) {
        return
      }

      if (this.pairListCache.length % 1000 === 0) {
        log.silly('Lfw', 'pairList() loading %d ...', this.pairListCache.length)
      }

      switch (arr.length) {
        case 3:
          id1 = arr[0]
          num1 = arr[1]
          num2 = arr[2]

          file1 = filename(id1, num1)
          file2 = filename(id1, num2)
          same = true
          pair = [file1, file2, same]
          break
        case 4:
          id1   = arr[0]
          num1  = arr[1]
          id2   = arr[2]
          num2  = arr[3]

          file1 = filename(id1, num1)
          file2 = filename(id2, num2)
          same = false
          pair = [file1, file2, same]
          break
        default:
          log.error('Lfw', 'pairList() got arr.length: %d', arr.length)
          return
      }

      function filename(id: string, num: string) {
        return printf('%s/%s_%04d.jpg', id, id, num)
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
