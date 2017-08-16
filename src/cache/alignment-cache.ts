import * as fs          from 'fs'
import * as path        from 'path'
// import { promisify }    from 'util'

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
  resizeImage,
  saveImage,
}                       from '../misc'

import { DbCache }      from './db-cache'

export interface AlignmentCacheData {
  [key: string]: FaceEmbedding,
}

export class AlignmentCache implements Alignable {
  public db: DbCache
  public dbName   = 'alignment'
  public cacheDir = 'cache.alignment'

  constructor(
    public facenet: Facenet,
    public rootDir: string,
  ) {
    log.verbose('AlignmentCache', 'constructor(%s)', rootDir)
  }

  public init(): void {
    log.verbose('AlignmentCache', 'init()')

    this.db = new DbCache(this.rootDir, this.dbName)

    if (!fs.existsSync(this.rootDir)) {
      throw new Error(`directory not exist: ${this.rootDir}`)
    }
    const fullCacheDir = path.join(this.rootDir, this.cacheDir)
    if (!fs.existsSync(fullCacheDir)) {
      fs.mkdirSync(fullCacheDir)
    }

  }

  public async clean(): Promise<void> {
    log.verbose('AlignmentCache', 'clean()')
    await this.db.clean()
    const cacheDir = path.join(this.rootDir, this.cacheDir)
    rimraf.sync(cacheDir)
  }

  public async align(imageData: ImageData | string ): Promise<Face[]> {
    if (typeof imageData === 'string') {
      const filename = imageData
      log.verbose('AlignmentCache', 'align(%s)', filename)
      imageData = imageToData(
        await loadImage(filename),
      )
    } else {
      log.verbose('AlignmentCache', 'align(%dx%d)',
                                    imageData.width,
                                    imageData.height,
                  )
    }

    const md5 = imageMd5(imageData)
    let faceList = await this.get(md5)

    if (faceList !== null) {
      log.silly('AlignmentCache', 'align() HIT')
      return faceList
    }
    log.silly('AlignmentCache', 'align() MISS')

    faceList = await this.facenet.align(imageData)
    await this.put(md5, faceList)

    return faceList
  }

  private async get(
    md5: string,
  ): Promise<Face[] | null> {
    const objList = await this.db.get(md5) as FaceJsonObject[]
    const faceList: Face[] = []

    if (objList && Array.isArray(objList)) {
      for (const faceObj of objList) {
        faceList.push(Face.fromJSON(faceObj))
      }
      return faceList
    }
    return null
  }

  private async put(
    md5:      string,
    faceList: Face[],
  ): Promise<void> {
    await this.db.put(md5, faceList)  // Face.toJSON()

    faceList.forEach(async face => {

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
    })
  }

}
