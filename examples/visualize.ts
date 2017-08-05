#!/usr/bin/env ts-node
import { log }      from 'brolog'
import * as gm      from 'gm'
const printf        = require('printf')

import {
  Facenet,
  FaceImage,
}                   from '../'  // from 'facenet'

async function main() {
  const facenet = new Facenet()
  await facenet.init()

  try {
    // Load image from file
    // const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
    const imageFile = `/home/zixia/Downloads/landing-twins-ricky-martin.jpg`
    const image = new FaceImage(imageFile)

    // Do Face Alignment, return faces
    const faceList = await facenet.align(image)

    const newImage = gm(imageFile)

    for (const face of faceList) {
      await facenet.embedding(face)

      const color = 'green'
      const box = face.boundingBox
      const base = Math.floor((box.x2 - box.x1 + box.y2 - box.y1) / 50) + 1
      newImage.fill('none')
              .stroke(color, base * 1)
              .drawRectangle(
                box.x1,
                box.y1,
                box.x2,
                box.y2,
                base * 5,
              )
    }

    for (let row = 0; row < 3; row++) {
      let line = Array(row + 2).join(
        Array(5 + 1).join(' '),
      )
      for (let col = row + 1; col < 3; col++) {
        const dist = await facenet.distance(
          faceList[row].embedding,
          faceList[col].embedding,
        )
        line += printf('%.2f ', dist)
      }
      log.info('DIST', line)
    }

    const visualizeFile = '/tmp/facenet-visulize.jpg'
    newImage.noProfile().write(visualizeFile, err => {
      if (err) {
        throw err
      }
      log.info('CLI', 'Saved aligned image to', visualizeFile)
      log.info('CLI', 'Have a nice day!')
    })
  } finally {
    facenet.quit()
  }
}

// log.level('silly')

main()
.catch(console.error)
