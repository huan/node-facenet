// import * as path from 'path'
import { EventEmitter }   from 'events'

import {
  widget,
  Widgets,
}                         from 'blessed'
const contrib             = require('blessed-contrib')

import {
  FILE_FACENET_ICON_PNG,
  // MODULE_ROOT,
  log,
  VERSION,
}                         from '../../config'

import {
  Face,
}                         from '../../face'

import {
  imageToData,
  loadImage,
  toBuffer,
}                         from '../../misc'

export type FrameEventName = 'face'
                            | 'image'
                            | 'log'
                            | 'status'
                            | 'title'

export class Frame extends EventEmitter {
  private elementList = [] as Widgets.Node[]

  private _box: Widgets.BoxElement // for external usage, mainly to draw a contrib.grid

  private thumbWidth  = 44  // 2 for border line, 2 for float "/" workaround
  private imageWidth  = 2 * this.thumbWidth
  // (* 4 / 3) image width/height = 4/3
  // (/2) // characters' height is about twice times of width in console
  private imageHeight = this.imageWidth * 3 / 4 / 2

  constructor(
    public screen: Widgets.Screen,
  ) {
    super()
  }

  public init() {
    this.addHeaderElement()
    this.addThumbElementList()
    this.addImageElement()
    this.addMeterElement()
    this.addStatusElement()

    // provide box area for external usage
    this.addBoxElement()
  }

  public emit(event: 'image',   filename: string): boolean
  public emit(event: 'log',     message:  string): boolean
  public emit(event: 'title',   title:    string): boolean
  public emit(event: 'status',  message:  string): boolean
  public emit(event: 'face',    face:     Face):   boolean

