#!/usr/bin/env ts-node

import { Facenet } from '../'  // from 'facenet'

async function main() {
  // Instanciate FaceNet
  const facenet = new Facenet()

  try {
    // Load image from file
    const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`

    // Do Face Alignment, return faces
    const faceList = await facenet.align(imageFile)
    for (const face of faceList) {
      await face.save(face.md5 + '.jpg')
      console.log(`save face ${face.md5}.jpg successfuly`)
    }
    console.log(`Save ${faceList.length} faces from the imageFile`)
  } finally {
    facenet.quit()
  }
}

main()
.catch(console.error)
