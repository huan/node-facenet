import * as fs          from 'fs'

import { log }          from '../config'
import {
  Embeddingable,
  Facenet,
  FaceEmbedding,
}                       from '../facenet'
import { Face }         from '../face'

import { DbCache }      from './db-cache'

export interface EmbeddingCacheData {
  [key: string]: FaceEmbedding,
}

export class EmbeddingCache implements Embeddingable {
  public  db: DbCache
  private dbName = 'embedding'

  constructor(
    public facenet: Facenet,
    public rootDir: string,
  ) {
    log.verbose('EmbeddingCache', 'constructor(%s)', rootDir)
  }

  public init(): void {
    log.verbose('EmbeddingCache', 'init()')

    if (!fs.existsSync(this.rootDir)) {
      throw new Error(`directory not exist: ${this.rootDir}`)
    }

    this.db = new DbCache(this.rootDir, this.dbName)
  }

  public async embedding(face: Face): Promise<FaceEmbedding> {
    log.verbose('EmbeddingCache', 'embedding(%s)', face)

    const cacheKey = face.md5

    const v = await this.db.get(cacheKey)
    if (v) {
      log.silly('EmbeddingCache', 'embedding() cache HIT')
      return v as FaceEmbedding
    }

    await this.facenet.embedding(face)
    await this.db.put(cacheKey, face.embedding)
    log.silly('EmbeddingCache', 'embedding() cache MISS')
    return face.embedding
  }

  public async count(): Promise<number> {
    return await this.db.count()
  }

  public async clean(): Promise<void> {
    return await this.db.clean()
  }
}