  public emit(event: never,     data: any): boolean
  public emit(event: FrameEventName, data: any) {
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

  get box() {
    if (this._box) {
      this._box.detach()
    }
    this.addBoxElement()
    return this._box
  }

  public bindQuitKey(callback: Function) {
    const quitKeyList = ['escape', 'q', 'x', 'C-q', 'C-x', 'f4', 'f10']
    const quitRegexp = new RegExp('^[' + quitKeyList.join('|') + ']$', 'i')

    const listener = (_: any, key: any) => {
      if (quitRegexp.test(key.name)) {
        this.screen.removeListener('keypress', listener)
        callback()
      }
    }
    this.screen.addListener('keypress', listener)
  }

  private addBoxElement(): void {
    const right  = this.thumbWidth + this.imageWidth
    const width  = (this.screen.width as number) - right
    const height = (this.screen.height as number) - 1

    const box = new widget.Box({
      right,
      width,
      height,

      top:    1,
      // border: 'line',
    })
    this.append(box)

    this._box = box
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

  private addThumbElementList(): void {
    const width = this.thumbWidth

    const cols   = width - 2 - 2          // 2 is padding for border, 2 is for in picture-tube `dx = png.width / opts.cols`
    let   top    = 1
    const height = Math.floor(width / 2)  // characters' height is about twice of width in console

    const faceList     = [] as Face[]
    const thumbList    = [] as Widgets.ANSIImageElement[]
    const distanceList = [] as Widgets.BoxElement[]

    do {
      const thumbElement = contrib.picture({
        cols,
        width,
        height,
        top,

        keys   : true,
        vi     : true,
        mouse  : true,

        right  : 0,
        file   : FILE_FACENET_ICON_PNG,
        border : 'line',
        style  : {
          border: {
            fg: 'cyan',
          },
        },
        onReady: () => this.screen.render(),
      })

      const distanceElement = new widget.Box({
        width,
        top:     top + height,
        right:   0,
        height:  1,
        bg:      'grey',
        fg:      'white',
        tags:    true,
        // content: '{center}distance: 0.75{/center}',
      })

      thumbList.push(thumbElement)
      distanceList.push(distanceElement)

      thumbElement.on('click', () => {
        const idx = thumbList.indexOf(thumbElement)
        if (idx > 0                           // skip the first thumb
            && faceList[idx]                  // face exist in thumb
            && faceList[idx] !== faceList[0]  // face is not exist in the first thumb
        ) {
          this.emit('face', faceList[idx])
        }
      })

      this.append(thumbElement)
      this.append(distanceElement)

      top += height + 1 // thumb(height) + distance(1)

    } while (top < this.screen.height)
    this.screen.render()
    this.on('face', (face: Face) => this.addFace(face, faceList, thumbList, distanceList))
  }

  private addFace(
    face:         Face,
    faceList:     Face[],
    thumbList:    any[],  // contrib.picture
    distanceList: widget.Box[],
  ) {
    log.verbose('Frame', 'addFace(%s, %d, %d, %d)',
                          face, faceList.length, thumbList.length, distanceList.length)

    let i = thumbList.length

    while (i--) {
      if (i === 0) {
        faceList[0] = face
        this.showPicture(thumbList[i], face)
            .then(() => log.silly('Frame', 'addFace(%s) done', face))
      } else {
        const prevFace = faceList[i - 1]
        if (prevFace) {
          faceList[i] = prevFace
          this.showPicture(thumbList[i], prevFace)
        }
      }
    }
    i = distanceList.length
    while (i--) {
      if (faceList[i + 1] && faceList[i]) {
        let distance
        try {
          distance = faceList[i + 1].distance(faceList[i])
                                    .toFixed(2)
        } catch (e) { // no embedding
          distance = -1
        }
        distanceList[i].setContent(`{center} | distance: ${distance} | {/center}`)
        distanceList[i].bg = distance > 0.75 ? 'red' : 'green' as any
      }
    }
  }

  private addImageElement(): void {
    const paddingRight = this.thumbWidth
    const width        = this.imageWidth
    const height       = this.imageHeight

    const cols = height * 2

    const pic = contrib.picture({
      right: paddingRight,
      width,
      cols,
      height,

      keys    : true,
      vi      : true,
      mouse   : true,
      top     : 1,
      border  : 'line',
      file    : FILE_FACENET_ICON_PNG,
      onReady : () => this.screen.render(),
      style   : {
        border: {
          fg: 'cyan',
        },
      },
    })
    // console.log(MODULE_ROOT)
    this.append(pic)
    this.on('image', async (file: string) => {
      try {
        const image = await loadImage(file)
        const data = imageToData(image)
        const buffer = toBuffer(data)
        await this.showPicture(pic, buffer.toString('base64'))
        log.verbose('Frame', 'addImageElement() on(image) %s', file)
      } catch (e) {
        log.error('Frame', 'addImageElement() on(image) not support file format: %s', file)
      }
    })
  }

  private async showPicture(
    picture:         any,
    base64OrFace?: string | Face,
  ): Promise<void> {
    let base64: string | undefined

    if (base64OrFace instanceof Face) {
      base64 = base64OrFace.toBuffer()
                            .toString('base64')
    } else {
      base64 = base64OrFace
    }

    // 2 is padding for border, 2 is for picture-tube `dx = png.width / opts.cols`
    const cols = picture.width - 2 - 2

    return new Promise<void>(resolve => {
      picture.setImage({
        cols,
        base64,
        onReady: () => {
          this.screen.render()
          resolve()
        },
      })
    })
  }

  private addMeterElement(): void {
    const top    = 1 + this.imageHeight
    const right  = this.thumbWidth
    const width  = this.imageWidth
    const height = (this.screen.height as number) - top

    const box = new widget.Box({
      top,
      right,
      width,
      height,
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
    const logger = grid.set(0, 0, 6, 6, contrib.log, {
      tags: true,
      keys: true,
      vi: true,
      mouse: true,
      scrollbar: {
        ch: ' ',
        track: {
          bg: 'yellow',
        },
        style: {
          inverse: true,
        },
      },
      fg        : 'green',
      selectedFg: 'green',
      label     : ' Log ',
    })

    this.on('log', text => logger.log(text))
  }

  private addStatusElement(): void {
    const status = new widget.Box({
      bottom:  0,
      right:   0,
      height:  1,
      width:   'shrink',
      content: 'Status messages here.',
      style:   {
        bg: 'blue',
      },
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

export default Frame
