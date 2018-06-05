declare module 'blessed-contrib' {
// declare namespace BlessedContrib {
  import {
    widget,
    Widgets,
  }                           from 'blessed'

  export interface Grid {
    (...args: any[]): any
    new(...args: any[]): any
  }
  var grid: Grid

  export interface Carousel {
    (...args: any[]): any
    new(...args: any[]): any
  }
  var carousel: Carousel

  export interface Map {
    (...args: any[]): any
    new(...args: any[]): any
  }
  var map: Map

  export interface Canvas {
    (...args: any[]): any
    new(...args: any[]): any
  }
  var canvas: Canvas

  export interface Gauge {
    (...args: any[]): any
    new(...args: any[]): any
  }
  var gauge: Gauge

  export interface GaugeList {
    (...args: any[]): any
    new(...args: any[]): any
  }
  var gaugeList: GaugeList

  var lcd: any
  var donut: any
  var log: any
  var picture: any
  var sparkline: any
  var table: any

  export interface Tree extends Widgets.BoxElement {
      (): any
      new(): any
  }
  var tree: Tree

  var markdown: any

  var bar: any
  var stackedBar: any
  var line: any

  var OutputBuffer: any
  var InputBuffer: any
  var createScreen: any
  var serverError: any

}

// export = BlessedContrib
