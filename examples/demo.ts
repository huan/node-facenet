#!/usr/bin/env ts-node
import * as assert  from 'assert'
import { log }      from 'brolog'

import {
  Facenet,
  FaceImage,
}                   from 'facenet'

async function main() {
  // Instanciate FaceNet
  const facenet = new Facenet()

  try {
    // Load image from file
    const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
    const image = new FaceImage(imageFile)

    // Do Face Alignment, return faces
    const faceList = await facenet.align(image)

    for (const face of faceList) {
      // Calculate Face Embedding, return feature vector
      const embedding = await facenet.embedding(face)
      assert(face.embedding === embedding,
            'Save embedding to face. Also return it for convenience')

      const faceFile = `${face.parentImage.id}-${face.id}.jpg`
      face.image().save(faceFile)

      console.log('image file:',    imageFile)
      console.log('face file:',     faceFile)
      console.log('bounding box:',  face.boundingBox)
      console.log('landmarks:',     face.facialLandmark)
      console.log('embedding:',     face.embedding)
    }
  } finally {
    facenet.quit()
  }
}

log.level('silly')

main()
.catch(console.error)
