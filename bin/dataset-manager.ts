#!/usr/bin/env node

import * as path          from 'path'

import { ArgumentParser } from 'argparse'

import {
  // Dataset,
  Lfw,
  log,
  VERSION,
}                         from '../'

import {
  MODULE_ROOT,
}                         from '../src/config'

async function main(args: Args): Promise<number> {
  log.level(args.log as any)

  let dataset
  switch (args.dataset) {
    case 'lfw':
      dataset = new Lfw(args.directory)
      break

    default:
      log.error('DatasetManager', 'Dataset %s not support(yet)', args.dataset)
      return 1
  }

  let ret = 0
  switch (args.command) {
    case 'setup':
      await dataset.setup()
      log.info('DatasetManager', 'setup done')
      break

    case 'list':
      const idImageList = await dataset.idImageList()
      const keys = Object.keys(idImageList)
      for (let i = 0; i < 3; i++) {
        log.info('LfwManager', 'dataset: %s has %d images: %s',
                                keys[i],
                                idImageList[keys[i]].length,
                                idImageList[keys[i]].join(','),
                )
      }
      break

    case 'pairs':
      const pairList = await dataset.pairList()
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
  dataset:    string,
  command:    string
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
    [ 'dataset' ],
    {
      help: 'Dataset Name: lfw, casia(not implement yet), ms-celeb-1m(not implement yet)',
      defaultValue: 'lfw',
    },
  )

  parser.addArgument(
    [ 'command' ],
    {
      help: 'setup, align, embedding',
      defaultValue: 'setup',
    },
  )

  parser.addArgument(
    [ '-d', '--directory' ],
    {
      help: 'Dataset Directory',
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
