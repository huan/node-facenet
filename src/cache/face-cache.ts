import * as fs      from 'fs'
import * as path    from 'path'

import * as rimraf  from 'rimraf'
import FlashStore   from 'flash-store'

import { log }      from '../config'
import {
  Face,
  FaceJsonObject,
}                   from '../face'
import {
  resizeImage,
  saveImage,
}                   from '../misc'

export class FaceCache {
  public store: FlashStore<string, object>
  public imagedir: string

  constructor(
    public workdir: string,
  ) {
    log.verbose('FaceCache', 'constructor(%s)', workdir)
  }

  public init(): void {
    log.verbose('FaceCache', 'init()')

    if (!fs.existsSync(this.workdir)) {
      throw new Error(`directory not exist: ${this.workdir}`)
    }

    if (!this.store) {
      const storeName   = 'face-cache.store'
      this.store = new FlashStore<string, object>(
        path.join(this.workdir, storeName),
      )
    }

    if (!this.imagedir) {
      const dirName = 'imagedir'
      this.imagedir = path.join(this.workdir, dirName)
      if (!fs.existsSync(this.imagedir)) {
        fs.mkdirSync(this.imagedir)
      }
    }
  }

  public async destroy(): Promise<void> {
    log.verbose('FaceCache', 'destroy()')
    await this.store.destroy()
    rimraf.sync(this.imagedir)
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

  public file(md5: string): string {
    const filename = path.join(
      this.imagedir,
      `${md5}.png`,
    )
    return filename
  }

  public async list(md5Partial: string, limit = 10): Promise<string[]> {
    const prefix  = md5Partial
    const md5List = [] as string[]

    let n = 0
    for await (const key of this.store.keys({ prefix })) {
      if (n++ > limit) {
        break
      }
      md5List.push(key)
    }
    return md5List
  }
}

export default FaceCache
