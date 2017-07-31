#!/usr/bin/env ts-node
import * as assert  from 'assert'
import { log }      from 'brolog'

import {
  Facenet,
  FaceImage,
}                   from '../'  // from 'facenet'

async function main() {
  // Instanciate FaceNet
  const facenet = new Facenet()

  try {
    // Load image from file
    const image = new FaceImage(`${__dirname}/../tests/fixtures/two-faces.jpg`)

    // Do Face Alignment, return faces
    const faceList = await facenet.align(image)

    for (const face of faceList) {
      // Calculate Face Embedding, return feature vector
      const embedding = await facenet.embedding(face)
      assert(face.embedding === embedding)

      const filename = `${face.parentImage.id}-${face.id}.jpg`
      face.image().save(filename)

      console.log('face file:', filename)
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
