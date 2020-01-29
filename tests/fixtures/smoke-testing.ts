import {
  Facenet,
  VERSION,
}           from 'facenet'

async function main() {
  const f = new Facenet()
  try {
    await f.init()
    console.info(`Facenet v${VERSION}/${f.version()} smoking test passed.`)
  } catch (e) {
    console.error(e)
    // Error!
    return 1
  } finally {
    f.quit()
  }
  return 0
}

main()
.then(process.exit)
.catch(e => {
  console.error(e)
  process.exit(1)
})
