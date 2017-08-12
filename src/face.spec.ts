#!/usr/bin/env ts-node

const t             = require('tap')  // tslint:disable:no-shadowed-variable
const { ImageData } = require('canvas')

import { log }        from './config'
log.level('silly')
// import { FaceImage }  from './face-image'
import {
  Rectangle,
  Face,
}                     from './face'

t.test('constructor() with full bounding box', async (t: any) => {
    // https://stackoverflow.com/a/23501676/1123955
  const ARRAY = new Uint8ClampedArray([
    1, 2, 3, 255,
    5, 6, 7, 255,
    9, 10, 11, 255,
    13, 14, 15, 255,
  ])
  const IMAGE_DATA = new ImageData(ARRAY, 2, 2) as ImageData
  const RECT: Rectangle = {
    x: 0,
    y: 0,
    w: 2,
    h: 2,
  }
  const BOX = [0, 0, 1, 1]
  const f = new Face(IMAGE_DATA, BOX)
  t.deepEqual(f.data.data, IMAGE_DATA.data, 'data should be equal')
  t.deepEqual(f.boundingBox, RECT, 'boundingBox should be equal')
})

t.test('constructor() with sub bounding box that needs corp', async (t: any) => {
  // https://stackoverflow.com/a/23501676/1123955
  const ARRAY = new Uint8ClampedArray([
    1, 2, 3, 255,
    5, 6, 7, 255,
    9, 10, 11, 255,
    13, 14, 15, 255,
    17, 18, 19, 255,
    21, 22, 23, 255,
  ])
  const IMAGE_DATA = new ImageData(ARRAY, 2, 3) as ImageData
  const EXPECTED_BOUNDING_BOX: Rectangle = {
    x: 0,
    y: 0,
    w: 2,
    h: 2,
  }
  const EXPECTED_CROPPED_ARRAY = new Uint8ClampedArray([
    1, 2, 3, 255,
    5, 6, 7, 255,
    13, 14, 15, 255,
    17, 18, 19, 255,
  ])

  const BOX = [0, 0, 1, 1]
  const f = new Face(IMAGE_DATA, BOX)
  t.deepEqual(f.data.data, EXPECTED_CROPPED_ARRAY, 'data should be cropped right')
  t.deepEqual(f.boundingBox, EXPECTED_BOUNDING_BOX, 'boundingBox should be equal')
})

t.test('toJSON & fromJSON', async (t: any) => {
  const ARRAY = new Uint8ClampedArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
  const BOX = [0, 0, 1, 1]
  const CONFIDENCE = 1
  const MARKS = [[0, 0], [0, 1], [0, 0], [1, 0], [1, 1]]

  // tslint:disable-next-line:max-line-length
  const JSON_TEXT = '{"boundingBox":{"x":0,"y":0,"w":1,"h":1},"confidence":1,"data":"AQIDBAUGBwgJCgsMDQ4PEA==","facialLandmark":{"leftEye":{"x":0,"y":0},"rightEye":{"x":0,"y":1},"nose":{"x":0,"y":0},"leftMouthCorner":{"x":1,"y":0},"rightMouthCorner":{"x":1,"y":1}}}'

  const IMAGE_DATA = new ImageData(ARRAY, 2, 2)
  const f = new Face(IMAGE_DATA, BOX)
  f.init(MARKS, CONFIDENCE)

  const jsonText = JSON.stringify(f)

  t.equal(jsonText, JSON_TEXT, 'should toJson right')

  const ff = Face.fromJSON(JSON_TEXT)

  t.equal(ff.boundingBox.x, BOX[0], 'boundingBox x should equal to BOX[0]')
  t.equal(ff.boundingBox.y, BOX[1], 'boundingBox y should equal to BOX[1]')
  t.equal(ff.boundingBox.w, BOX[2] - BOX[0] + 1, 'boundingBox w should equal to BOX[2-0]')
  t.equal(ff.boundingBox.h, BOX[3] - BOX[1] + 1, 'boundingBox h should equal to BOX[3-1]')

  t.equal(ff.facialLandmark.leftEye.x, MARKS[0][0], 'facialLandmark leftEye.x should equal to MARKS[0][0]')
  t.equal(ff.facialLandmark.leftEye.y, MARKS[0][1], 'facialLandmark leftEye.y should equal to MARKS[0][1]')
  // TODO: test all the facialLandmarks

  t.equal(ff.confidence, CONFIDENCE, 'should get the same confidence')
})

t.test('squareBox()', async (t: any) => {
  t.pass('ok')
})
