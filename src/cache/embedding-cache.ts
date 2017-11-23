import { EventEmitter } from 'events'
import * as fs          from 'fs'
import * as path        from 'path'

import * as nj          from 'numjs'
import FlashStore       from 'flash-store'

import {
  FaceEmbedding,
  log,
}                       from '../config'
import {
  Embeddingable,
  Facenet,
}                       from '../facenet'
import { Face }         from '../face'

export interface EmbeddingCacheData {
  [key: string]: FaceEmbedding,
}

export type EmbeddingCacheEvent = 'hit' | 'miss'

export class EmbeddingCache extends EventEmitter implements Embeddingable {
  public store: FlashStore<string, number[]>

  constructor(
    public facenet: Facenet,
    public workdir: string,
  ) {
    super()
    log.verbose('EmbeddingCache', 'constructor(%s)', workdir)
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

    if (!fs.existsSync(this.workdir)) {
      fs.mkdirSync(this.workdir)
    }

    if (!this.store) {
      const storeName = 'embedding.store'
      this.store = new FlashStore(
        path.join(this.workdir, storeName),
      )
    }
  }

  public async embedding(face: Face): Promise<FaceEmbedding> {
    log.verbose('EmbeddingCache', 'embedding(%s)', face)

    const faceMd5 = face.md5

    const array = await this.store.get(faceMd5)
    if (array) {
      log.silly('EmbeddingCache', 'embedding() cache HIT')
      this.emit('hit', face)
      return nj.array(array)
    }

    log.silly('EmbeddingCache', 'embedding() cache MISS')
    this.emit('miss', face)
    const embedding = await this.facenet.embedding(face)
    await this.store.put(faceMd5, embedding.tolist())
    return embedding
  }

  public async count(): Promise<number> {
    return await this.store.count()
  }

  public async destroy(): Promise<void> {
    return await this.store.destroy()
  }
}
