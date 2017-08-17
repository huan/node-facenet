import * as fs          from 'fs'
import * as path        from 'path'

import * as rimraf      from 'rimraf'

import { log }          from '../config'
import {
  Face,
  FaceJsonObject,
}                       from '../face'
import {
  resizeImage,
  saveImage,
}                       from '../misc'

import { DbCache }      from './db-cache'

export class FaceCache {
  public db: DbCache
  public dbName   = 'face'
  public cacheDir = 'cache.face'

  constructor(
    public rootDir: string,
  ) {
    log.verbose('FaceCache', 'constructor(%s)', rootDir)
    this.init()
  }

  public init(): void {
    log.verbose('FaceCache', 'init()')

    if (!fs.existsSync(this.rootDir)) {
      throw new Error(`directory not exist: ${this.rootDir}`)
    }

    if (!this.db) {
      this.db = new DbCache(this.rootDir, this.dbName)
    }

    const fullCacheDir = path.join(this.rootDir, this.cacheDir)
    if (!fs.existsSync(fullCacheDir)) {
      fs.mkdirSync(fullCacheDir)
    }

  }

  public async clean(): Promise<void> {
    log.verbose('FaceCache', 'clean()')
    await this.db.clean()
    const cacheDir = path.join(this.rootDir, this.cacheDir)
    rimraf.sync(cacheDir)
  }

  public async get(
    md5: string,
  ): Promise<Face | null> {
    const obj = await this.db.get(md5) as FaceJsonObject

    if (obj) {
      const face = Face.fromJSON(obj)
      return face
    }
    return null
  }

  public async put(
    face: Face,
  ): Promise<void> {
    await this.db.put(face.md5, face)  // Face.toJSON()

    const faceFile = path.join(
      this.rootDir,
      this.cacheDir,
      face.md5,
    )

    let imageData = face.imageData
    if (imageData.width !== 160) {
      imageData = await resizeImage(imageData, 160, 160)
    }
    await saveImage(imageData, faceFile)
  }

}
