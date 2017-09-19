#!/usr/bin/env ts-node

const t                 = require('tap')  // tslint:disable:no-shadowed-variable
import * as nj          from 'numjs'

import {
  fixtureImageData3x3,
}                       from '../tests/fixtures/'

import {
  // log,
  Rectangle,
}                       from './config'
// log.level('silly')
import {
  Face,
}                       from './face'

t.test('constructor()', async (t: any) => {
  const IMAGE_DATA_3_3 = fixtureImageData3x3()

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
    t.deepEqual(face.rect, EXPECTED_RECT_0_0_3_3, 'rectangle should be equal')

    t.equal(face.width,  3, 'should get width 3')
    t.equal(face.height, 3, 'should get height 3')
    t.equal(face.depth,  4, 'should get depth 4')
  })

  t.test('with sub bounding box that needs corp', async (t: any) => {

    const BOX = [0, 0, 2, 2]

    const face = new Face(IMAGE_DATA_3_3, BOX)
    t.deepEqual(face.imageData.data, EXPECTED_CROPPED_0_0_2_2, 'data should be cropped right')
    t.deepEqual(face.rect, EXPECTED_RECT_0_0_2_2, 'rectangle should be equal')

    t.equal(face.width,  2,  'should get width 2')
    t.equal(face.height, 2, 'should get height 2')
    t.equal(face.depth,  4,  'should get depth 4')
  })

  t.test('via filename', async (t: any) => {
    const IMAGE_RGB_BWT_FILE = `${__dirname}/../tests/fixtures/rgb-bwt.png`
    const EXPECTED_IMAGE_RGB_BWT_ARRAY = new Uint8ClampedArray([
      255, 0, 0, 255,
      0, 255, 0, 255,
      0, 0, 255, 255,
      0, 0, 0, 255,
      255, 255, 255, 255,
      0, 0, 0, 0,
    ])
    const face = new Face(IMAGE_RGB_BWT_FILE)
    t.deepEqual(face.imageData.data, EXPECTED_IMAGE_RGB_BWT_ARRAY, 'should load imageData with deasync')
  })

})

t.test('JSON implementations', async (t: any) => {
  // TODO: add _embedding json test

  const IMAGE_DATA  = fixtureImageData3x3()
  const BOX         = [0, 0, 2, 2]
  const CONFIDENCE  = 1
  const MARKS       = [
    [0, 0], [0, 1],
    [0, 0],
    [1, 0], [1, 1],
  ]
  const EXPECTED_IMAGE_ARRAY_2_2 = [
    1, 1, 1, 255,
    2, 2, 2, 255,
    4, 4, 4, 255,
    5, 5, 5, 255,
  ]
  const EMBEDDING = nj.arange(128)

  // tslint:disable-next-line:max-line-length
  const JSON_TEXT = '{"_embedding":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127],"boundingBox":[0,0,2,2],"confidence":1,"facialLandmark":{"leftEye":{"x":0,"y":0},"rightEye":{"x":0,"y":1},"nose":{"x":0,"y":0},"leftMouthCorner":{"x":1,"y":0},"rightMouthCorner":{"x":1,"y":1}},"imageData":"AQEB/wICAv8EBAT/BQUF/w==","rect":{"x":0,"y":0,"w":2,"h":2}}'

  const face = new Face(IMAGE_DATA, BOX)
  face.init(MARKS, CONFIDENCE)
  face.embedding = EMBEDDING

  t.test('toJSON()', async (t: any) => {
    const jsonText = JSON.stringify(face)
    t.equal(jsonText, JSON_TEXT, 'should toJson right')
  })

  t.test('fromSON()', async (t: any) => {
    const face = Face.fromJSON(JSON_TEXT)
    t.deepEqual(face.imageData.data, EXPECTED_IMAGE_ARRAY_2_2, 'should restore imageData right')

    t.equal(face.rect.x, BOX[0], 'rectangle x should equal to BOX[0]')
    t.equal(face.rect.y, BOX[1], 'rectangle y should equal to BOX[1]')
    t.equal(face.rect.w, BOX[2] - BOX[0], 'rectangle w should equal to BOX[2-0]')
    t.equal(face.rect.h, BOX[3] - BOX[1], 'rectangle h should equal to BOX[3-1]')

    t.equal(face.facialLandmark.leftEye.x, MARKS[0][0], 'facialLandmark leftEye.x should equal to MARKS[0][0]')
    t.equal(face.facialLandmark.leftEye.y, MARKS[0][1], 'facialLandmark leftEye.y should equal to MARKS[0][1]')
    // TODO: test all the facialLandmarks

    t.equal(face.confidence, CONFIDENCE, 'should get the same confidence')

    t.ok(face.embedding instanceof (nj as any).NdArray, 'should get back a numjs NdArray')
    t.deepEqual(face.embedding.tolist(), EMBEDDING.tolist(), 'should restore the embedding right')
  })
})

// TODO: add distance test

t.test('squareBox()', async (t: any) => {
  t.pass('ok')
})
