const {
  Facenet,
  VERSION,
}           = require('facenet')

async function main() {
  const f = new Facenet()
  try {
    await f.init()
    console.log(`Facenet v${VERSION} smoking test passed.`)
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
.catch(console.error)
