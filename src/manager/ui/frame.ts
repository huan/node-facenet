import * as path          from 'path'
import { EventEmitter }   from 'events'

import {
  widget,
  Widgets,
}                         from 'blessed'
const contrib             = require('blessed-contrib')

import {
  FILE_FACENET_ICON_PNG,
  MODULE_ROOT,
  VERSION,
}                         from '../../config'

import {
  Face,
}                         from '../../face'

export type FrameEventName = 'face'
                            | 'image'
                            | 'log'
                            | 'status'
                            | 'title'

export class Frame extends EventEmitter {
  private elementList = [] as Widgets.Node[]

  private _box: Widgets.BoxElement // for external usage, mainly to draw a contrib.grid

  private thumbWidth  = 40
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

  private addBoxElement(): void {
    const right = this.thumbWidth + this.imageWidth
    const width = (this.screen.width as number) - right
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

    const cols   = width - 2 - 1          // 2 is padding for border, +1 is becasue in picture-tube `dx = png.width / opts.cols`
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

        right:  0,
        file:   FILE_FACENET_ICON_PNG,
        border: 'line',
        style:  {
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
        content: '{center}distance: 0.75{/center}',
      })

      thumbList.push(thumbElement)
      distanceList.push(distanceElement)

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
    this.emit('log', 'new face. thumbList length: ' + thumbList.length + ', faceList.length: ' + faceList.length)

    let i = thumbList.length

    while (i--) {
      if (i === 0) {
        faceList[0] = face
        this.showPicture(thumbList[i], face)
            .then(() => this.emit('log', 'addFace(' + face.md5 + ')'))
      } else {
        const prevFace = faceList[i - 1]
        if (prevFace) {
          faceList[i] = prevFace
          this.showPicture(thumbList[i], prevFace)
              .then(() => this.emit('log', 'addFace(' + prevFace.md5 + ')'))
        }
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
  }

  private addImageElement(): void {
    const paddingRight = this.thumbWidth
    const width        = this.imageWidth
    const height       = this.imageHeight

    console.log('width ' + width)
    const cols = width - 2 - 1  // 2 is padding for border, +1 is becasue in picture-tube `dx = png.width / opts.cols`

    const pic = contrib.picture({
      right: paddingRight,
      width,
      cols,
      height,

      top   : 1,
      border: 'line',
      style : {
        border: {
          fg: 'cyan',
        },
      },
      file: path.join(
        MODULE_ROOT,
        'tests/fixtures/aligned-face.png',
      ),
      onReady: () => this.screen.render(),
    })
    this.append(pic)
    this.on('image', async file => {
      await this.showPicture(pic, file)
      this.emit('log', 'showPicture: ' + file)
    })
  }

  private async showPicture(
    picture: any,
    fileOrFace?:   string | Face,
  ): Promise<void> {
    let file:   string | undefined
    let base64: string | undefined

    if (fileOrFace instanceof Face) {
      file   = undefined
      base64 = fileOrFace.toBuffer().toString('base64')
    } else {
      file   = fileOrFace
      base64 = undefined
    }

    const cols = picture.width - 2 - 1  // 2 for lines and 1 for workaround of float '/'

    return new Promise<void>(resolve => {
      picture.setImage({
        cols,
        file,
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
    const log = grid.set(0, 0, 6, 6, contrib.log, {
      fg        : 'green',
      selectedFg: 'green',
      label     : 'Log',
    })

    this.on('log', text => log.log(text))
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

