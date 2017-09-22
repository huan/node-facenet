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
  public dbName   = 'face.db'
  public cacheDir = 'face.file'

  constructor(
    public workDir: string,
  ) {
    log.verbose('FaceCache', 'constructor(%s)', workDir)
    this.init()
  }

  public init(): void {
    log.verbose('FaceCache', 'init()')

    if (!fs.existsSync(this.workDir)) {
      throw new Error(`directory not exist: ${this.workDir}`)
    }

    if (!this.db) {
      this.db = new DbCache(
        path.join(this.workDir, this.dbName),
      )
    }

    const fullCacheDir = path.join(this.workDir, this.cacheDir)
    if (!fs.existsSync(fullCacheDir)) {
      fs.mkdirSync(fullCacheDir)
    }

  }

  public async destroy(): Promise<void> {
    log.verbose('FaceCache', 'destroy()')
    await this.db.destroy()
    const cacheDir = path.join(this.workDir, this.cacheDir)
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

    const faceFile = this.file(face.md5)

    if (fs.existsSync(faceFile)) {
      return
    }

    let imageData = face.imageData
    if (imageData.width !== 160) {
      imageData = await resizeImage(imageData, 160, 160)
    }
    await saveImage(imageData, faceFile)
  }

  public file(
    md5: string,
  ): string {
    const filename = path.join(
      this.workDir,
      this.cacheDir,
      `${md5}.png`,
    )
    return filename
  }
}

export default FaceCache
