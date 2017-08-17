import * as fs        from 'fs'
import * as path      from 'path'

import * as levelup   from 'levelup'
import * as rimraf    from 'rimraf'

import { log }        from '../config'

export interface DbEntryList {
  [key: string]: Object,
}

export class DbCache {
  public db:        levelup.LevelUp
  public entryList: DbEntryList

  constructor(
    public directory: string,
    public dbName?:   string,
  ) {
    if (!this.dbName) {
      this.dbName = 'leveldb.default'
    } else {
      this.dbName = 'leveldb.' + this.dbName
    }

    if (!fs.existsSync(this.directory)) {
      throw new Error(`directory not exist: ${this.directory}`)
    }
    this.db = levelup(
      path.join(directory, this.dbName),
      {
        valueEncoding: 'json',
      },
    )
    this.entryList = {}
  }

  public async get(key: string): Promise<Object | null> {
    log.silly('DbCache', 'get(%s)', key)

    return new Promise<Object | null>((resolve, reject) => {
      this.db.get(key, (err, value) => {
        if (err) {
          if (/NotFoundError/.test(err)) {
            return resolve(null)
          }
          reject(err)
        } else {
          return resolve(value)
        }
      })
    })
  }

  public async put(key: string, value: Object): Promise<void> {
    log.silly('DbCache', 'put("%s", "%s")', key, value)

    this.entryList = {} // refresh

    return new Promise<void>((resolve, reject) => {
      this.db.put(key, value, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  public async list(): Promise<DbEntryList> {
    log.verbose('DbCache', 'list()')

    if (this.entryList && Object.keys(this.entryList).length) {
      return this.entryList
    }

    this.entryList = {}

    return new Promise<any>((resolve, reject) => {
      this.db.createReadStream()
      .on('data', (data: any) => {
        log.silly('DbCache', 'list() on(data) %s', data)
        this.entryList[data.key] = data.value
      })
      .on('error', reject)
      .on('close', () => resolve(this.entryList))
      .on('end', () => resolve(this.entryList))
    })

  }

  public async count(): Promise<number> {
    log.verbose('DbCache', 'count()')

    const entryList = await this.list()
    return Object.keys(entryList).length
  }

  public close(): void {
    this.db.close()
  }

  public async clean(): Promise<void> {
    log.verbose('DbCache', 'clean()')
    this.db.close()
    return new Promise<void>((resolve, reject) => {
      const dbName = this.dbName
      if (!dbName) {
        return reject('no dbName')
      }
      const dbPath = path.join(this.directory, dbName)
      rimraf(dbPath, (err) => {
        if (err) {
          return reject(err)
        }
        return resolve()
      })
    })
  }
}
