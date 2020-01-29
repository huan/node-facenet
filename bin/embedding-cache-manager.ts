#!/usr/bin/env node

import path          from 'path'
import { ArgumentParser } from 'argparse'

import {
  AlignmentCache,
  EmbeddingCache,
  FaceCache,
  Facenet,
  Lfw,
  log,
  VERSION,
}                         from '../'

async function main(args: Args): Promise<number> {
  log.level(args.log as any)

  let workdir: string
  if (args.directory.startsWith(path.sep)) {
    workdir = args.directory
  } else {
    workdir = path.join(process.cwd(), args.directory)
  }

  const facenet = new Facenet()
  const lfw = new Lfw(workdir)

  const faceCache      = new FaceCache(workdir)
  const alignmentCache = new AlignmentCache(facenet, faceCache, workdir)
  const embeddingCache = new EmbeddingCache(facenet, workdir)

  await alignmentCache.init()
  await embeddingCache.init()
  await faceCache.init()
  await facenet.init()

  const count = await embeddingCache.count()

  let ret = 0
  switch (args.command) {
    case 'setup':
      const imageList = await lfw.imageList()
      for (const relativePath of imageList) {
        const file = path.join(lfw.directory, relativePath)

        const faceList = await alignmentCache.align(file)
        await Promise.all(
          faceList.map(face => embeddingCache.embedding(face)),
        )
      }
      log.info('EmbeddingCacheManager', 'cache: %s has inited %d entries',
                                        args.directory,
                                        count,
              )
      break
    case 'destroy':
      await embeddingCache.destroy()
      log.info('EmbeddingCacheManager', 'cleaned %d entries', count)
      break
    default:
      log.error('LfwManager', 'not supported command: %s', args.command)
      ret = 1
      break
  }
  await facenet.quit()
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
      help: 'setup, clean',
      defaultValue: 'setup',
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
