import * as fs    from 'fs'
import * as path  from 'path'

import * as blessed   from 'blessed'
const contrib         = require('blessed-contrib')
import * as glob      from 'glob'

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
tree.on('select', function(node: any){
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
    image.setImage({
      cols: 256,
      file: nodePath,
      // onReady: ready,
      type: 'ansi',
    })

    // screen.render()
    // table.setData({
    //   headers: ['Info'],
    //   data,
    // })
  } catch (e) {
    // table.setData({headers: ['Info'], data: [[e.toString()]]})
  }

  screen.render();
});

// set default table
// table.setData({
//   headers: ['Info'],
//   data: [
//     ['zixia'],
//   ],
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

function refreshImage() {
  if (i >= faceFileList.length) {
    i = 0
  }
  const file = faceFileList[i++]

  message.log('#' + i + ', total: ' + faceFileList.length + ' : ' + file)

  image.setImage({
    cols: 40,
    file: faceFileList[i],
    onReady: () => {
      image.render()
      setTimeout(refreshImage, 1 * 1000)
    },
    type: 'ansi',
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
