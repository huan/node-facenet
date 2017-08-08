import * as path  from 'path'

import * as glob  from 'glob'

import { log }    from './config'

export interface IdImageList {
  [id: string]: string[],
}

export class Dataset {
  private idListCache: string[]
  private imageListCache: string[]
  private idImageListCache: IdImageList

  constructor(
    public directory: string,
    private ext: string = 'jpg',
  ) {
    log.verbose('Dataset', 'constructor(%s, %s)',
                            directory,
                            ext,
              )
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

  public async idList(): Promise<string[]> {
    log.verbose('Dataset', 'idList()')

    if (this.idListCache) {
      return this.idListCache
    }
    return [] // TODO
  }

  public async idImageList(): Promise<IdImageList> {
    log.verbose('Dataset', 'idImageList()')

    if (this.idImageListCache) {
      return this.idImageListCache
    }
    return {
      'x': [],
    } // TODO
  }
}
