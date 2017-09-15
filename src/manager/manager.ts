import * as fs            from 'fs'
import * as path          from 'path'

import {
  widget,
  // Widgets,
}                       from 'blessed'

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
}                       from '../cache/'

import {
  clear,
  Frame,
  Menu,
}                       from './ui/'

import {
  AlignmentEmbedding,
}                       from './alignment-embedding/'

interface MenuItem {
  text:     string,
  callback: () => Promise<boolean>,
}

export class Manager {
  private facenet:        Facenet
  private alignmentCache: AlignmentCache
  private embeddingCache: EmbeddingCache

  private frame:  Frame
  private screen: widget.Screen
  private menu:   Menu

  constructor() {
    log.verbose('Manager', 'constructor()')

    const cacheDir = path.join(MODULE_ROOT, 'cache')
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir)
    }

    this.facenet        = new Facenet()
    this.alignmentCache = new AlignmentCache(this.facenet, cacheDir)
    this.embeddingCache = new EmbeddingCache(this.facenet, cacheDir)

    this.screen = new widget.Screen({
      smartCSR: true,
      warnings: true,
      // log: '/tmp/fm.log' as any,
    })
  }

  public async init(): Promise<void> {
    log.verbose('Manager', 'init()')

    await this.alignmentCache.init()
    await this.embeddingCache.init()

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
        text     : 'Validate on LFW',
        callback : async () => {
          console.log('validate lfw')
          return true
        },
      },
      {
        text     : 'Sort Photos Group by Face',
        callback : async () => {
          console.log('sort')
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

    do {
      clear(this.screen)
      const idx = await this.menu.start()

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
    log.verbose('Manager', 'alignmentEmbedding(%s)', pathname)

    const ae = new AlignmentEmbedding(
      this.frame,
      this.alignmentCache,
      this.embeddingCache,
    )
    await ae.start(pathname)
  }

  public sort(pathname: string) {
    console.log(pathname)
    //
  }

  public validate() {
    console.log('validate')
    //
  }
}

export default Manager
