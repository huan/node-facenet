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
  log,
  MODULE_ROOT,
}                 from '../../config'

import {
  Frame,
}                 from '../ui/'

export class AlignmentEmbedding {

  constructor(
    public frame:           Frame,
    public alignmentCache:  AlignmentCache,
    public embeddingCache:  EmbeddingCache,
  ) {
  }

  public async start(workDir?: string): Promise<void> {
    const box = this.frame.box

    const tree = this.createTreeElement(box)
    const explorer = this.createExplorerData(workDir)
    tree.setData(explorer)
    tree.focus()
    this.bindSelectAction(tree)

    return new Promise<void>(resolve => this.frame.bindQuitKey(resolve))
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

  private createExplorerData(workDir?: string) {
    log.verbose('AlignmentEmbedding', 'createExplorerData(%s)', workDir)
    console.error(workDir)
    if (!workDir) {
      workDir = path.join(
        MODULE_ROOT,
        'docs',
        'images',
      )
    }

    // file explorer
    const explorer = {
      name: '/',
      extended: true,
      // Custom function used to recursively determine the node path
      getPath: (current: any) => {
        // If we don't have any parent, we are at tree root, so return the base case
        if (!current.parent)
          // return ''
          return workDir
        // Get the parent node path and add this node name
        return path.join(
          current.parent.getPath(current.parent),
          current.name,
        )
      },
      // Child generation function
      children: (current: any) => {
        let result = {} as any
        const selfPath = current.getPath(current)
        try {
          // List files in this directory
          const children = fs.readdirSync(selfPath + path.sep)

          // childrenContent is a property filled with self.children() result
          // on tree generation (tree.setData() call)
          if (!current.childrenContent) {
            for (const child of children) {
              const completePath = path.join(selfPath, child)

              result[child] = {
                name     : child,
                getPath  : current.getPath,
                extended : false,
              }

              if (fs.lstatSync(completePath).isDirectory()) {
                // If it's a directory we generate the child with the children generation function
                result[child]['children'] = current.children
              }
            }
          } else {
            result = current.childrenContent;
          }
        } catch (e) {
          log.error('AlignmentEmbedding', 'createExplorerData() exception: %s', e)
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

      // The filesystem root return an empty string as a base case
      if ( nodePath === '')
        nodePath = '/'

      try {
        await this.process(nodePath)
        this.frame.screen.render()
      } catch (e) {
        this.frame.emit('log', 'tree on select exception: ' + e)
      }
    })
  }

  public async process(file: string): Promise<void> {
    this.frame.emit('image', file)
    const faceList = await this.alignmentCache.align(file)
    this.frame.emit('log', 'faceList.length = ' + faceList.length)

    for (const face of faceList) {
      try {
        this.frame.emit('log', 'face ' + face.md5)
        this.frame.emit('face', face)
        face.embedding = await this.embeddingCache.embedding(face)
        this.frame.emit('log', face.embedding.toString())
      } catch (e) {
        this.frame.emit('log', 'on select exception: ' + e)
      }
    }
  }
}
