import * as fs          from 'fs'
import * as path        from 'path'

import { log }          from '../config'
import {
  Facenet,
  FaceEmbedding,
}                       from '../facenet'
import { Face }         from '../face'
import {
  loadImage,
  imageToData,
}                       from '../misc'

import { DbCache }      from './db-cache'

export interface EmbeddingCacheData {
  [key: string]: FaceEmbedding,
}

export class EmbeddingCache {
  public db:  DbCache

  constructor(
    public facenet:     Facenet,
    public directory:  string,
  ) {
    log.verbose('EmbeddingCache', 'constructor(%s)', directory)
  }

  public init(): void {
    log.verbose('EmbeddingCache', 'init()')

    if (!fs.existsSync(this.directory)) {
      throw new Error(`directory not exist: ${this.directory}`)
    }

    this.db = new DbCache(path.join(this.directory, 'embedding.db'))
  }

  public async embedding(relativePath: string): Promise<FaceEmbedding>
  public async embedding(relativePath: string, embedding: FaceEmbedding): Promise<void>

  public async embedding(
    relativePath: string,
    embedding?:   FaceEmbedding,
  ): Promise<FaceEmbedding | void> {
    log.verbose('EmbeddingCache', 'embedding(%s, %s)', relativePath, embedding)

    if (embedding) {
      await this.db.put(relativePath, embedding)
      return
    }

    const v = await this.db.get(relativePath)
    if (v) {
      log.silly('EmbeddingCache', 'embedding() cache HIT')
      return v as FaceEmbedding
    }

    const fullPathName = path.join(this.directory, relativePath)

    const image = await loadImage(fullPathName)
    const imageData = imageToData(image)

    const face = new Face(imageData, [0, 0, imageData.width, imageData.height])

    await this.facenet.embedding(face)
    await this.db.put(relativePath, face.embedding)
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
