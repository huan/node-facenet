import {
  widget,
  Widgets,
}                         from 'blessed'

import {
  log,
  FILE_FACENET_ICON_PNG,
  VERSION,
}                         from '../../config'

export class SplashMenu {
  constructor(
    public screen:    Widgets.Screen,
    public menuList:  string[],
  ) {
    log.verbose('SplashMenu', 'constructor()')

    for (const i in this.menuList) {
      menuList[i] = ' ' + (parseInt(i) + 1) + '. ' + menuList[i]
    }

  }

  public async start(): Promise<number> {
    log.verbose('SplashMenu', 'start()')

    this.screen.title = 'FaceNet Manager'

    this.backgroundElement()
    this.logoElement()
    this.textElement()
    this.versionElement()

    await this.pressElement()

    const menuIndex = await this.menuElement()
    return menuIndex
  }

  private backgroundElement() {
    log.verbose('SplashMenu', 'backgroundElement()')
    const box = new widget.Box({
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
    log.verbose('SplashMenu', 'logoElement()')
    const icon = new (widget as any).Image({
      file:   FILE_FACENET_ICON_PNG,
      type:   'ansi',
      left:   'center',
      top:    0,
      width:  32,
      height: 16,
    }) as Widgets.ImageElement
    this.screen.append(icon)
  }

  private textElement() {
    log.verbose('SplashMenu', 'textElement()')
    const bigText = new widget.BigText({
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
    log.verbose('SplashMenu', 'versionElement()')

    const version = new widget.Box({
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
    log.verbose('SplashMenu', 'pressElement()')

    const pressKey = new widget.Box({
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
    log.verbose('SplashMenu', 'menuElement()')

    const list = new widget.List({
      label:  '{bold}{cyan-fg} Menu {/cyan-fg}{/bold}',
      tags:   true,
      top:    31,
      left:   'center',
      width:  40,
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

export default SplashMenu
