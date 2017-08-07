import * as fs          from 'fs'
import * as path        from 'path'

import * as levelup     from 'levelup'

import {
  Facenet,
  FaceEmbedding,
}                       from './facenet'
import { FaceImage }    from './face-image'
import { Face }         from './face'
import { log }          from './config'

export class EmbeddingCache {
  public dbFile:  string
  public db:      levelup.LevelUp

  constructor(
    public facenet: Facenet,
    public rootDir: string,
  ) {
    log.verbose('EmbeddingCache', 'constructor(%s)', rootDir)
    this.dbFile = path.join(rootDir, 'embedding.db')
  }

  public init(): void {
    log.verbose('Lfw', 'initDb()')

    if (fs.existsSync(this.rootDir)) {
      throw new Error(`directory not exist: ${this.rootDir}`)
    }

    this.db = levelup(this.dbFile, {
      valueEncoding: 'json',
    })
  }

  private async dbGet(key: string): Promise<FaceEmbedding> {
    return new Promise<FaceEmbedding>((resolve, reject) => {
      this.db.get(key, (err, val) => {
        if (err) {
          reject(err)
        } else {
          resolve(val)
        }
      })
    })
  }

  private async dbPut(key: string, val: FaceEmbedding): Promise<void> {
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

  public async embedding(relativePath: string): Promise<FaceEmbedding>
  public async embedding(relativePath: string, embedding: FaceEmbedding): Promise<void>

  public async embedding(
    relativePath: string,
    embedding?:   FaceEmbedding,
  ): Promise<FaceEmbedding | void> {
    if (embedding) {
      this.dbPut(relativePath, embedding)
      return
    }

    const v: FaceEmbedding = await this.dbGet(relativePath)
    if (v) {
      return v
    }

    const fullPathName = path.join(this.rootDir, relativePath)
    const image = new FaceImage(fullPathName)
    const face: Face  = image.asFace()

    this.facenet.embedding(face)
    await this.dbPut(relativePath, face.embedding)
    return face.embedding
  }
}
