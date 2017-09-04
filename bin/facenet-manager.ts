import * as path            from 'path'
import { ArgumentParser }   from 'argparse'
import * as updateNotifier  from 'update-notifier'

import {
  log,
  MODULE_ROOT,
  VERSION,
}                   from '../src/config'
import { Manager }  from '../src/manager/'

function checkUpdate() {
  const pkgFile   = path.join(MODULE_ROOT, 'package.json')
  const pkg       = require(pkgFile)
  const notifier  = updateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 7, // 1 week
  })
  notifier.notify()
}

function assertNever(obj: never): never {
  throw new Error('Unexpected object: ' + obj)
}

async function main(args: Args): Promise<number> {
  log.info('Manager', `Facenet v${VERSION}`)

  checkUpdate()

  const manager = new Manager()
  await manager.init()

  const command  = args.commands[0]
  const pathname = args.commands[1]

  try {
    switch (command) {
      case 'blessed':
        await manager.start()
        break
      case 'align':
        await manager.align(pathname)
        break
      case 'validate':
        await manager.validate(pathname)
        break
      case 'visualize':
        await manager.visualize(pathname)
        break
      case 'embedding':
        await manager.embedding(pathname)
        break
      case 'sort':
        await manager.sort(pathname)
        break

      default:
        assertNever(command)
    }
    return 0
  } catch (e) {
    log.error('ManagerCli', 'Exception: %s', e)
    console.error(e)
    return 1
  }
}

type Command =    'align'
                | 'embedding'
                | 'validate'
                | 'visualize'
                | 'sort'
                | 'blessed'
interface Args {
  commands: [
    Command,
    string
  ]
}

function parseArguments(): Args {
  const parser = new ArgumentParser({
    version:      VERSION,
    addHelp:      true,
    description:  'FaceNet Manager',
  })

  parser.addArgument(
    [ 'commands' ],
    {
      help: `
        align:      align the photo
        embedding:  calculate the embedding of photo
        visualize:  visualize the face box & embedding distance between faces
        validate:   validate on LFW dataset
        sort:       save photos to seprate directories based on identification.
      \n`,
      defaultValue: ['blessed'],
      nargs: '*',
    },
  )

  // parser.addArgument(
  //   [ '-d', '--directory' ],
  //   {
  //     help: 'Dataset Directory',
  //     defaultValue: path.join(MODULE_ROOT, 'datasets', 'lfw'),
  //   },
  // )

  // parser.addArgument(
  //   [ '-l', '--log' ],
  //   {
  //     help: 'Log Level: verbose, silly',
  //     defaultValue: 'info',
  //   },
  // )

  return parser.parseArgs()
}

log.level('silly')

main(parseArguments())
.then(process.exit)
.catch(e => {
  console.error(e)
  process.exit(1)
})
