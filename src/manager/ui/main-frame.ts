import * as path          from 'path'
import { EventEmitter }   from 'events'

import {
  widget,
  Widgets,
}                         from 'blessed'
const contrib             = require('blessed-contrib')

import {
  clear,
}                         from './ui'

import {
  MODULE_ROOT,
  VERSION,
}                         from '../../config'

export type MainFrameEventName = 'title'
                                | 'thumb'
                                | 'log'
                                | 'image'
                                | 'status'

const FILE_FACENET_ICON_PNG = path.join(
  MODULE_ROOT,
  'docs',
  'images',
  'facenet-icon.png',
)

export class MainFrame extends EventEmitter {
  private thumbList: Widgets.ImageElement[]
  private distanceList: Widgets.BoxElement[]

  constructor(
    public screen: Widgets.Screen,
  ) {
    super()
  }

  public async init() {
    this.thumbList    = []
    this.distanceList = []
    clear(this.screen)

    const thumbWidth  = 40
    const imageHeight = 3 * (thumbWidth / 2)
    const imageWidth  = 4 * (thumbWidth / 2)

    this.headerElement()
    this.thumbElementList(thumbWidth)
    this.imageElement(thumbWidth, imageWidth, imageHeight)
    this.gridElement(imageHeight, thumbWidth, imageWidth)
    this.statusElement()
  }

  public emit(event: MainFrameEventName, data: any) {
    return super.emit(event, data)
  }

  private headerElement(): Widgets.BoxElement {
    const box = new widget.Box({
      top   : 0,
      left  : 0,
      width : '100%',
      height: 1,
      style : {
        bg: 'blue',
      },
      tags   : true,
      content: `FaceNet Manager v${VERSION}{|}https://github.com/zixia/node-facenet`,
    })
    this.on('title', title => box.setContent(title))
    return box
  }

  private thumbElementList(height: number): void {
    let top = 1

    do {
      const thumbElement = new (widget as any).Image({
        top   : top,
        width : height,
        height: height,
        file  : FILE_FACENET_ICON_PNG,

        type  : 'ansi',
        right : 0,
        border: 'line',
        style : {
          border: {
            fg: 'cyan',
          },
        },
      }) as Widgets.ImageElement

      const distanceElement = new widget.Box({
        top    : top + height,
        width  : height,
        right  : 0,
        height : 1,
        bg     : 'green',
        fg     : 'white',
        tags   : true,
        content: '{center}distance: 0.75{/center}',
      })

      this.thumbList.push(thumbElement)
      this.distanceList.push(distanceElement)

      this.screen.append(thumbElement)
      this.screen.append(distanceElement)

      top += height

    } while (top < this.screen.height)
  }

  private imageElement(
    paddingRight: number,
    width:        number,
    height:       number,
  ): void {
    const image = new (widget as any).Image({
      paddingRight,
      width,
      height,
      file  : FILE_FACENET_ICON_PNG,

      top   : 1,
      type  : 'ansi',
      border: 'line',
      style : {
        border: {
          fg: 'cyan',
        },
      },
    })
    // FIXME setImage
    this.on('image', filepath => image.setImage(filepath))
    this.screen.append(image)
  }

  private gridElement(
    paddingTop:   number,
    paddingRight: number,
    width:        number,
  ): void {
    const box = new widget.Box({
      top:    paddingTop,
      right:  paddingRight,
      width,
      height: (this.screen.height as number) - paddingTop,

      bottom: 0,

      style: {
        bg: 'blue',
      },
    })

    const grid = new contrib.grid({
      screen: box,
      rows: 6,
      cols: 6,
    })
    const log = grid.set(0, 0, 6, 6, contrib.log, {
      fg        : 'green',
      selectedFg: 'green',
      label     : 'Log',
    })

    this.on('log', text => log.log(text))
  }

  private statusElement(): void {
    const status = new widget.Box({
      bottom: 0,
      right: 0,
      height: 1,
      width: 'shrink',
      style: {
        bg: 'blue',
      },
      content: 'Status messages here.',
    })
    this.on('status', text => status.setContent(text))
    this.screen.append(status)
  }
  // hit/miss    process time

}

//   screen.render()

//   screen.on('resize', function() {
//     mainBox.height  = (screen.height as number) - 1
//     mainBox.width   = (screen.width as number) - 40
//     console.log(contrib)
//     // FIXME: emit typing
//     bigImage.emit('attach')
//     tree.emit('attach')
//     logBox.emit('attach')
//   })
