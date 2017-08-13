import * as fs          from 'fs'
import * as path        from 'path'

import * as rimraf      from 'rimraf'

import {
  Facenet,
  FaceEmbedding,
}                       from '../facenet'
// import { FaceImage }    from '../face-image'
import {
  Face,
  FaceJsonObject,
}                       from '../face'
import { log }          from '../config'

import { DbCache }      from './db-cache'

export interface AlignmentCacheData {
  [key: string]: FaceEmbedding,
}

export class AlignmentCache {
  public alignmentPath: string
  public db:            DbCache

  constructor(
    public facenet: Facenet,
    public datasetDir: string,
  ) {
    log.verbose('AlignmentCache', 'constructor(%s)', datasetDir)
    this.alignmentPath = path.join(datasetDir, 'alignment.cache')
  }

  public init(): void {
    log.verbose('AlignmentCache', 'init()')

    this.db = new DbCache(this.alignmentPath)

    if (!fs.existsSync(this.datasetDir)) {
      throw new Error(`directory not exist: ${this.datasetDir}`)
    }
    if (!fs.existsSync(this.alignmentPath)) {
      fs.mkdirSync(this.alignmentPath)
    }
  }

  public async clean(): Promise<void> {
    log.verbose('AlignmentCache', 'clean()')
    await this.db.clean()
    rimraf.sync(this.alignmentPath)
  }

  public async align(image: HTMLImageElement): Promise<Face[]> {
    log.verbose('AlignmentCache', 'align(%s)', image)

    let faceList: Face[] = []

    const obj = await this.db.get(image.src) as FaceJsonObject[]
    if (obj) {
      log.silly('AlignmentCache', 'align() db HIT')
      for (const faceObj of obj) {
        faceList.push(Face.fromJSON(faceObj))
      }
      return faceList
    } else {
      log.silly('AlignmentCache', 'align() db MISS')

      faceList = await this.facenet.align(image)
      await this.db.put(image.src, faceList)  // Face.toJSON()
    }

    return faceList
  }
}
