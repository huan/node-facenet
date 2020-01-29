import fs    from 'fs'
import path  from 'path'

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
  FaceCache,
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
    public frame          : Frame,
    public faceCache      : FaceCache,
    public alignmentCache : AlignmentCache,
    public embeddingCache : EmbeddingCache,
  ) {
  }

  public async start(workdir?: string): Promise<void> {
    const box = this.frame.box

    const tree     = this.createTreeElement(box)
    const explorer = this.createExplorerData(workdir)

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
        label:    ' Filesystem Tree ',
      },
    )
    tree.on('click', () => tree.focus())
    return tree
  }

  private createExplorerData(workdir?: string) {
    log.verbose('AlignmentEmbedding', 'createExplorerData(%s)', workdir ? workdir : '')

    if (!workdir) {
      workdir = path.join(
        MODULE_ROOT,
        'docs',
        'images',
      )
    }

    const imageRegex = /\.(jpg|jpeg|tiff|png)$/i

    // file explorer
    const explorer = {
      name     : '/',
      extended : true,
      // Custom function used to recursively determine the node path

      getPath: (self: any) => {
        log.silly('AlignmentEmbedding', 'createExplorerData() getPath(%s)', self.name)
        // If we don't have any parent, we are at tree root, so return the base case
        if (!self.parent)
          return '/'
          // return workdir

        // Get the parent node path and add this node name
        return path.join(
          self.parent.getPath(self.parent),
          self.name,
        )
      },

      // Child generation function
      children: (self: any) => {
        // console.info('children: node: ' + self.name)
        log.silly('AlignmentEmbedding', 'createExplorerData() children(%s)', self.name)

        // childrenContent is a property filled with self.children() result
        if (self.childrenContent) {
          // log.verbose('childrenContent HIT')
          return self.childrenContent
        }
        // log.verbose('childrenContent MISS')

        const result = {} as any
        const selfPath = self.getPath(self)
        try {
          // List files in this directory
          const children = fs.readdirSync(selfPath + path.sep)
          for (const child of children) {
            const completePath = path.join(selfPath, child)
            // console.error('XXX:', completePath)
            log.silly('AlignmentEmbedding', 'createExplorerData() children() for(child:%s)', completePath)

            const resultChild = {
              name     : child,
              getPath  : self.getPath,
              extended : false,
            } as any

            if (fs.lstatSync(completePath).isDirectory()) {
              // If it's a directory we generate the child with the children generation function
              resultChild['children'] = self.children
              result[child] = resultChild
            } else if (imageRegex.test(child)) {
              result[child] = resultChild
            } else {
              // skip non-image files
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
        if (!face.embedding) {
          face.embedding = await this.embeddingCache.embedding(face)
          await this.faceCache.put(face)
        }
        this.frame.emit('face', face)
        log.silly('AlignmentEmbedding', 'process() face:%s embedding:%s',
                                        face, face.embedding)
      } catch (e) {
        log.error('AlignmentEmbedding', 'process() exception:%s', e)
      }
    }
  }
}
