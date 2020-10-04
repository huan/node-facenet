import { EventEmitter }   from 'events'
// import fs            from 'fs'
// import path          from 'path'

import blessed from 'blessed'

import {
// Face,
}                 from '../../face'

/*
import {
  Lfw,
}                 from '../../dataset/lfw'
*/

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
const contrib     = require('blessed-contrib')

type ValidateEventName = 'start' | 'stop' | 'quit'

interface MenuEventMap {
  [text:  string]: ValidateEventName,
}

export class Validate extends EventEmitter {

  private grid: any
  //  private lfw:  Lfw

  constructor (
    public frame:           Frame,
    public alignmentCache:  AlignmentCache,
    public embeddingCache:  EmbeddingCache,
  ) {
    super()
    // this.lfw = new Lfw()
  }

  public async start (): Promise<void> {
    const box = this.frame.box
    // eslint-disable-next-line new-cap
    this.grid = new contrib.grid({
      screen: box,
      rows:   12,
      cols:   12,
    })

    this.createMenuElement(0, 0, 4, 12)
    this.createDonutElement(4, 0, 2, 12)
    this.createProgressElement(6, 0, 2, 12)
    this.createOutputElement(8, 0, 4, 12)

    this.on('start', () => {
      //
    })

    this.on('stop', () => {
      //
    })

    return new Promise<void>(resolve => {
      this.once('quit', resolve)
    })
  }

  private createMenuElement (
    row:     number,
    col:     number,
    rowSpan: number,
    colSpan: number,
  ): void {
    const list = this.grid.set(
      row, col, rowSpan, colSpan,
      blessed.Widgets.ListElement,
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
      Stop:  'stop',
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

  private createDonutElement (
    row:     number,
    col:     number,
    rowSpan: number,
    colSpan: number,
  ): void {
    const donut = this.grid.set(
      row, col, rowSpan, colSpan,
      contrib.donut,
      {
        label: 'Data Sets Status',
        radius: 8,
        arcWidth: 3,
        remainColor: 'black',
        yPadding: 2,
        // data: [
        //   {percent: 80, label: 'web1', color: 'green'}
        // ],
      },
    )

    donut.setData([
      { percent: 87, label: 'rcp', 'color': 'green' },
      { percent: 43, label: 'rcp', 'color': 'cyan' },
    ])
  }

  private createProgressElement (
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
      { percent: 30, stroke: 'green' },
      { percent: 30, stroke: 'magenta' },
      { percent: 40, stroke: 'cyan' },
    ])
  }

  private createOutputElement (
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
