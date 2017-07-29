#!/usr/bin/env node

import { ArgumentParser } from 'argparse'
import {
  Facenet,
  Image,
  VERSION,
}                         from '../'

async function main(args: Args) {
  console.dir(args)
  const f = new Facenet()
  await f.init()

  try {
    const imageFile = args.image_file

    const image = new Image(imageFile)
    const faceList = await f.align(image)
    console.log(faceList)

    // for (const face of faceList) {
      // console.log(face.boundingBox)
      // console.log(face.facialLandmark)
      // console.log('' + face)
    // }
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
    description:  'Face Alignment CLI Tool',
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
