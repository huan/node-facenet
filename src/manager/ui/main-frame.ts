
import { EventEmitter }   from 'events'

import {
  widget,
  Widgets,
}                         from 'blessed'
const contrib             = require('blessed-contrib')

import {
  FILE_FACENET_ICON_PNG,
  VERSION,
}                         from '../../config'

import {
  Face,
}                         from '../../face'

export type MainFrameEventName = 'face'
                                | 'image'
                                | 'log'
                                | 'status'
                                | 'title'

export class MainFrame extends EventEmitter {
  private elementList = [] as Widgets.Node[]

  constructor(
    public screen: Widgets.Screen,
  ) {
    super()
  }

  public init() {
    const thumbWidth  = 40
    const imageWidth  = 4 * (thumbWidth / 2)
    const imageHeight = (3 * (imageWidth / 4)) / 2  // height in console is twice times of width

    this.addHeaderElement()
    this.addThumbElementList(thumbWidth)
    this.addImageElement(thumbWidth, imageWidth, imageHeight)
    this.addGridElement(1 + imageHeight, thumbWidth, imageWidth)
    this.addStatusElement()
  }

  public emit(event: 'image',   filename: string): boolean
  public emit(event: 'log',     message:  string): boolean
  public emit(event: 'title',   title:    string): boolean
  public emit(event: 'status',  message:  string): boolean
  public emit(event: 'face',    face:     Face):   boolean

  public emit(event: MainFrameEventName, data: any) {
    return super.emit(event, data)
  }

  public clean() {
    let i = this.screen.children.length
    while (i--) {
      const child = this.screen.children[i]
      if (!this.elementList.includes(child)) {
        child.detach()
      }
    }
  }

  private append(element: Widgets.Node) {
    this.elementList.push(element)
    this.screen.append(element)
  }

  private addHeaderElement(): void {
    const box = new widget.Box({
      top:     0,
      left:    0,
      width:   '100%',
      height:  1,
      tags:    true,
      content: `{center} FaceNet Manager v${VERSION} {/center}`,
      style:   {
        bg: 'blue',
      },
    })
    this.append(box)
    this.on('title', title => box.setContent(title))
  }

  private addThumbElementList(width: number): void {
    let top       = 1
    const height  = Math.floor(width / 2)

    const faceList     = [] as Face[]
    const thumbList    = [] as Widgets.ANSIImageElement[]
    const distanceList = [] as Widgets.BoxElement[]

    do {
      const thumbElement = new (widget as any).Image({
        width,
        height,
        top    : top,
        file   : FILE_FACENET_ICON_PNG,
        type   : 'ansi',
        right  : 0,
        border : 'line',
        style  : {
          border: {
            fg: 'cyan',
          },
        },
      }) as Widgets.ANSIImageElement

      const distanceElement = new widget.Box({
        width,
        top     : top + height,
        right   : 0,
        height  : 1,
        bg      : 'grey',
        fg      : 'white',
        tags    : true,
        content : '{center}distance: 0.75{/center}',
        // border:  'line',
      })

      thumbList.push(thumbElement)
      distanceList.push(distanceElement)

      this.append(thumbElement)
      this.append(distanceElement)

      top += height + 1 // face(height) + distance(1)

    } while (top < this.screen.height)

    this.on('face', (face: Face) => {
      this.emit('log', 'new face. thumbList length: ' + thumbList.length + ', faceList.length: ' + faceList.length)

      let i = thumbList.length
      while (i--) {
        if (i === 0) {
          faceList[0] = face
          thumbList[0].setImage(face.toBuffer() as any, () => {
            // XXX no this callback??
            this.emit('log', 'image loaded')
          })
        } else if (faceList[i - 1]) {
          faceList[i] = faceList[i - 1]
          // thumbList[i].setContent(thumbList[i - 1].content)
          thumbList[i].setImage(faceList[i].toBuffer() as any, () => {
            // XXX no this callback??
            this.emit('log', 'image > 0 loaded')
          })

        }
      }
      i = distanceList.length
      while (i--) {
        if (faceList[i + 1] && faceList[i]) {
          let distance
          try {
            distance = faceList[i + 1].distance(faceList[i])
          } catch (e) { // no embedding
            distance = -1
          }
          distanceList[i].setContent(`{center} | distance: ${distance} | {/center}`)
        }
      }
    })
  }

  private addImageElement(
    paddingRight: number,
    width:        number,
    height:       number,
  ): void {
    const image = new (widget as any).Image({
      right: paddingRight,
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
    this.on('image', filename => image.setImage(filename))
    this.append(image)
  }

  private addGridElement(
    paddingTop:   number,
    paddingRight: number,
    width:        number,
  ): void {
    const box = new widget.Box({
      top:    paddingTop,
      right:  paddingRight,
      width,
      height: (this.screen.height as number) - paddingTop,

      // bottom: 0,

      style: {
        bg: 'blue',
      },
    })

    this.append(box)

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

  private addStatusElement(): void {
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
    this.append(status)
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
