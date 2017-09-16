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

    const tree     = this.createTreeElement(box)
    const explorer = this.createExplorerData(workDir)

    tree.setData(explorer)
    this.bindSelectAction(tree)

    tree.focus()

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
    tree.on('click', () => tree.focus())
    return tree
  }

  private createExplorerData(workDir?: string) {
    log.verbose('AlignmentEmbedding', 'createExplorerData(%s)', workDir ? workDir : '')

    if (!workDir) {
      workDir = path.join(
        MODULE_ROOT,
        'docs',
        'images',
      )
    }

    // file explorer
    const explorer = {
      name     : '/',
      extended : true,
      // Custom function used to recursively determine the node path

      getPath: (node: any) => {
        log.silly('AlignmentEmbedding', 'createExplorerData() getPath(%s)', node.name)
        // If we don't have any parent, we are at tree root, so return the base case
        if (!node.parent)
          return '/'
          // return workDir

        // Get the parent node path and add this node name
        return path.join(
          node.parent.getPath(node.parent),
          node.name,
        )
      },

      // Child generation function
      children: (node: any) => {
        log.silly('AlignmentEmbedding', 'createExplorerData() children(%s)', node.name)

        // childrenContent is a property filled with self.children() result
        if (node.childrenContent) {
          // log.verbose('childrenContent HIT')
          return node.childrenContent
        }
        // log.verbose('childrenContent MISS')

        const result = {} as any
        const selfPath = node.getPath(node)
        try {
          // List files in this directory
          const children = fs.readdirSync(selfPath + path.sep)
          for (const child of children) {
            const completePath = path.join(selfPath, child)
            log.silly('AlignmentEmbedding', 'createExplorerData() children() for(child:%s)', completePath)

            result[child] = {
              name     : child,
              getPath  : node.getPath,
              extended : false,
            }

            if (fs.lstatSync(completePath).isDirectory()) {
              // If it's a directory we generate the child with the children generation function
              result[child]['children'] = node.children
            }
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

      if (node.children) {
        return  // directorhy, not a image file
      }

      try {
        await this.process(nodePath)
        this.frame.screen.render()
      } catch (e) {
        log.error('AlignmentEmbedding', 'bindSelectAction() tree on select exception: %s', e)
      }
    })
  }

  public async process(file: string): Promise<void> {
    log.verbose('AlignmentEmbedding', 'process(%s)', file)

    this.frame.emit('image', file)

    const faceList = await this.alignmentCache.align(file)
    log.silly('AlignmentEmbedding', 'process() faceList.length:%d', faceList.length)

    for (const face of faceList) {
      try {
        face.embedding = await this.embeddingCache.embedding(face)
        this.frame.emit('face', face)
        log.silly('AlignmentEmbedding', 'process() face:%s embedding:%s',
                                        face, face.embedding)
      } catch (e) {
        log.error('AlignmentEmbedding', 'process() exception:%s', e)
      }
    }
  }
}
