/**
 * ANSI Colors: https://i.stack.imgur.com/sbSCk.png
 */
import * as path    from 'path'

import {
  widget,
  Widgets,
}                   from 'blessed'
import * as contrib from 'blessed-contrib'

import {
  MODULE_ROOT,
  VERSION,
}                   from '../../config'

const FILE_FACENET_ICON_PNG = path.join(MODULE_ROOT, 'docs', 'images', 'facenet-icon.png')

let _screen: widget.Screen

export async function clear(theScreen: widget.Screen) {
  let i = theScreen.children.length
  while (i--) {
    theScreen.children[i].detach()
  }
}

export function screen(): widget.Screen {
  if (!_screen) {
    _screen = new widget.Screen({
      smartCSR: true,
      warnings: true,
    })
  }
  return _screen
}
