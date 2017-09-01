async function mainScreen(screen: widget.Screen) {
  const THUMB_HEIGHT = 20

  let top   = 0

  const header = new widget.Box({
    top,
    left: 0,
    width: '100%',
    height: 1,
    style: {
      bg: 'blue',
    },
    tags: true,
    content: `FaceNet Manager v${VERSION}{|}https://github.com/zixia/node-facenet`,
  })
  screen.append(header)
  top += 1

  const imageOptions: Widgets.ImageOptions = {
    file: FILE_FACENET_ICON_PNG,
    type: 'ansi',
    right: 0,
    top: 0,
    border: 'line',
    style: {
      border: {
        fg: 'cyan',
      },
    },
    width: 40,
    height: THUMB_HEIGHT,
  }

  imageOptions.top = top
  // Blessed issue #309 https://github.com/chjj/blessed/issues/309
  const thumb1 = new (widget as any).Image(
    Object.assign({}, imageOptions)) as Widgets.ImageElement
  screen.append(thumb1)
  top += THUMB_HEIGHT

  const distance12 = new widget.Box({
    top,
    right: 0,
    width: 40,
    height: 1,
    bg: 'green',
    fg: 'white',
    tags: true,
    content: '{center}distance: 0.63{/center}',
  })
  screen.append(distance12)
  top += 1

  imageOptions.top = top
  const thumb2 = new (widget as any).Image(
    Object.assign({}, imageOptions)) as Widgets.ImageElement
  screen.append(thumb2)
  top += THUMB_HEIGHT

  const distance23 = new widget.Box({
    top,
    right: 0,
    width: 40,
    height: 1,
    bg: 'red',
    fg: 'white',
    tags: true,
    content: '{center}distance: 1.43{/center}',
  })
  screen.append(distance23)
  top += 1

  imageOptions.top = top
  const thumb3 = new (widget as any).Image(Object.assign({}, imageOptions))  as Widgets.ImageElement
  screen.append(thumb3)

  const mainBox = new widget.Box({
    top: 1,
    right: 40,
    width: (screen.width as number) - 40,
    height: (screen.height as number) - 1,
    padding: 0,
    // border: 'line',
  })
  screen.append(mainBox)

  const grid = new contrib.grid({
    rows: 12,
    cols: 12,
    screen: mainBox,
  })

  const bigImage = grid.set(0, 6, 6, 6, (widget as any).Image) as Widgets.ImageElement
  const logBox    = grid.set(6, 6, 6, 6, widget.Box, {
    line: 'blue',
    content: 'logger',
  }) as Widgets.BoxElement

  const tree =  grid.set(0, 0, 12, 6, contrib.tree, {
    style: {
      text: 'red',
    },
    template: {
      lines: true,
    },
    label: 'Filesystem Tree',
  })

  const status = new widget.Box({
    parent: screen,
    bottom: 0,
    right: 0,
    height: 1,
    width: 'shrink',
    style: {
      bg: 'blue',
    },
    content: 'Select your piece of ANSI art (`/` to search).',
  }) as Widgets.BoxElement

  screen.append(status)

  screen.render()

  // const manager = new Manager(screen)

  // ui.thumb = 'file1.png'
  // ui.thumb = 'file2.png'
  // ui.thumb = 'file3.png'

  // ui.image = 'file-large.png'
  // ui.

  screen.on('resize', function() {
    mainBox.height  = (screen.height as number) - 1
    mainBox.width   = (screen.width as number) - 40
    console.log(contrib)
    // FIXME: emit typing
    bigImage.emit('attach')
    tree.emit('attach')
    logBox.emit('attach')
  })
}
