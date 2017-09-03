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
  menuScreen,
}               from './ui/splash-screen'

export class Manager {
  private screen: widget.Screen
  private mainFrame: MainFrame

  constructor() {
    log.verbose('Manager', 'constructor()')
    this.screen = new widget.Screen({
      smartCSR: true,
      warnings: true,
    })

    this.mainFrame = new MainFrame(this.screen)
  }

  public init() {
    log.verbose('Manager', 'init()')
  }

  public async start(): Promise<void> {
    log.verbose('Manager', 'start()')
    // this.screen.render()

    this.screen.key(['escape', 'q', 'x', 'C-q', 'C-x', 'f4', 'f10'], (/* ch: any, key: any */) => {
      this.screen.destroy()
    })

    await menuScreen(this.screen)
    this.mainFrame.init()

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
