/**
 * ANSI Colors: https://i.stack.imgur.com/sbSCk.png
 */
// import * as path    from 'path'

import {
  widget,
  // Widgets,
}                   from 'blessed'
// import * as contrib from 'blessed-contrib'

// import {
//   MODULE_ROOT,
//   VERSION,
// }                   from '../../config'

export function clear(theScreen: widget.Screen): void {
  let i = theScreen.children.length
  while (i--) {
    theScreen.children[i].detach()
  }
}
