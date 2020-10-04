#!/usr/bin/env ts-node

import {
  Facenet,
}                   from '../'  // from 'facenet'
import {
  saveImage,
}                   from '../src/misc'

// import { log }      from '../'
// log.level('silly')

async function main () {
  // Instanciate FaceNet
  const facenet = new Facenet()

  // Init TensorFlow Backend:
  //  This is very slow for the first time initialization,
  //  which will take 15 - 100 seconds on different machines.
  await facenet.init()

  try {
    // Load image from file
    const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`

    // Do Face Alignment, return faces
    const faceList = await facenet.align(imageFile)

    for (const face of faceList) {
      // Calculate Face Embedding, return feature vector
      face.embedding = await facenet.embedding(face)

      const faceFile = `${face.md5}.png`
      if (face.imageData) {
        await saveImage(face.imageData, faceFile)
      } else {
        console.error('face no image data!')
      }

      console.info('image file:',    imageFile)
      console.info('face file:',     faceFile)
      console.info('confidence:',    face.confidence)
      console.info('bounding box:',  face.location)
      console.info('landmarks:',     face.landmark)
      console.info('embedding:',     face.embedding)
    }
  } finally {
    await facenet.quit()
  }
}

main()
  .catch(console.error)
