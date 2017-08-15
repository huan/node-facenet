#!/usr/bin/env node

import * as path          from 'path'

import { ArgumentParser } from 'argparse'

import {
  Lfw,
  log,
  MODULE_ROOT,
  VERSION,
}                         from '../'

async function main(args: Args): Promise<number> {
  log.level(args.log as any)

  const lfw = new Lfw(args.directory)

  let ret = 0
  switch (args.command) {
    case 'dataset':
      await lfw.setup()
      const idImageList = await lfw.idImageList()
      const keys = Object.keys(idImageList)
      for (let i = 0; i < 3; i++) {
        log.info('LfwManager', 'dataset: %s has %d images: %s',
                                keys[i],
                                idImageList[keys[i]].length,
                                idImageList[keys[i]].join(','),
                )
      }
      break
    case 'setup':
      await lfw.setup()
      log.info('LfwManager', 'init done')
      break
    case 'pairs':
      const pairList = await lfw.pairList()
      const sameNum = pairList.filter(p => p[2]).length
      log.info('LfwManager', 'pairList: total %d, same %d, not-same %d',
                              pairList.length,
                              sameNum,
                              pairList.length - sameNum,
              )
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
    description:  'Labeled Faces in the Wild Manager',
  })

  parser.addArgument(
    [ 'command' ],
    {
      help: 'setup, dataset, pairs, align, embedding',
      defaultValue: 'init',
    },
  )

  parser.addArgument(
    [ '-d', '--directory' ],
    {
      help: 'LFW Dataset Directory',
      defaultValue: path.join(MODULE_ROOT, 'datasets', 'lfw'),
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
