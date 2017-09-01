export class Manager {
  constructor() {
    //
  }

  public async start() {

  }

  public async align(file: string) {

  }
  public async validate(path: string) { }
  public async validateDatasetLFW(dataset = 'lfw') { }
  public async visualize(file: string) { }
  public async sort(path: string) { }
  public async embedding(file: string) { }


}

// import * as fs    from 'fs'

async function main(): Promise<number> {


  screen.key(['escape', 'q', 'x', 'C-q', 'C-x', 'f4', 'f10'], (/* ch: any, key: any */) => {
    screen.destroy()
  })

  screen.key('f5', () => {
    //
  })

  await splashScreen(screen)

  clear(screen)
  screen.render()

  await mainScreen(screen)

  return new Promise<number>((resolve) => {
    screen.once('destroy', () => resolve(0))
  })
}

export default Manager
