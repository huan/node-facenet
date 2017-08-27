import * as fs    from 'fs'
import * as path  from 'path'

const contrib     = require('blessed-contrib')
const charm       = require('charm')

import * as updateNotifier  from 'update-notifier'
import * as blessed         from 'blessed'
import * as glob            from 'glob'

import {
  MODULE_ROOT,
}               from '../src/config'

const screen = blessed.screen()

// create layout and widgets
const grid = new contrib.grid({
  rows: 24,
  cols: 4,
  screen,
})

const tree =  grid.set(
  0, 0, 20, 1,
  contrib.tree,
  {
    style:    { text: 'red' },
    template: { lines: true },
    label:    'Filesystem Tree',
  },
)

const image =  grid.set(
  0, 1, 20, 3,
  contrib.picture,
  {
    // cols: 0,
    file: '/home/zixia/git/blessed-contrib/examples/media/flower.png',
    // type: 'ansi',
  },
)

  // contrib.table,
  // {
  //   keys: true,
  //   fg: 'green',
  //   label: 'Informations',
  //   columnWidth: [24, 10, 10],
  // },

const message = grid.set(
  20, 0, 4, 4,
  contrib.log,
  {
    fg:     'green',
    label:  'Server Log',
    height: '20%',
    tags:   true,
    border: {
      type: 'line',
      fg:   'cyan',
    },
  },
)

// file explorer
const explorer = {
  name: '/',
  extended: true,
  // Custom function used to recursively determine the node path
  getPath: function(self: any) {
    // If we don't have any parent, we are at tree root, so return the base case
    if (!self.parent) {
      return '/home/zixia/git/blessed-contrib/examples/media/';
      // return '/home/zixia/git/node-facenet/datasets/lfw/cache.face/';
    }
    // Get the parent node path and add this node name
    return path.join(
      self.parent.getPath(self.parent),
      self.name,
    )
  },
  // Child generation function
  children: function(self: any) {
    let result: any = {}
    const selfPath = self.getPath(self);
    try {
      // List files in this directory
      const children = fs.readdirSync(selfPath + '/');

      // childrenContent is a property filled with self.children() result
      // on tree generation (tree.setData() call)
      if (!self.childrenContent) {
        for (const child of children) {
          const completePath = selfPath + '/' + child;
          if (fs.lstatSync(completePath).isDirectory()) {
            // If it's a directory we generate the child with the children generation function
            result[child] = {
              name: child,
              getPath: self.getPath,
              extended: false,
              children: self.children,
            };
          } else {
            // Otherwise children is not set (you can also set it to '{}' or 'null' if you want)
            result[child] = {
              name: child,
              getPath: self.getPath,
              extended: false ,
            };
          }
        }
      } else {
        result = self.childrenContent;
      }
    } catch (e) {
      // fail safe
    }
    return result
  },
}

// set tree
tree.setData(explorer)

// Handling select event. Every custom property that was added to node is
// available like the 'node.getPath' defined above
tree.on('select', async function(node: any){
  let nodePath = node.getPath(node);
  let data = [];

  // The filesystem root return an empty string as a base case
  if ( nodePath === '')
    nodePath = '/';

  // Add data to right array
  data.push([nodePath]);
  data.push(['']);
  try {
    // Add results
    data = data.concat(JSON.stringify(fs.lstatSync(nodePath), null, 2)
                .split('\n')
                .map(e => [e]))
    message.log(nodePath)

    await setImage(image, nodePath)

  } catch (e) {
    // table.setData({headers: ['Info'], data: [[e.toString()]]})
  }

  screen.render();
});

let pause = false

screen.key(['space'], () => {
  pause = !pause
  message.log('pause: ' + pause)
})
// screen.on('keypress', (ch, key) => {
//   if (ch === ' ') {
//     pause = !!pause
//   }
// })

screen.key(['escape', 'q', 'C-c'], function(/* ch: any, key: any */) {
  return process.exit(0);
});

screen.key(['tab'], function(ch: any, key: any) {
  message.log('' + ch)
  message.log('' + JSON.stringify(key))

  if (screen.focused === tree.rows)
    // table.focus();
    image.focus()
  else
    tree.focus();
});

tree.focus()
screen.render()

let faceFileList: string[] = []
let i = 0

process.on('warning', (warning) => {
  console.warn(warning.name);    // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack);   // Print the stack trace
});

async function refreshImage() {
  if (!pause) {
    if (i >= faceFileList.length) {
      i = 0
    }
    const file = faceFileList[i++]

    message.log('#' + i + ', total: ' + faceFileList.length + ' : ' + file)

    // EventEmitter memory leak #34
    // https://github.com/substack/node-charm/issues/34
    const c = charm()
    c.removeAllListeners('close')
    c.removeAllListeners('data')
    c.removeAllListeners('end')
    c.removeAllListeners('^C')

    await setImage(image, faceFileList[i])
    image.render()
  }

  // setImmediate(refreshImage)
  setTimeout(refreshImage, 1 * 1000)
}

async function setImage(imageWidget: any, file: string): Promise<void> {
  return new Promise<void>((resolve) => {
    imageWidget.setImage({
      cols: 80,
      file,
      onReady: resolve,
      type: 'ansi',
    })
  })
}

refreshImage()

glob('/home/zixia/git/node-facenet/datasets/lfw/cache.face/*.png', (e, matches) => {
// glob('/home/zixia/git/blessed-contrib/examples/media/*.png', (e, matches) => {
  if (e) {
    console.log(e)
    message.log(e && e.message || e)
  }
  message.log('Dataset ' + matches.length + ' loaded')
  faceFileList = matches
})

async function main(): Promise<number> {

  const pkgFile   = path.join(MODULE_ROOT, 'package.json')
  const pkg       = require(pkgFile)
  const notifier  = updateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 7, // 1 week
  })
  notifier.notify()

  return 1
}

main()
.then(process.exit)
.catch(e => {
  console.error(e)
  process.exit(1)
})
