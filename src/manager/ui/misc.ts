import blessed from 'blessed'

export function clear(theScreen: blessed.Widgets.Screen): void {
  let i = theScreen.children.length
  while (i--) {
    theScreen.children[i].detach()
  }
}
