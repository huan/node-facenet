#!/usr/bin/env node
import { log }            from 'brolog'
log.level('silly')

import { ArgumentParser } from 'argparse'
import * as gm from 'gm'

import {
  Facenet,
  FaceImage,
  VERSION,
}                         from '../'

function randomColor(): string {
  const hexStr = ['r', 'g', 'b'].map(_ => {
    return Math.floor(Math.random() * 256)
              .toString(16)
              .toUpperCase()
  }).reduce((prev, curr) => {
    if (curr.length > 1) {
      return prev + curr
    } else {
      return prev + '0' + curr
    }
  }, '')
  return `#${hexStr}`
}

async function main(args: Args) {
  log.info('CLI', `Facenet v${VERSION}`)
  // console.dir(args)
  const f = new Facenet()
  log.info('CLI', 'MTCNN Initializing...')
  let start = Date.now()
  await f.initMtcnn()
  log.info('CLI', 'Facenet Initialized after %f seconds', (Date.now() - start) / 1000)

  try {
    const imageFile = args.input

    log.info('CLI', 'Opening image', args.input)
    const image = new FaceImage(imageFile)

    log.info('CLI', 'MTCNN Aligning...')
    start = Date.now()
    const faceList = await f.align(image)
    log.info('CLI', 'Aligned after %f seconds', (Date.now() - start) / 1000)
    log.info('CLI', 'Found %d faces', faceList.length)
    // console.log(faceList)

    const newImage = gm(imageFile)
    for (const face of faceList) {
      const mark = face.facialLandmark
      const color = randomColor()
      const {p1, p2} = face.boundingBox
      const base = Math.floor((p2.x - p1.x + p2.y - p1.y) / 50) + 1
      newImage.fill('none')
              .stroke(color, base * 1)
              .drawRectangle(
                p1.x,
                p1.y,
                p2.x,
                p2.y,
                base * 5,
              )

      Object.keys(mark).forEach(k => {
        const p = mark[k]
        newImage.fill(color)
                .stroke('none', 0)
                .drawCircle(
                  p.x, p.y,
                  p.x + base, p.y + base,
                )
      })
    }

    newImage.noProfile().write(args.output, err => {
      if (err) {
        throw err
      }
      log.info('CLI', 'Saved aligned image to', args.output)
      log.info('CLI', 'Have a nice day!')
    })
  } catch (e) {
    console.error(e)
  } finally {
    f.quit()
  }
}

interface Args {
  input:  string,
  output: string,
}

function parseArguments(): Args {
  const parser = new ArgumentParser({
    version:      VERSION,
    addHelp:      true,
    description:  'Face Alignment CLI Tool',
  })

  parser.addArgument(
    [ 'input' ],
    {
      help: 'input image file to align',
    },
  )
  parser.addArgument(
    [ 'output' ],
    {
      help: 'output aligned image file',
    },
  )

  return parser.parseArgs()
}

main(parseArguments())
