import * as fs    from 'fs'
import * as path  from 'path'

import {
  widget,
  // Widgets,
}                 from 'blessed'

import {
  log,
  MODULE_ROOT,
}                 from '../config'

import {
  Facenet,
}                 from '../facenet'

import {
  AlignmentCache,
  EmbeddingCache,
}                 from '../cache/'

import {
  clear,
  Frame,
  Menu,
}                 from './ui/'

import {
  Demo,
}                 from './demo/'

interface MenuItem {
  text:     string,
  callback: () => Promise<void>,
}

export class Manager {
  private facenet:        Facenet
  private alignmentCache: AlignmentCache
  private embeddingCache: EmbeddingCache

  private frame:  Frame
  private screen: widget.Screen
  private menu:   Menu

  private menuItemList: MenuItem[]

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

    this.menuItemList = [
      {
        text: 'Face Alignment & Embedding Demo',
        callback: async () => console.log('demo'),
      },
      {
        text: 'Validate on LFW',
        callback: async () => console.log('validate lfw'),
      },
      {
        text: 'Sort Photos Group by Face',
        callback: async () => console.log('sort'),
      },
    ]

    this.menu = new Menu(
      this.screen,
      this.menuItemList.map(m => m.text),
    )
  }

  public async start(): Promise<void> {
    log.verbose('Manager', 'start()')

    const menuIndex = await this.menu.start()

    clear(this.screen)

    const callback = this.menuItemList
                          .map(m => m.callback)
                          [menuIndex]

    this.screen.key(['escape', 'q', 'x', 'C-q', 'C-x', 'f4', 'f10'], (/* ch: any, key: any */) => {
      this.screen.destroy()
    })

    await callback()

    await this.frame.init()

    const demo = new Demo(
      this.frame,
      this.alignmentCache,
      this.embeddingCache,
    )
    await demo.start()

    // const testFile = path.join(
    //   MODULE_ROOT,
    //   'tests/fixtures/rgb-bwt.png',
    // )
    // const testFace = new Face(
    //   path.join(
    //     MODULE_ROOT,
    //     'tests/fixtures/aligned-face.png',
    //   ),
    // )

    // this.frame.emit('image', testFile)
    // this.frame.emit('face', testFace)
    // this.frame.emit('face', testFace)

    this.screen.render()

    return new Promise<void>((resolve) => {
      this.screen.once('destroy', async () => {
        await this.quit()
        return resolve()
      })
    })
  }

  public async quit(): Promise<void> {
    await this.facenet.quit()
    this.screen.destroy()
  }
}

export default Manager
