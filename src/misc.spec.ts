#!/usr/bin/env ts-node
import * as path          from 'path'

const t             = require('tap')  // tslint:disable:no-shadowed-variable
const {
  createCanvas,
  loadImage,
}                   = require('canvas')
import * as ndarray from 'ndarray'

import {
  bufResizeUint8ClampedRGBA,
  cropImage,
  imageMd5,
}                         from './misc'

// t.test('md5()', async (t: any) => {
//   const data = nj.array([1, 2, 3], 'uint8')
//   const EXPECTED_MD5 = '5289df737df57326fcdd22597afb1fac'

//   const md5Text = md5(data)
//   console.log(md5Text)
//   t.equal(md5Text, EXPECTED_MD5, 'should do md5 sum for nj.array right')
// })

t.test('bufResizeUint8ClampedRGBA()', async (t: any) => {
  const UINT8_CLAMPED_ARRAY = new Uint8ClampedArray([
    1, 1, 1, 255,
    2, 2, 2, 255,
    3, 3, 3, 255,
    4, 4, 4, 255,
  ])
  const ARRAY = ndarray(UINT8_CLAMPED_ARRAY, [2, 2, 4])
  const EXPECTED_LENGTH = 4

  const array = ARRAY.hi(1, 1).lo(0, 0)
  const resizedArray = bufResizeUint8ClampedRGBA(array)
  t.equal(resizedArray.data.length, EXPECTED_LENGTH, 'should get small buffer')
})

t.test('imageMd5()', async (t: any) => {
  const IMAGE_FILE = path.join(
    __dirname,
    '..',
    'tests',
    'fixtures',
    'aligned-face.png',
    // 'two-faces.jpg',
  )
  const EXPECTED_MD5 = '26f0d74e9599b7dec3fe10e8f12b063e'

  const image = await loadImage(IMAGE_FILE)
  const md5Text = imageMd5(image)
  // console.log(md5Text)
  t.equal(md5Text, EXPECTED_MD5, 'should calc md5 right')
})

t.test('cropImage()', async (t: any) => {
  const canvas = createCanvas(2, 2)
  const ctx = canvas.getContext('2d')

  const imageData = ctx.createImageData(2, 2)

  for (let i = 0; i < imageData.data.length; i += 4) {
    const val = 100 + i
    imageData.data[i + 0] = val
    imageData.data[i + 1] = val
    imageData.data[i + 2] = val
    imageData.data[i + 3] = 255
  }

  t.test(' should get right for rect[0, 0, 1, 1]', async (t: any) => {
    // console.log(imageData)
    const croppedImage = cropImage(imageData, 0, 0, 1, 1)
    // console.log(croppedImage.data)
    const EXPECTED_DATA = [
      100, 100, 100, 255,
    ]
    t.deepEqual(croppedImage.data, EXPECTED_DATA, 'should get cropped image data right')
  })

  t.test(' should get right for rect[1, 1, 1, 1]', async (t: any) => {
  const croppedImage = cropImage(imageData, 1, 1, 1, 1)
  // console.log(croppedImage.data)
  const EXPECTED_DATA = [
    112, 112, 112, 255,
  ]
  t.deepEqual(croppedImage.data, EXPECTED_DATA, 'should get cropped image data right')
})

})
