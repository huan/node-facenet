#!/usr/bin/env ts-node
import { log }      from 'brolog'
import * as gm      from 'gm'
const printf        = require('printf')

import {
  Face,
  Facenet,
  FaceImage,
  BoundingBox,
}                   from '../'  // from 'facenet'

async function main() {
  const facenet = new Facenet()
  await facenet.init()

  try {
    // Load image from file
    // const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
    const imageFile = `/home/zixia/Downloads/landing-twins-ricky-martin.jpg`
    // const imageFile = `/home/zixia/Downloads/me-and-girls.jpg`
    // const imageFile = '/datasets/facetest/friends-cast.jpg'
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

    for (let row = 0; row < faceList.length; row++) {
      for (let col = row + 1; col < faceList.length; col++) {
        let dist = await facenet.distance(
          faceList[row].embedding,
          faceList[col].embedding,
        )
        dist = printf('%.2f ', dist)

        const r = region(faceList[row], faceList[col])

        // console.log(r)

        // newImage.fill('none')
        //         .stroke('green', 1)
        //         .drawRectangle(r.x1, r.y1, r.x2, r.y2)

        newImage.region(r.x2 - r.x1, r.y2 - r.y1, r.x1, r.y1)
                .gravity('Center')
                .fill('green')
                .fontSize(30)
                .drawText(0, 0, printf('Similarity: %.2f ', dist))
      }
    }

    const visualizeFile = '/tmp/facenet-visulize.png'
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

function region(f1: Face, f2: Face): BoundingBox {

  const c1 = f1.center()
  const c2 = f2.center()

  let x1, y1, x2, y2

  if (c1[0] < c2[0]) {
    x1 = c1[0] + f1.width() / 2
    x2 = c2[0] - f2.width() / 2
  } else {
    x1 = c2[0] + f2.width() / 2
    x2 = c1[0] - f1.width() / 2
  }

  if (c1[1] < c2[1]) {
    y1 = c1[1] + f1.height() / 2
    y2 = c2[1] - f2.height() / 2
  } else {
    y1 = c2[1] + f2.height() / 2
    y2 = c1[1] - f1.height() / 2
  }

  if (x1 > x2) {
    [x1, x2] = [x2, x1]
  }
  if (y1 > y2) {
    [y1, y2] = [y2, y1]
  }

  return {x1, x2, y1, y2}
}

// log.level('silly')

main()
.catch(console.error)
