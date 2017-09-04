import {
  widget,
  // Widgets,
}               from 'blessed'

import {
  log,
}               from '../config'

import {
  MainFrame,
}               from './ui/main-frame'

import {
  SplashMenu,
}               from './ui/splash-menu'

interface MenuItem {
  text:     string,
  callback: Function,
}

export class Manager {
  private mainFrame:  MainFrame
  private screen:     widget.Screen
  private splashMenu: SplashMenu

  private menuItemList: MenuItem[]

  constructor() {
    log.verbose('Manager', 'constructor()')
    this.screen = new widget.Screen({
      smartCSR: true,
      warnings: true,
    })
  }

  public async init(): Promise<void> {
    log.verbose('Manager', 'init()')

    this.mainFrame = new MainFrame(this.screen)

    this.menuItemList = [
      {
        text: 'Validate on LFW',
        callback: () => console.log('validate lfw'),
      },
      {
        text: 'Photo Alignment',
        callback: () => console.log('alignment'),
      },
      {
        text: 'Face Embedding',
        callback: () => console.log('embedding'),
      },
      {
        text: 'Show Distance Between Faces',
        callback: () => console.log('visulize'),
      },
      {
        text: 'Sort Photos Group by Face',
        callback: () => console.log('sort'),
      },
    ]

    this.splashMenu = new SplashMenu(
      this.screen,
      this.menuItemList.map(m => m.text),
    )
  }

  public async start(): Promise<void> {
    log.verbose('Manager', 'start()')

    const menuIndex = await this.splashMenu.start()

    const callback = this.menuItemList
                          .map(m => m.callback)
                          [menuIndex]

    callback()

    this.screen.key(['escape', 'q', 'x', 'C-q', 'C-x', 'f4', 'f10'], (/* ch: any, key: any */) => {
      this.screen.destroy()
    })

    await this.mainFrame.init()

    return new Promise<void>((resolve) => {
      this.screen.once('destroy', resolve)
    })
  }

  public async align(file: string) {
    log.verbose('Manager', 'align(%s)', file)

  }

  public async validate(path: string) {
    log.verbose('Manager', 'validate(%s)', path)
  }

  public async validateDataset(dataset = 'lfw') {
    log.verbose('Manager', 'validateDateset(%s)', dataset)
  }

  public async visualize(file: string) {
    log.verbose('Manager', 'visualize(%s)', file)
  }

  public async sort(path: string) {
    log.verbose('Manager', 'sort(%s)', path)
  }

  public async embedding(file: string) {
    log.verbose('Manager', 'embedding(%s)', file)
  }

}

export default Manager
