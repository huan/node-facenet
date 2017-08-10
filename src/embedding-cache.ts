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

export interface EmbeddingCacheData {
  [key: string]: FaceEmbedding,
}

export class EmbeddingCache {
  public dbPath:  string
  public db:      levelup.LevelUp

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

  private async dbGet(key: string): Promise<FaceEmbedding | null> {
    log.silly('EmbeddingCache', 'dbGet(%s)', key)

    return new Promise<FaceEmbedding | null>((resolve, reject) => {
      this.db.get(key, (err, val) => {
        if (err) {
          if (/NotFoundError/.test(err)) {
            return resolve(null)
          }
          reject(err)
        } else {
          return resolve(val)
        }
      })
    })
  }

  private async dbPut(key: string, val: FaceEmbedding): Promise<void> {
    log.silly('EmbeddingCache', 'dbPut(%s, %s)', key, val)

    this.cacheData = {} // refresh cache

    return new Promise<void>((resolve, reject) => {
      this.db.put(key, val, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  public async dbData(): Promise<EmbeddingCacheData> {
    log.verbose('EmbeddingCache', 'dbData()')

    if (this.cacheData && Object.keys(this.cacheData).length) {
      return this.cacheData
    }

    this.cacheData = {}

    return new Promise<any>((resolve, reject) => {
      this.db.createReadStream()
      .on('data', (data: any) => {
        log.silly('EmbeddingCache', 'dbData() on(data) %s', data)
        this.cacheData[data.key] = data.val
      })
      .on('error', reject)
      .on('close', () => resolve(this.cacheData))
      .on('end', () => resolve(this.cacheData))
    })

  }

  public async dbCount(): Promise<number> {
    log.verbose('EmbeddingCache', 'dbCount()')

    const cacheData = await this.dbData()
    return Object.keys(cacheData).length
  }

  public async clean(): Promise<void> {
    log.verbose('EmbeddingCache', 'clean()')
    return new Promise<void>((resolve, reject) => {
      rimraf(this.dbPath, (err) => {
        if (err) {
          return reject(err)
        }
        return resolve()
      })
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
