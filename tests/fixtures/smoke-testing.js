const {
  Facenet,
  VERSION,
}           = require('facenet')

const f = Facenet()
f.quit()
console.log(`Facenet v${VERSION} smoking test passed.`)
