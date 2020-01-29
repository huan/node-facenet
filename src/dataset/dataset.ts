import path  from 'path'

import glob  from 'glob'

import {
  log,
}                 from '../config'

export interface IdImageList {
  [id: string]: string[], // relative path
}

export abstract class Dataset {
  // all is relative path
  // all is relative path
  private imageListCache!: string[]
  private idImageListCache!: IdImageList

  constructor(
    public directory: string,
    public ext = 'jpg',
  ) {
    log.verbose('Dataset', 'constructor(directory=%s, ext=%s)',
                            directory,
                            ext,
              )
  }

  public abstract async setup(): Promise<void>  // Should be used to download/extract/initialize dataset files

  public async idList(): Promise<string[]> {
    log.verbose('Dataset', 'idList()')

    const data = await this.idImageList()
    return Object.keys(data)
  }

  /**
   * return relative paths
   */
  public async imageList(): Promise<string[]> {
    log.verbose('Dataset', 'imageList()')

    if (this.imageListCache) {
      return this.imageListCache
    }

    return new Promise<string[]>((resolve, reject) => {
      glob(`${this.directory}/**/*.${this.ext}`, (err, matches) => {
        if (err) {
          return reject(err)
        }
        this.imageListCache = matches.map(match => path.relative(this.directory, match))
        log.verbose('Dataset', 'imageList() loaded')
        resolve(this.imageListCache)
      })
    })
  }

  public async idImageList(): Promise<IdImageList> {
    log.verbose('Dataset', 'idImageList()')

    if (this.idImageListCache && Object.keys(this.idImageListCache).length) {
      return this.idImageListCache
    }
    this.idImageListCache = {}

    const imageList = await this.imageList()

    imageList.forEach(imagePath => {
      const parts = imagePath.split(path.sep)
      const id    = parts.slice(-2, -1)[0]
      const image = parts.slice(-1)[0]
      if (Array.isArray(this.idImageListCache[id])) {
        this.idImageListCache[id].push(image)
      } else {
        this.idImageListCache[id] = [image]
      }
    })

    log.verbose('Dataset', 'idImageListCache() loaded %d ids',
                            Object.keys(this.idImageListCache).length,
              )
    return this.idImageListCache
  }
}
