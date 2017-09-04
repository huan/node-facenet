import {
  widget,
  // Widgets,
}                   from 'blessed'

export function clear(theScreen: widget.Screen): void {
  let i = theScreen.children.length
  while (i--) {
    theScreen.children[i].detach()
  }
}
