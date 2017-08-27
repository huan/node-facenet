#!/usr/bin/env ts-node
import * as path          from 'path'

const t             = require('tap')  // tslint:disable:no-shadowed-variable

import * as ndarray from 'ndarray'
import * as nj      from 'numjs'

import {
  bufResizeUint8ClampedRGBA,
  createCanvas,
  createImageData,
  cropImage,
  dataToImage,
  distance,
  imageMd5,
  imageToData,
  loadImage,
  resizeImage,
}                         from './misc'

import {
  fixtureImageData3x3,
}                         from './fixtures'

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

t.test('resizeImage()', async (t: any) => {
  const UINT8_CLAMPED_ARRAY = new Uint8ClampedArray([
    0, 0, 0, 255,
    0, 0, 0, 255,
    100, 100, 100, 255,
    100, 100, 100, 255,
  ])
  const EXPECTED_DATA = new Uint8ClampedArray([
    50, 50, 50, 255,
  ])
  const imageData = createImageData(UINT8_CLAMPED_ARRAY, 2, 2)
  const resizedData = await resizeImage(imageData, 1, 1)

  t.deepEqual(resizedData.data, EXPECTED_DATA, 'should get resized data')
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
  const imageData = fixtureImageData3x3()
  /**
   * 1 2 3
   * 4 5 6
   * 7 8 9
   */

  const EXPECTED_DATA_CROP_0_0_1_1 = [
    1, 1, 1, 255,
  ]
  const EXPECTED_DATA_CROP_1_1_1_1 = [
    5, 5, 5, 255,
  ]
  const EXPECTED_DATA_CROP_0_0_3_2 = [
    1, 1, 1, 255,
    2, 2, 2, 255,
    3, 3, 3, 255,

    4, 4, 4, 255,
    5, 5, 5, 255,
    6, 6, 6, 255,
  ]

  t.test('should get right for rect[0, 0, 1, 1]', async (t: any) => {
    const croppedImage = cropImage(imageData, 0, 0, 1, 1)
    t.deepEqual(croppedImage.data, EXPECTED_DATA_CROP_0_0_1_1, 'should get cropped image data right for [0 0 1 1]')
  })

  t.test('should get right for rect[1, 1, 1, 1]', async (t: any) => {
    const croppedImage = cropImage(imageData, 1, 1, 1, 1)
    t.deepEqual(croppedImage.data, EXPECTED_DATA_CROP_1_1_1_1, 'should get cropped image data right for [1 1 1 1]')
  })

  t.test('should get right for rect[0, 0, 3, 2]', async (t: any) => {
    const croppedImage = cropImage(imageData, 0, 0, 3, 2)
    t.deepEqual(croppedImage.data, EXPECTED_DATA_CROP_0_0_3_2, 'should get cropped image data right for [0 0 3 2]')
  })
})

t.test('Image/Data convert', async (t: any) => {
  const IMAGE_DATA = fixtureImageData3x3()
  // tslint:disable-next-line:max-line-length
  const IMAGE = await loadImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAYAAABWKLW/AAAABmJLR0QA/wD/AP+gvaeTAAAAHElEQVQImWNkZGT8z8jIyMDIyMjAwszMzICVAwAmtQEw+Y/4igAAAABJRU5ErkJggg==')

  t.test('dataToImage()', async (t: any) => {
    const canvas = createCanvas(3, 3)
    const ctx = canvas.getContext('2d')
    const image = await dataToImage(IMAGE_DATA)
    if (!ctx) {
      throw new Error('no ctx')
    }
    ctx.drawImage(image, 0, 0)
    const data = ctx.getImageData(0, 0, 3, 3)
    t.deepEqual(data, IMAGE_DATA, 'should conver data to image right')
  })

  t.test('imageToData', async (t: any) => {
    const data = imageToData(IMAGE)
    t.deepEqual(data, IMAGE_DATA, 'should conver image to data right')
  })
})

t.test('distance()', async (t: any) => {
  t.test('embedding list contains 1 row', async (t: any) => {
    const a = nj.array([0, 3])
    const b = nj.array([4, 0]).reshape(1, 2) as nj.NdArray
    const c = distance(a, b)
    t.equal(c[0], 5, 'should get 5 for triangle 3&4&5')
  })

  t.test('embedding list contains 3 row', async (t: any) => {
    const a = nj.array([0, 3])
    const b = nj.array([
      4, 0,
      0, 8,
      0, -2,
    ]).reshape(3, 2) as nj.NdArray
    const c = distance(a, b)
    t.deepEqual(c, [5, 5, 5], 'should get 5 for all three rows')
  })

})
