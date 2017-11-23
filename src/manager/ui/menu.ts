import * as blessed from 'blessed'

import {
  log,
  FILE_FACENET_ICON_PNG,
  VERSION,
}                         from '../../config'

export class Menu {
  constructor(
    public screen:    blessed.Widgets.Screen,
    public menuList:  string[],
  ) {
    log.verbose('Menu', 'constructor()')

    for (const i in this.menuList) {
      menuList[i] = ' ' + (parseInt(i) + 1) + '. ' + menuList[i]
    }

  }

  public async start(wait = true): Promise<number> {
    log.verbose('Menu', 'start()')

    this.screen.title = 'FaceNet Manager'

    this.backgroundElement()
    this.logoElement()
    this.textElement()
    this.versionElement()

    if (wait) {
      await this.pressElement()
    }

    const menuIndex = await this.menuElement()
    return menuIndex
  }

  private backgroundElement() {
    log.verbose('Menu', 'backgroundElement()')
    const box = blessed.box({
      top:     0,
      left:    0,
      width:   this.screen.width,
      height:  this.screen.height,
      padding: 0,
      style: {
        fg: 'green',
        bg: 'blue',
      },
    })
    this.screen.append(box)
  }

  private logoElement() {
    log.verbose('Menu', 'logoElement()')
    // FIXME: blessed typing BUG: no Image exported
    const icon = (blessed.widget as any).image({
      file:   FILE_FACENET_ICON_PNG,
      type:   'ansi',
      left:   'center',
      top:    0,
      width:  32,
      height: 16,
    }) as blessed.Widgets.ImageElement
    this.screen.append(icon)
  }

  private textElement() {
    log.verbose('Menu', 'textElement()')
    const bigText = blessed.bigtext({
      top:     16,
      left:    'center',
      width:   60,
      height:  16,
      content: 'FaceNet',
      style:   {
        fg: 'green',
        bg: 'blue',
      },
    })
    this.screen.append(bigText)
  }

  private versionElement() {
    log.verbose('Menu', 'versionElement()')

    const version = blessed.box({
      content: 'Manager version ' + VERSION,
      top:     29,
      left:    'center',
      height:  1,
      width:   50,
      align:   'right',
      style:   {
        fg: 'white',
        bg: 'blue',

      },
    })
    this.screen.append(version)
  }

  private pressElement(): Promise<void> {
    log.verbose('Menu', 'pressElement()')

    const pressKey = blessed.box({
      top:    (this.screen.height) as number - 5,
      left:   'center',
      height: 1,
      width:  30,
      style:  {
        fg: 'white',
        bg: 'blue',
      },
      content: 'Press any key to continue...',
    })
    this.screen.append(pressKey)

    pressKey.hide() // show message at first, because setInterval will run immediately
    const timer = setInterval(() => {
      pressKey.visible
        ? pressKey.hide()
        : pressKey.show()
      this.screen.render() // have to do this to update screen
    }, 1000)

    return new Promise<void>((resolve) => {
      this.screen.once('keypress', () => {
        clearInterval(timer)
        pressKey.hide()
        return resolve()
      })
    })
  }

  private async menuElement(): Promise<number> {
    log.verbose('Menu', 'menuElement()')

    const list = blessed.list({
      label:  '{bold}{cyan-fg} Menu {/cyan-fg}{/bold}',
      tags:   true,
      top:    31,
      left:   'center',
      width:  50,
      height: this.menuList.length + 2,
      keys:   true,
      vi:     true,
      mouse:  true,
      border: 'line',
      style:  {
        item: {
          hover: {
            bg: 'blue',
          },
        },
        selected: {
          bg: 'blue',
          bold: true,
        },
      },
    })
    list.setItems(this.menuList as any)
    list.focus()
    ; // seprate the following ()
    (list as any).enterSelected(0)

    this.screen.append(list)
    this.screen.render()

    return new Promise<number>(resolve => {
      list.once('select', (_, selected) => resolve(selected))
    })
  }
}

export default Menu
