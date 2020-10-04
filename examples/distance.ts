#!/usr/bin/env ts-node

import { Facenet } from '../'  // from 'facenet'

async function main () {
  // Instanciate FaceNet
  const facenet = new Facenet()

  try {
    // Load image from file
    const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`

    // Do Face Alignment, return faces
    const faceList = await facenet.align(imageFile)
    faceList[0].embedding = await facenet.embedding(faceList[0])
    faceList[1].embedding = await facenet.embedding(faceList[1])
    console.info('distance between the different face: ', faceList[0].distance(faceList[1]))
    console.info('distance between the same face:      ', faceList[0].distance(faceList[0]))
  } finally {
    await facenet.quit()
  }
}

main()
  .catch(console.error)
