#!/usr/bin/env ts-node
import path      from 'path'

import gm        from 'gm'

import {
  Face,
  Facenet,
  log,
}                   from '../'  // from 'facenet'

import {
  Rectangle,
}                   from '../src/config'
import {
  imageToData,
  loadImage,
}                   from '../src/misc'
const printf          = require('printf')

async function main () {
  const facenet = new Facenet()
  await facenet.init()

  try {
    // Load image from file
    const imageFile = `${__dirname}/../docs/images/landing-twins-ricky-martin.jpg`
    const image = await loadImage(imageFile)
    const imageData = imageToData(image)

    // Do Face Alignment, return faces
    const faceList = await facenet.align(imageData)

    const outputImage = gm(imageFile)

    for (const face of faceList) {
      face.embedding = await facenet.embedding(face)

      const color = 'green'
      const { x, y, w, h } = face.location || { x: 0, y: 0, w: 0, h: 0 }
      const base = Math.floor((w + h) / 50) + 1
      outputImage.fill('none')
        .stroke(color, base * 1)
        .drawRectangle(
          x,
          y,
          x + w,
          y + h,
          base * 5,
        )
    }

    for (let row = 0; row < faceList.length; row++) {
      for (let col = row + 1; col < faceList.length; col++) {
        const faceR = faceList[row]
        const faceC = faceList[col]

        let dist = await facenet.distance(
          faceR,
          [faceC],
        )
        dist = printf('%.2f ', dist)

        const r = region(faceR, faceC)

        // console.info(r)

        // newImage.fill('none')
        //         .stroke('green', 1)
        //         .drawRectangle(r.x1, r.y1, r.x2, r.y2)

        const c1 = faceR.center
        const c2 = faceC.center

        outputImage.region(image.width, image.height, 0, 0)
          .stroke('none', 0)
          .fill('grey')
          .drawLine(c1.x, c1.y, c2.x, c2.y)

        outputImage.region(r.w, r.h, r.x, r.y)
          .gravity('Center')
          .stroke('none', 0)
          .fill('green')
          .fontSize(20)
          .drawText(0, 0, printf('%.2f ', dist))
      }
    }

    const visualizeFile = 'facenet-visulized.jpg'
    outputImage.noProfile().write(visualizeFile, err => {
      if (err) {
        throw err
      }
      log.info('CLI', 'Orignal image file: ',     path.resolve(imageFile))
      log.info('CLI', 'Visualized output file: ', visualizeFile)
      log.info('CLI', 'Open those files and see the result. Have a nice day!')
    })
  } finally {
    await facenet.quit()
  }
}

function region (f1: Face, f2: Face): Rectangle {

  const c1 = f1.center
  const c2 = f2.center

  let x1, y1, x2, y2

  if (c1.x < c2.x) {
    x1 = c1.x + f1.width / 2
    x2 = c2.x - f2.width / 2
  } else {
    x1 = c2.x + f2.width / 2
    x2 = c1.x - f1.width / 2
  }

  if (c1.y < c2.y) {
    y1 = c1.y + f1.height / 2
    y2 = c2.y - f2.height / 2
  } else {
    y1 = c2.y + f2.height / 2
    y2 = c1.y - f1.height / 2
  }

  if (x1 > x2) {
    [x1, x2] = [x2, x1]
  }
  if (y1 > y2) {
    [y1, y2] = [y2, y1]
  }

  return {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
  }
}

log.level('silly')

main()
  .catch(console.error)
