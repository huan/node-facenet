#!/usr/bin/env ts-node

const t                   = require('tap')  // tslint:disable:no-shadowed-variable
import {
  createImageData,
  createCanvas,
}                         from './misc'

// import { log }        from './config'
// log.level('silly')
import {
  Rectangle,
  Face,
}                     from './face'

t.test('constructor()', async (t: any) => {
  const canvas = createCanvas(3, 3)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('no ctx')
  }
  const IMAGE_DATA_3_3 = ctx.createImageData(3, 3)

  let val = 0
  for (let i = 0; i < IMAGE_DATA_3_3.data.length; i += 4) {
    val++
    IMAGE_DATA_3_3.data[i + 0] = val // R
    IMAGE_DATA_3_3.data[i + 1] = val // G
    IMAGE_DATA_3_3.data[i + 2] = val // B

    IMAGE_DATA_3_3.data[i + 3] = 255 // ALPHA: must be 255. See: https://stackoverflow.com/a/23501676/1123955
  }
  /**
   * 1 2 3
   * 4 5 6
   * 7 8 9
   */
  const BOX_0_0_3_3 = [0, 0, 3, 3]
  const EXPECTED_RECT_0_0_3_3: Rectangle = {
    x: 0, y: 0,
    w: 3, h: 3,
  }
  const EXPECTED_RECT_0_0_2_2: Rectangle = {
    x: 0, y: 0,
    w: 2, h: 2,
  }
  const EXPECTED_CROPPED_0_0_2_2 = new Uint8ClampedArray([
    1, 1, 1, 255,
    2, 2, 2, 255,
    4, 4, 4, 255,
    5, 5, 5, 255,
  ])

  t.test('with full bounding box', async (t: any) => {
    const face = new Face(IMAGE_DATA_3_3, BOX_0_0_3_3)
    t.deepEqual(face.imageData.data, IMAGE_DATA_3_3.data, 'data should be equal')
    t.deepEqual(face.boundingBox, EXPECTED_RECT_0_0_3_3, 'boundingBox should be equal')

    t.equal(face.width,  3,  'should get width 3')
    t.equal(face.height, 3, 'should get height 3')
    t.equal(face.depth,  4,  'should get depth 4')
  })

  t.test('with sub bounding box that needs corp', async (t: any) => {

    const BOX = [0, 0, 2, 2]

    const face = new Face(IMAGE_DATA_3_3, BOX)
    t.deepEqual(face.imageData.data, EXPECTED_CROPPED_0_0_2_2, 'data should be cropped right')
    t.deepEqual(face.boundingBox, EXPECTED_RECT_0_0_2_2, 'boundingBox should be equal')

    t.equal(face.width,  2,  'should get width 2')
    t.equal(face.height, 2, 'should get height 2')
    t.equal(face.depth,  4,  'should get depth 4')
  })
})

t.test('JSON implementations', async (t: any) => {
  const ARRAY = new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
  const BOX = [0, 0, 1, 1]
  const CONFIDENCE = 1
  const MARKS = [[0, 0], [0, 1], [0, 0], [1, 0], [1, 1]]

  // tslint:disable-next-line:max-line-length
  const JSON_TEXT = '{"boundingBox":{"x":0,"y":0,"w":1,"h":1},"confidence":1,"imageData":"AAAABA==","facialLandmark":{"leftEye":{"x":0,"y":0},"rightEye":{"x":0,"y":1},"nose":{"x":0,"y":0},"leftMouthCorner":{"x":1,"y":0},"rightMouthCorner":{"x":1,"y":1}}}'

  const IMAGE_DATA = createImageData(ARRAY, 2, 2) as ImageData
  const face = new Face(IMAGE_DATA, BOX)
  face.init(MARKS, CONFIDENCE)

  t.test('toJSON()', async (t: any) => {
    const jsonText = JSON.stringify(face)
    t.equal(jsonText, JSON_TEXT, 'should toJson right')
  })

  t.test('fromSON()', async (t: any) => {
    const ff = Face.fromJSON(JSON_TEXT)

    t.equal(ff.boundingBox.x, BOX[0], 'boundingBox x should equal to BOX[0]')
    t.equal(ff.boundingBox.y, BOX[1], 'boundingBox y should equal to BOX[1]')
    t.equal(ff.boundingBox.w, BOX[2] - BOX[0], 'boundingBox w should equal to BOX[2-0]')
    t.equal(ff.boundingBox.h, BOX[3] - BOX[1], 'boundingBox h should equal to BOX[3-1]')

    t.equal(ff.facialLandmark.leftEye.x, MARKS[0][0], 'facialLandmark leftEye.x should equal to MARKS[0][0]')
    t.equal(ff.facialLandmark.leftEye.y, MARKS[0][1], 'facialLandmark leftEye.y should equal to MARKS[0][1]')
    // TODO: test all the facialLandmarks

    t.equal(ff.confidence, CONFIDENCE, 'should get the same confidence')
  })
})

t.test('squareBox()', async (t: any) => {
  t.pass('ok')
})
