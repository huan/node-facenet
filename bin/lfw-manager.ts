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
    case 'init':
      await lfw.init()
      break
    case 'pairs':
      const pairList = await lfw.pairList()
      log.info('LfwCli', 'pairList: %s', pairList[0])
      break
    default:
      log.error('LfwCli', 'not supported command: %s', args.command)
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
      defaultValue: 'warn',
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
