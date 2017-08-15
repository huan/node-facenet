import * as fs          from 'fs'
import * as path        from 'path'

import * as rimraf      from 'rimraf'

import { log }          from '../config'
import {
  Alignable,
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

export class AlignmentCache implements Alignable {
  public alignmentCachePath:  string
  public db:                  DbCache

  constructor(
    public facenet: Facenet,
    public directory: string,
  ) {
    log.verbose('AlignmentCache', 'constructor(%s)', directory)
    this.alignmentCachePath = path.join(directory, 'alignment.cache')
  }

  public init(): void {
    log.verbose('AlignmentCache', 'init()')

    this.db = new DbCache(this.alignmentCachePath)

    if (!fs.existsSync(this.directory)) {
      throw new Error(`directory not exist: ${this.directory}`)
    }
    if (!fs.existsSync(this.alignmentCachePath)) {
      fs.mkdirSync(this.alignmentCachePath)
    }
  }

  public async clean(): Promise<void> {
    log.verbose('AlignmentCache', 'clean()')
    await this.db.clean()
    rimraf.sync(this.alignmentCachePath)
  }

  public async align(imageData: ImageData | string ): Promise<Face[]> {
    if (typeof imageData === 'string') {
      log.verbose('AlignmentCache', 'align(%s)', imageData)
      const image = await loadImage(imageData)
      imageData = imageToData(image)
    } else {
      log.verbose('AlignmentCache', 'align(%dx%d)', imageData.width, imageData.height)
    }

    let faceList: Face[] = []
    const md5 = imageMd5(imageData)

    const objList = await this.db.get(md5) as FaceJsonObject[]
    if (objList && Array.isArray(objList)) {
      log.silly('AlignmentCache', 'align() db HIT')
      for (const faceObj of objList) {
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
