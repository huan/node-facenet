import * as fs          from 'fs'
import * as path        from 'path'

import * as rimraf      from 'rimraf'

import { log }          from '../config'
import {
  Facenet,
  FaceEmbedding,
}                       from '../facenet'
import {
  Face,
  FaceJsonObject,
}                       from '../face'
import {
  imageMd5,
  imageToData,
  loadImage,
}                       from '../misc'

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

  public async align(imageData: ImageData | string): Promise<Face[]> {
    if (typeof imageData === 'string') {
      log.verbose('AlignmentCache', 'align(%s)', imageData)
      const image = await loadImage(imageData)
      imageData = imageToData(image)
    } else {
      log.verbose('AlignmentCache', 'align(%dx%d)', imageData.width, imageData.height)
    }

    let faceList: Face[] = []
    const md5 = imageMd5(imageData)

    const obj = await this.db.get(md5) as FaceJsonObject[]
    if (obj) {
      log.silly('AlignmentCache', 'align() db HIT')
      for (const faceObj of obj) {
        faceList.push(Face.fromJSON(faceObj))
      }
      return faceList
    } else {
      log.silly('AlignmentCache', 'align() db MISS')

      faceList = await this.facenet.align(imageData)
      await this.db.put(md5, faceList)  // Face.toJSON()
    }

    return faceList
  }
}
