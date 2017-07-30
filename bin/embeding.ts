#!/usr/bin/env node

import { ArgumentParser } from 'argparse'
import { log }            from 'brolog'

import {
  Facenet,
  Image,
  VERSION,
}                         from '../'

async function main(args: Args) {
  log.info('Facenet', `v${VERSION}`)

  const f = new Facenet()

  log.info('Facenet', 'Initializing...')
  const start = Date.now()
  await f.init()
  log.info('Facenet', 'Initialized after %f seconds', Math.floor((Date.now() - start) / 1000))

  try {
    const imageFile = args.image_file

    const image = new Image(imageFile)
    const faceList = await f.align(image)

    for (const face of faceList) {
      const embedding = await f.embedding(face)
      log.info('Embedding', '%s', embedding)
    }
  } catch (e) {
    console.error(e)
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
