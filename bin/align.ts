#!/usr/bin/env node

import { ArgumentParser }  from 'argparse'
import {
  Facenet,
  VERSION,
}    from '../'

async function main(args: Object) {
  console.dir(args)
  const f = new Facenet()
  await f.init()
  //
}

function parseArguments() {
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
  // );
  // parser.addArgument(
  //   [ '-b', '--bar' ],
  //   {
  //     help: 'bar foo'
  //   }
  // );
  // parser.addArgument(
  //   '--baz',
  //   {
  //     help: 'baz bar'
  //   }
  // );
  return parser.parseArgs()
}

main(parseArguments())
