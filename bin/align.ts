#!/usr/bin/env node

import { ArgumentParser } from 'argparse'
import * as gm from 'gm'

import {
  Facenet,
  Image,
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
  // console.dir(args)
  const f = new Facenet()
  await f.init()

  try {
    const imageFile = args.input

    const image = new Image(imageFile)
    const faceList = await f.align(image)
    // console.log(faceList)

    const newImage = gm(imageFile)
    for (const face of faceList) {
      const mark = face.facialLandmark
      const color = randomColor()
      const box = face.boundingBox
      const base = Math.floor((box.x2 - box.x1 + box.y2 - box.y1) / 100) + 1
      newImage.fill('none')
              .stroke(color, base * 1)
              .drawRectangle(
                box.x1,
                box.y1,
                box.x2,
                box.y2,
                base * 3,
              )

      Object.keys(mark).forEach(k => {
        const v = mark[k]
        newImage.fill(color)
                .stroke('none', 0)
                .drawCircle(
                  v[0], v[1],
                  v[0] + base, v[1] + base,
                )
      })
    }

    newImage.noProfile().write(args.output, err => {
      if (err) {
        throw err
      }
      console.log('ok!')
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
