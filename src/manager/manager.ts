import fs            from 'fs'
import path          from 'path'

import blessed     from 'blessed'

import {
  log,
  MODULE_ROOT,
}                       from '../config'

import {
  Facenet,
}                       from '../facenet'

import {
  AlignmentCache,
  EmbeddingCache,
  FaceCache,
}                       from '../cache/'

import {
  clear,
  Frame,
  Menu,
}                       from './ui/'

import {
  AlignmentEmbedding,
}                       from './alignment-embedding/'
import {
  FaceGrouper,
}                       from './face-grouper/'

interface MenuItem {
  text:     string,
  callback: () => Promise<boolean>,
}

export class Manager {
  private facenet        : Facenet
  private alignmentCache : AlignmentCache
  private embeddingCache : EmbeddingCache
  private faceCache      : FaceCache

  private frame!: Frame
  private screen: blessed.Widgets.Screen
  private menu!: Menu

  constructor() {
    log.verbose('Manager', 'constructor()')

    const workdir = path.join(MODULE_ROOT, 'cache')
    if (!fs.existsSync(workdir)) {
      fs.mkdirSync(workdir)
    }

    this.facenet        = new Facenet()
    this.faceCache      = new FaceCache(workdir)
    this.alignmentCache = new AlignmentCache(this.facenet, this.faceCache, workdir)
    this.embeddingCache = new EmbeddingCache(this.facenet, workdir)

    this.screen = blessed.screen({
      smartCSR: true,
      warnings: true,
      // log: '/tmp/fm.log' as any,
    })
  }

  public async init(): Promise<void> {
    log.verbose('Manager', 'init()')

    await this.alignmentCache.init()
    await this.embeddingCache.init()
    await this.faceCache.init()

    this.frame = new Frame(this.screen)

    log.enableLogging((text: string) => this.frame.emit('log', text))

    const menuTextList = this.menuItemList().map(m => m.text)
    this.menu = new Menu(
      this.screen,
      menuTextList,
    )
  }

  private menuItemList(): MenuItem[] {
    return [
      {
        text     : 'Face Alignment & Embedding Demo',
        callback : async () => {
          await this.alignmentEmbedding()
          return true
        },
      },
      {
        text     : 'Validate on LFW(To Be Implemented)',
        callback : async () => {
          console.info('validate lfw')
          return true
        },
      },
      {
        text     : 'Group Photos by Face',
        callback : async () => {
          await this.faceGrouper()
          return true
        },
      },
      {
        text     : 'Quit',
        callback : async () => {
          this.quit()
          return false
        },
      },
    ]
  }

  public async start(): Promise<void> {
    log.verbose('Manager', 'start()')

    let menuCallback = async () => {
      log.error('Manager', 'start() no menuCallback!')
      return false
    }

    const menuCallbackList = this.menuItemList()
                                  .map(m => m.callback)

    let firstTime = true
    do {
      clear(this.screen)

      const idx = await this.menu.start(firstTime)
      if (firstTime) {
        firstTime = false
      }

      clear(this.screen)
      await this.frame.init()

      menuCallback = menuCallbackList[idx]
    } while (await menuCallback())

  }

  public async quit(): Promise<void> {
    await this.facenet.quit()
    this.screen.destroy()
  }

  public async alignmentEmbedding(
    pathname?: string,
  ): Promise<void> {
    log.verbose('Manager', 'alignmentEmbedding(%s)', pathname ? pathname : '')

    const ae = new AlignmentEmbedding(
      this.frame,
      this.faceCache,
      this.alignmentCache,
      this.embeddingCache,
    )
    await ae.start(pathname)
  }

  private async faceGrouper(
    pathname?: string,
  ): Promise<void> {
    log.verbose('Manager', 'faceGrouper(%s)', pathname ? pathname : '')

    const grouper = new FaceGrouper(
      this.frame,
      this.faceCache,
      this.alignmentCache,
      this.embeddingCache,
    )
    await grouper.start(pathname)
  }

  public sort(pathname: string) {
    console.info(pathname)
    //
  }

  public validate() {
    console.info('validate')
    //
  }
}

export default Manager
