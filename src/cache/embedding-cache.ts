import * as fs          from 'fs'
import * as path        from 'path'

import * as levelup     from 'levelup'
import * as rimraf      from 'rimraf'

import {
  Facenet,
  FaceEmbedding,
}                       from '../facenet'
import { FaceImage }    from '../face-image'
import { Face }         from '../face'
import { log }          from '../config'

export interface EmbeddingCacheData {
  [key: string]: FaceEmbedding,
}

export class EmbeddingCache {
  public dbPath:  string

  private cacheData: EmbeddingCacheData

  constructor(
    public facenet:     Facenet,
    public datasetDir:  string,
  ) {
    log.verbose('EmbeddingCache', 'constructor(%s)', datasetDir)
    this.dbPath = path.join(datasetDir, 'embedding.db')
  }

  public init(): void {
    log.verbose('EmbeddingCache', 'init()')

    if (!fs.existsSync(this.datasetDir)) {
      throw new Error(`directory not exist: ${this.datasetDir}`)
    }

    this.db = levelup(this.dbPath, {
      valueEncoding: 'json',
    })
  }

  public async embedding(relativePath: string): Promise<FaceEmbedding>
  public async embedding(relativePath: string, embedding: FaceEmbedding): Promise<void>

  public async embedding(
    relativePath: string,
    embedding?:   FaceEmbedding,
  ): Promise<FaceEmbedding | void> {
    log.verbose('EmbeddingCache', 'embedding(%s, %s)', relativePath, embedding)

    if (embedding) {
      await this.dbPut(relativePath, embedding)
      return
    }

    const v = await this.dbGet(relativePath)
    if (v) {
      log.silly('EmbeddingCache', 'embedding() cache HIT')
      return v
    }

    const fullPathName = path.join(this.datasetDir, relativePath)
    const image = new FaceImage(fullPathName)
    const face: Face  = image.asFace()

    await this.facenet.embedding(face)
    await this.dbPut(relativePath, face.embedding)
    log.silly('EmbeddingCache', 'embedding() cache MISS')
    return face.embedding
  }
}
