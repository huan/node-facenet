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
    const box = new widget.Box({
      top:     0,
      left:    0,
      width:   screen.width,
      height:  screen.height,
      padding: 0,
      // content: 'Hello {bold}world{/bold}!',
      style: {
        fg: 'green',
        bg: 'blue',
      },
    })
    this.screen.append(box)
  }

  private logoElement() {
    const icon = new (widget as any).Image({
      file  : FILE_FACENET_ICON_PNG,

      type:   'ansi',
      left:   'center',
      top:    0,
      width:  32,
      height: 16,
    }) as Widgets.ImageElement
    this.screen.append(icon)
  }

  private textElement() {
    const bigText = new widget.BigText({
      top : 16,
      left: 'center',
      // border: 'line',
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
    const pressKey = new widget.Box({
      top:    (screen.height) as number - 5,
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
        resolve()
      })
    })
  }

  private async menuElement(): Promise<number> {
    const menuItemList = this.menuList.map(m => m.text)

    const list = new widget.List({
      label:  '{bold}{cyan-fg} Menu {/cyan-fg}{/bold}',
      tags:   true,
      top:    30,
      left:   'center',
      width:  30,
      height: menuItemList.length + 2,
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

    for (const i in menuItemList) {
      menuItemList[i] = (parseInt(i) + 1) + '. ' + menuItemList[i]
    }
    list.setItems(menuItemList as any)

    // list.items.forEach(function(item, i) {
    //   const text = item.getText();
    //   item.setHover(map[text]);
    // });

    list.focus()
    ; // seprate the following ()
    (list as any).enterSelected(0)

    return new Promise<number>(resolve => {
      list.once('select', (_, selected) => resolve(selected))
    })
  }
}

export default SplashMenu
