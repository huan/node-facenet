import * as fs          from 'fs'
import * as path        from 'path'

import * as levelup     from 'levelup'
import * as rimraf      from 'rimraf'

import {
  Facenet,
  FaceEmbedding,
}                       from './facenet'
import { FaceImage }    from './face-image'
import { Face }         from './face'
import { log }          from './config'

export interface AlignmentCacheData {
  [key: string]: FaceEmbedding,
}

export class AlignmentCache {
  public alignmentPath:  string

  constructor(
    public facenet: Facenet,
    public datasetDir: string,
  ) {
    log.verbose('AlignmentCache', 'constructor(%s)', datasetDir)
    this.alignmentPath = path.join(datasetDir, 'alignment.cache')
  }

  public init(): void {
    log.verbose('AlignmentCache', 'init()')

    if (!fs.existsSync(this.datasetDir)) {
      throw new Error(`directory not exist: ${this.datasetDir}`)
    }
    if (!fs.existsSync(this.alignmentPath)) {
      fs.mkdirSync(this.alignmentPath)
    }
  }

  public async clean(): Promise<void> {
    log.verbose('AlignmentCache', 'clean()')
    rimraf.sync(this.alignmentPath)
  }

  public async align(relativePath: string): Promise<FaceEmbedding>
  public async align(relativePath: string, align: Facealign): Promise<void>

  public async align(
    relativePath: string,
  ): Promise<FaceEmbedding | void> {
    log.verbose('AlignmentCache', 'embedding(%s, %s)', relativePath, embedding)

    if (embedding) {
      await this.dbPut(relativePath, embedding)
      return
    }

    const v = await this.dbGet(relativePath)
    if (v) {
      log.silly('AlignmentCache', 'embedding() cache HIT')
      return v
    }

    const fullPathName = path.join(this.datasetDir, relativePath)
    const image = new FaceImage(fullPathName)
    const face: Face  = image.asFace()

    await this.facenet.embedding(face)
    await this.dbPut(relativePath, face.embedding)
    log.silly('AlignmentCache', 'embedding() cache MISS')
    return face.embedding
  }
}
