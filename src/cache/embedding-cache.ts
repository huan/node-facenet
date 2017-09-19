import { EventEmitter } from 'events'
import * as fs          from 'fs'
import * as path        from 'path'

import * as nj          from 'numjs'

import {
  FaceEmbedding,
  log,
}                       from '../config'
import {
  Embeddingable,
  Facenet,
}                       from '../facenet'
import { Face }         from '../face'

import { DbCache }      from './db-cache'

export interface EmbeddingCacheData {
  [key: string]: FaceEmbedding,
}

export type EmbeddingCacheEvent = 'hit' | 'miss'

export class EmbeddingCache extends EventEmitter implements Embeddingable {
  public  db: DbCache

  constructor(
    public facenet: Facenet,
    public workDir: string,
  ) {
    super()
    log.verbose('EmbeddingCache', 'constructor(%s)', workDir)
  }

  public on(event: 'hit', listener: (face: Face) => void):  this
  public on(event: 'miss', listener: (face: Face) => void): this

  public on(event: never, listener: any):                                this
  public on(event: EmbeddingCacheEvent, listener: (face: Face) => void): this {
    super.on(event, listener)
    return this
  }

  public emit(event: 'hit', face: Face):  boolean
  public emit(event: 'miss', face: Face): boolean

  public emit(event: never, face: Face):               boolean
  public emit(event: EmbeddingCacheEvent, face: Face): boolean {
    return super.emit(event, face)
  }

  public init(): void {
    log.verbose('EmbeddingCache', 'init()')

    if (!fs.existsSync(this.workDir)) {
      fs.mkdirSync(this.workDir)
    }

    const dbName = 'embedding.db'
    this.db = new DbCache(
      path.join(this.workDir, dbName),
    )
  }

  public async embedding(face: Face): Promise<FaceEmbedding> {
    log.verbose('EmbeddingCache', 'embedding(%s)', face)

    const cacheKey = face.md5

    const array = await this.db.get(cacheKey)
    if (array) {
      log.silly('EmbeddingCache', 'embedding() cache HIT')
      this.emit('hit', face)
      return nj.array(array as any)
    }

    log.silly('EmbeddingCache', 'embedding() cache MISS')
    this.emit('miss', face)
    const embedding = await this.facenet.embedding(face)
    await this.db.put(cacheKey, embedding.tolist())
    return embedding
  }

  public async count(): Promise<number> {
    return await this.db.count()
  }

  public async clean(): Promise<void> {
    return await this.db.clean()
  }
}
