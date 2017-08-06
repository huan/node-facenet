#!/usr/bin/env ts-node
import * as gm      from 'gm'
const printf        = require('printf')

import {
  BoundingBox,
  Face,
  Facenet,
  FaceImage,
  log,
}                   from '../'  // from 'facenet'

async function main() {
  const facenet = new Facenet()
  await facenet.init()

  try {
    // Load image from file
    const imageFile = `${__dirname}/../docs/images/landing-twins-ricky-martin.jpg`
    const image = new FaceImage(imageFile)

    // Do Face Alignment, return faces
    const faceList = await facenet.align(image)

    const newImage = gm(imageFile)

    for (const face of faceList) {
      await facenet.embedding(face)

      const color = 'green'
      const {p1, p2} = face.boundingBox
      const base = Math.floor((p2.x - p1.x + p2.y - p1.y) / 50) + 1
      newImage.fill('none')
              .stroke(color, base * 1)
              .drawRectangle(
                p1.x,
                p1.y,
                p2.x,
                p2.y,
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

        const c1 = faceList[row].center()
        const c2 = faceList[col].center()

        newImage.region(image.width(), image.height(), 0, 0)
                .stroke('none', 0)
                .fill('grey')
                .drawLine(c1.x, c1.y, c2.x, c2.y)

        newImage.region(r.p2.x - r.p1.x, r.p2.y - r.p1.y, r.p1.x, r.p1.y)
                .gravity('Center')
                .stroke('none', 0)
                .fill('green')
                .fontSize(20)
                .drawText(0, 0, printf('%.2f ', dist))
      }
    }

    const visualizeFile = 'facenet-visulized.jpg'
    newImage.noProfile().write(visualizeFile, err => {
      if (err) {
        throw err
      }
      log.info('CLI', 'Visualized image saved to: ', visualizeFile)
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

  if (c1.x < c2.x) {
    x1 = c1.x + f1.width() / 2
    x2 = c2.x - f2.width() / 2
  } else {
    x1 = c2.x + f2.width() / 2
    x2 = c1.x - f1.width() / 2
  }

  if (c1.y < c2.y) {
    y1 = c1.y + f1.height() / 2
    y2 = c2.y - f2.height() / 2
  } else {
    y1 = c2.y + f2.height() / 2
    y2 = c1.y - f1.height() / 2
  }

  if (x1 > x2) {
    [x1, x2] = [x2, x1]
  }
  if (y1 > y2) {
    [y1, y2] = [y2, y1]
  }

  const p1 = {
    x: x1,
    y: y1,
  }

  const p2 = {
    x: x2,
    y: y2,
  }

  return {
    p1,
    p2,
  }
}

// log.level('silly')

main()
.catch(console.error)
