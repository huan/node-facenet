import { EventEmitter }   from 'events'
// import * as fs            from 'fs'
// import * as path          from 'path'

import {
  // Widgets,
  widget,
}                 from 'blessed'
const contrib     = require('blessed-contrib')

import {
  // Face,
}                 from '../../face'

import {
  AlignmentCache,
  EmbeddingCache,
}                 from '../../cache/'

import {
  // MODULE_ROOT,
}                 from '../../config'

import {
  Frame,
}                 from '../ui/'

type ValidateEventName = 'start' | 'pause' | 'quit'

interface MenuEventMap {
  [text:  string]: ValidateEventName,
}

export class Validate extends EventEmitter {
  private grid: any

  constructor(
    public frame:           Frame,
    public alignmentCache:  AlignmentCache,
    public embeddingCache:  EmbeddingCache,
  ) {
    super()
  }

  public async start(): Promise<void> {
    const box = this.frame.box
    this.grid = new contrib.grid({
      screen: box,
      rows:   12,
      cols:   12,
    })

    this.createMenuElement(0, 0, 4, 12)
    this.createProgressElement(4, 0, 2, 12)
    this.createOutputElement(6, 0, 6, 12)

    return new Promise<void>(resolve => {
      this.once('quit', resolve)
    })
  }

  private createMenuElement(
    row:     number,
    col:     number,
    rowSpan: number,
    colSpan: number,
  ): void {
    const list = this.grid.set(
      row, col, rowSpan, colSpan,
      widget.List,
      {
        label:  '{bold}{cyan-fg} Menu {/cyan-fg}{/bold}',
        tags:   true,
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
      },
    )

    const menuEventMap: MenuEventMap = {
      Start: 'start',
      Pause: 'pause',
      Quit:  'quit',
    }

    list.setItems(Object.keys(menuEventMap) as any)
    list.focus()
    ; // seprate the following ()
    (list as any).enterSelected(0)

    list.on('select', (text: string, selected: number) => {
      const event = menuEventMap[text]
      this.emit(event)
      this.frame.emit('log', 'menu select: ' + text + ', ' + selected)
    })
  }

  private createProgressElement(
    row:     number,
    col:     number,
    rowSpan: number,
    colSpan: number,
  ): void {
    const gauge = this.grid.set(
      row, col, rowSpan, colSpan,
      contrib.gauge,
      {
        label: 'Stacked ',
      },
    )

    gauge.setStack([
      {percent: 30, stroke: 'green'},
      {percent: 30, stroke: 'magenta'},
      {percent: 40, stroke: 'cyan'},
    ])
  }

  private createOutputElement(
    row:     number,
    col:     number,
    rowSpan: number,
    colSpan: number,
  ): void {
    const output = this.grid.set(
      row, col, rowSpan, colSpan,
      contrib.log,
      {
        fg: 'green',
        selectedFg: 'green',
        label: 'Server Log',
      },
    )
    output.log('new output line')
  }
}
