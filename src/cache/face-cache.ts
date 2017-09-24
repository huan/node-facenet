import * as fs          from 'fs'
import * as path        from 'path'

import * as rimraf      from 'rimraf'
import FlashStore       from 'flash-store'

import { log }          from '../config'
import {
  Face,
  FaceJsonObject,
}                       from '../face'
import {
  resizeImage,
  saveImage,
}                       from '../misc'

export class FaceCache {
  public store: FlashStore<string, object>
  public cacheDir = 'face.files'

  constructor(
    public workDir: string,
  ) {
    log.verbose('FaceCache', 'constructor(%s)', workDir)
  }

  public init(): void {
    log.verbose('FaceCache', 'init()')

    if (!fs.existsSync(this.workDir)) {
      throw new Error(`directory not exist: ${this.workDir}`)
    }

    if (!this.store) {
      const storeName   = 'face.db'
      this.store = new FlashStore<string, object>(
        path.join(this.workDir, storeName),
      )
    }

    const fullCacheDir = path.join(this.workDir, this.cacheDir)
    if (!fs.existsSync(fullCacheDir)) {
      fs.mkdirSync(fullCacheDir)
    }

  }

  public async destroy(): Promise<void> {
    log.verbose('FaceCache', 'destroy()')
    await this.store.destroy()
    const cacheDir = path.join(this.workDir, this.cacheDir)
    rimraf.sync(cacheDir)
  }

  public async get(
    md5: string,
  ): Promise<Face | null> {
    const obj = await this.store.get(md5) as FaceJsonObject
    if (obj) {
      const face = Face.fromJSON(obj)
      return face
    }
    return null
  }

  public async put(
    face: Face,
  ): Promise<void> {
    await this.store.put(face.md5, face)  // Face.toJSON()

    const faceFile = this.file(face.md5)

    if (fs.existsSync(faceFile)) {
      return
    }

    let imageData = face.imageData
    if (!imageData) {
      throw new Error('FaceCache.put() no imageData!')
    }

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
