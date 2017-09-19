import { EventEmitter } from 'events'
import * as fs          from 'fs'
import * as path        from 'path'

import {
  log,
  FaceEmbedding,
}                       from '../config'
import {
  Alignable,
  Facenet,
}                       from '../facenet'
import {
  Face,
}                       from '../face'
import {
  imageMd5,
  imageToData,
  loadImage,
}                       from '../misc'

import { DbCache }      from './db-cache'
import { FaceCache }    from './face-cache'

export interface AlignmentCacheData {
  [key: string]: FaceEmbedding,
}

export type AlignmentCacheEvent = 'hit' | 'miss'

export class AlignmentCache extends EventEmitter implements Alignable {
  public db:        DbCache
  public faceCache: FaceCache

  constructor(
    public facenet: Facenet,
    public workDir: string,
  ) {
    super()
    log.verbose('AlignmentCache', 'constructor(%s)', workDir)
  }

  public on(event: 'hit',  listener: (image: ImageData | string) => void): this
  public on(event: 'miss', listener: (image: ImageData | string) => void): this

  public on(event: never, listener: any):                                               this
  public on(event: AlignmentCacheEvent, listener: (image: ImageData | string) => void): this {
    super.on(event, listener)
    return this
  }

  public emit(event: 'hit',  image: ImageData | string):  boolean
  public emit(event: 'miss', image: ImageData | string): boolean

  public emit(event: never, image: any):                              boolean
  public emit(event: AlignmentCacheEvent, image: ImageData | string): boolean {
    return super.emit(event, image)
  }

  public init(): void {
    log.verbose('AlignmentCache', 'init()')

    if (!fs.existsSync(this.workDir)) {
      throw new Error(`directory not exist: ${this.workDir}`)
    }

    if (!this.db) {
      const dbName = 'alignment.db'

      this.db = new DbCache(
        path.join(this.workDir, dbName),
      )
    }

    this.faceCache = new FaceCache(this.workDir)
  }

  public async clean(): Promise<void> {
    log.verbose('AlignmentCache', 'clean()')
    await this.db.clean()
  }

  public async align(image: ImageData | string ): Promise<Face[]> {
    if (typeof image === 'string') {
      const filename = image
      log.verbose('AlignmentCache', 'align(%s)', filename)
      image = imageToData(
        await loadImage(filename),
      )
    } else {
      log.verbose('AlignmentCache', 'align(%dx%d)',
                                    image.width,
                                    image.height,
                  )
    }

    const md5 = imageMd5(image)
    let faceList = await this.get(md5)

    if (faceList !== null) {
      log.silly('AlignmentCache', 'align() HIT')
      this.emit('hit', image)
      return faceList
    }
    log.silly('AlignmentCache', 'align() MISS')
    this.emit('miss', image)

    faceList = await this.facenet.align(image)
    await this.put(md5, faceList)

    return faceList
  }

  private async get(
    md5: string,
  ): Promise<Face[] | null> {
    const faceMd5List = await this.db.get(md5) as string[]

    if (faceMd5List && Array.isArray(faceMd5List)) {
      const faceList = await Promise.all(
        faceMd5List.map(faceMd5 => this.faceCache.get(faceMd5)),
      )
      if (faceList.some(face => !face)) {
        return null
      } else {
        return faceList as Face[]
      }
    }
    return null
  }

  private async put(
    md5:      string,
    faceList: Face[],
  ): Promise<void> {
    await Promise.all(
      faceList.map(async face => this.faceCache.put(face)),
    )

    const faceMd5List = faceList.map(face => face.md5)
    await this.db.put(md5, faceMd5List)
  }

}
