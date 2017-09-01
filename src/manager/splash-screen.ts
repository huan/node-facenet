async function splashScreen(screen: widget.Screen): Promise<void> {
  screen.title = 'FaceNet Manager';

  const box = new widget.Box({
    top: 0,
    left: 0,
    width: screen.width,
    height: screen.height,
    padding: 0,
    // content: 'Hello {bold}world{/bold}!',
    style: {
      fg: 'green',
      bg: 'blue',
    },
  })
  screen.append(box)

  const imageOptions: Widgets.ImageOptions = {
    file: FILE_FACENET_ICON_PNG,
    type: 'ansi',
    left: 'center',
    top: 0,
    width: 32,
    height: 16,
  }
  const icon = new (widget as any).Image(imageOptions) as Widgets.ImageElement

  screen.append(icon)

  const bigText = new widget.BigText({
    top: 16,
    left: 'center',
    // border: 'line',
    width: 60,
    height: 16,
    content: 'FaceNet',
    style: {
      fg: 'green',
      bg: 'blue',
    },
  })

  screen.append(bigText)

  const version = new widget.Box({
    top: 29,
    left: 'center',
    height: 1,
    width: 50,
    align: 'right',
    style: {
      fg: 'white',
      bg: 'blue',

    },
    content: 'Manager version ' + VERSION,
  })
  screen.append(version)

  const menuItemList = [
    'Alignment Test',
    'Embedding Test',
    'Visualize a Photo',
    'LFW Dataset Validation',
    'Photos Classifier',
  ] as any
  const list = new widget.List({
    parent: screen,
    label: '{bold}{cyan-fg} Menu {/cyan-fg}{/bold}',
    tags: true,
    top: 30,
    left: 'center',
    width: 30,
    height: menuItemList.length + 2,
    keys: true,
    vi: true,
    mouse: true,
    border: 'line',
    style: {
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
  list.setItems(menuItemList)

  screen.append(list)

  const pressKey = new widget.Box({
    top: (screen.height) as number - 5,
    left: 'center',
    height: 1,
    width: 30,
    style: {
      fg: 'white',
      bg: 'blue',
    },
    content: 'Press any key to continue...',
  })

  screen.append(pressKey)
  const timer = setInterval(() => {
    pressKey.visible
      ? pressKey.hide()
      : pressKey.show()
    screen.render() // have to do this to update screen
  }, 1000)

  screen.render()

  return new Promise<void>((/* resolve */) => {
    screen.once('keypress', () => {
      clearInterval(timer)
      pressKey.hide()
      // resolve()
    })

    function onClick(data: any) {
      if (data.action === 'mouseup') {
        clearInterval(timer)
        pressKey.hide()
        screen.removeListener('mouse', onClick)
        // return resolve()
      }
    }
    screen.on('mouse', onClick)
  })
}
