import * as fs    from 'fs'
import * as path  from 'path'

import {
  Widgets,
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
  MODULE_ROOT,
}                 from '../../config'

import {
  Frame,
}                 from '../ui/'

export class Demo {

  constructor(
    public frame:           Frame,
    public alignmentCache:  AlignmentCache,
    public embeddingCache:  EmbeddingCache,
  ) {
  }

  public async start(): Promise<void> {
    const box = this.frame.box

    const tree = this.createTreeElement(box)
    const explorer = this.createExplorerData()
    tree.setData(explorer)
    tree.focus()
    this.bindSelectAction(tree)
  }

  private createTreeElement(box: Widgets.BoxElement) {
    const grid = new contrib.grid({
      screen: box,
      rows:   12,
      cols:   12,
    })

    const tree =  grid.set(
      0, 0, 12, 12,
      contrib.tree,
      {
        style:    { text: 'red' },
        template: { lines: true },
        label:    'Filesystem Tree',
      },
    )

    return tree
  }

  private createExplorerData() {
    const rootDir = path.join(
      MODULE_ROOT,
      'docs',
      'images',
    )

    // file explorer
    const explorer = {
      name: '/',
      extended: true,
      // Custom function used to recursively determine the node path
      getPath: function(self: any) {
        // If we don't have any parent, we are at tree root, so return the base case
        if (!self.parent) {
          return rootDir;
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
        // childrenContent is a property filled with self.children() result
        // on tree generation (tree.setData() call)
        if (self.childrenContent) {
          return self.childrenContent;
        }

        const selfPath = self.getPath(self)
        const result = {} as any
        try {
          // List files in this directory
          const fileList = fs.readdirSync(selfPath + '/')

          for (const file of fileList) {
            const completePath = path.join(selfPath, file)
            result[file] = {
              name:     file,
              getPath:  self.getPath,
              extended: false,
            }
            if (fs.lstatSync(completePath).isDirectory()) {
              // If it's a directory we generate the child with the children generation function
              result[file] = self.children
            }
          }

        } catch (e) {
          // fail safe
        }
        return result
      },
    }

    return explorer
  }

  private bindSelectAction(tree: any) {
    // Handling select event. Every custom property that was added to node is
    // available like the 'node.getPath' defined above
    tree.on('select', async (node: any) => {
      let nodePath = node.getPath(node)
      // let data = []

      // The filesystem root return an empty string as a base case
      if ( nodePath === '')
        nodePath = '/'

      // Add data to right array
      // data.push([nodePath])
      // data.push([''])
      try {
        // Add results
        // data = data.concat(JSON.stringify(fs.lstatSync(nodePath), null, 2)
        //             .split('\n')
        //             .map(e => [e]))
        this.frame.emit('image', nodePath)
        const faceList = await this.alignmentCache.align(nodePath)
        faceList.forEach(face => {
          this.embeddingCache.embedding(face)
          this.frame.emit('face', face)
        })
      } catch (e) {
        this.frame.emit('log', 'tree on select exception: ' + e)
        // table.setData({headers: ['Info'], data: [[e.toString()]]})
      }

      this.frame.screen.render()
    })
  }
}
