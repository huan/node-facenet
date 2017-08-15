#!/usr/bin/env node

import { ArgumentParser } from 'argparse'
const { loadImage }       = require('canvas')

import {
  Facenet,
  imageToData,
  log,
  VERSION,
}                         from '../'

async function main(args: Args) {
  log.info('CLI', `Facenet v${VERSION}`)

  const f = new Facenet()

  log.info('CLI', 'Facenet Initializing...')
  let start = Date.now()
  await f.init()
  log.info('CLI', 'Facenet Initialized after %f seconds', (Date.now() - start) / 1000)

  try {
    const imageFile = args.image_file

    const image = await loadImage(imageFile)
    const imageData = imageToData(image)

    start = Date.now()
    const faceList = await f.align(imageData)
    log.info('CLI', 'Facenet Align(%fs): found %d faces',
                        (Date.now() - start) / 1000,
                        faceList.length,
            )

    for (const face of faceList) {
      start = Date.now()
      const embedding = await f.embedding(face)
      log.info('CLI', 'Facenet Embeding(%fs)',
                          (Date.now() - start) / 1000,
              )
      console.log(JSON.stringify(embedding.tolist()))
    }
  } catch (e) {
    log.error('CLI', e)
  } finally {
    f.quit()
  }
}

interface Args {
  image_file: string,
}

function parseArguments(): Args {
  const parser = new ArgumentParser({
    version:      VERSION,
    addHelp:      true,
    description:  'Face Embedding CLI Tool',
  })

  parser.addArgument(
    [ 'image_file' ],
    {
      help: 'image file to align',
    },
  )

  // parser.addArgument(
  //   [ '-f', '--foo' ],
  //   {
  //     help: 'foo bar'
  //   }
  // )

  return parser.parseArgs()
}

main(parseArguments())
