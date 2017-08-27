#!/usr/bin/env ts-node
import * as assert  from 'assert'

import {
  Facenet,
}                   from '../'  // from 'facenet'
import {
  saveImage,
}                   from '../src/misc'

// import { log }      from '../'
// log.level('silly')

async function main() {
  // Instanciate FaceNet
  const facenet = new Facenet()

  try {
    // Load image from file
    const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`

    // Do Face Alignment, return faces
    const faceList = await facenet.align(imageFile)

    for (const face of faceList) {
      // Calculate Face Embedding, return feature vector
      const embedding = await facenet.embedding(face)
      assert(face.embedding === embedding,
            'Save embedding to face. Also return it for convenience')

      const faceFile = `${face.md5}.png`
      saveImage(face.imageData, face.md5, 'png')

      console.log('image file:',    imageFile)
      console.log('face file:',     faceFile)
      console.log('bounding box:',  face.rect)
      console.log('landmarks:',     face.facialLandmark)
      console.log('embedding:',     face.embedding)
    }
  } finally {
    facenet.quit()
  }
}

main()
.catch(console.error)
