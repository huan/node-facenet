#!/usr/bin/env node

import { ArgumentParser } from 'argparse'

import {
  Lfw,
  log,
  VERSION,
}                         from '../'

async function main(args: Args): Promise<number> {
  log.level(args.log as any)
  const lfw = new Lfw(args.directory)

  let ret = 0
  switch (args.command) {
    case 'dataset':
      await lfw.init()
      const dataset = await lfw.dataset()
      const keys = Object.keys(dataset)
      for (let i = 0; i < 10; i++) {
        log.info('LfwManager', 'dataset: %s has %d images: %s',
                                keys[i],
                                dataset[keys[i]].length,
                                dataset[keys[i]].join(','),
                )
      }
      break
    case 'init':
      await lfw.init()
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
      help: 'init, align, embedding',
      defaultValue: 'init',
    },
  )

  parser.addArgument(
    [ '-d', '--directory' ],
    {
      help: 'LFW Dataset Directory',
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
