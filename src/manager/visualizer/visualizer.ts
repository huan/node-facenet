import * as fs    from 'fs'
import * as path  from 'path'

import {
  // Widgets,
}                 from 'blessed'
const contrib     = require('blessed-contrib')

import {
  Face,
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

export class Visualizer {

  constructor(
    public frame: Frame,
    public alignmentCache: AlignmentCache,
    public embeddingCache: EmbeddingCache,
  ) {
  }

  public async start(): Promise<void> {
    const box = this.frame.box
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
    tree.focus()

    // Handling select event. Every custom property that was added to node is
    // available like the 'node.getPath' defined above
    tree.on('select', async (node: any) => {
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
        this.frame.emit('image', nodePath)
        const faceList = await this.alignmentCache.align(nodePath)
        faceList.forEach(face => {
          this.embeddingCache.embedding(face)
          this.frame.emit('face', face)
        })
      } catch (e) {
        // table.setData({headers: ['Info'], data: [[e.toString()]]})
      }

      this.frame.screen.render()
    })
  }
}
