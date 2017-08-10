#!/usr/bin/env node

import * as path          from 'path'
import { ArgumentParser } from 'argparse'

import {
  Lfw,
  EmbeddingCache,
  Facenet,
  log,
  VERSION,
}                         from '../'

async function main(args: Args): Promise<number> {
  log.level(args.log as any)

  let directory: string
  if (args.directory.startsWith(path.sep)) {
    directory = args.directory
  } else {
    directory = path.join(process.cwd(), args.directory)
  }

  const facenet = new Facenet()
  const lfw = new Lfw(directory)

  const cache = new EmbeddingCache(facenet, directory)
  cache.init()

  const count = await cache.dbCount()

  let ret = 0
  switch (args.command) {
    case 'calc':
      const imageList = await lfw.imageList()
      for (const file of imageList) {
        await cache.embedding(file)
      }
      log.info('EmbeddingCacheManager', 'cache: %s has inited %d entries',
                                        args.directory,
                                        count,
              )
      break
    case 'clean':
      await cache.clean()
      log.info('EmbeddingCacheManager', 'cleaned %d entries', count)
      break
    default:
      log.error('LfwManager', 'not supported command: %s', args.command)
      ret = 1
      break
  }
  return ret
}

interface Args {
  command:    string,
  directory:  string,
  log:        string,
}

function parseArguments(): Args {
  const parser = new ArgumentParser({
    version:      VERSION,
    addHelp:      true,
    description:  'Embedding Cache Manager',
  })

  parser.addArgument(
    [ 'directory' ],
    {
      help: 'Dataset Directory',
    },
  )

  parser.addArgument(
    [ 'command' ],
    {
      help: 'init, clean',
      defaultValue: 'init',
    },
  )

  parser.addArgument(
    [ '-l', '--log' ],
    {
      help: 'Log Level: verbose, silly',
      defaultValue: 'info',
    },
  )

  return parser.parseArgs()
}

main(parseArguments())
  .then(process.exit)
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
