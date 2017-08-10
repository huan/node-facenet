#!/usr/bin/env ts-node

const { test } = require('tap')

import { FaceImage }  from './face-image'
import { Face }       from './face'

test('Smoke testing', async (t: any) => {
  const f = new Face()
  t.ok(f, 'should be instanciated')
})

test('toJSON & fromJSON', async (t: any) => {
  const URL = 'url://test'
  const BOX = [1, 2, 3, 4]
  const CONFIDENCE = 1
  const MARKS = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]

  // tslint:disable-next-line:max-line-length
  const JSON_TEXT = '{"facialLandmark":{"leftEye":{"x":1,"y":1},"rightEye":{"x":2,"y":2},"nose":{"x":3,"y":3},"leftMouthCorner":{"x":4,"y":4},"rightMouthCorner":{"x":5,"y":5}},"boundingBox":{"p1":{"x":1,"y":2},"p2":{"x":3,"y":4}},"confidence":1,"parentImageUrl":"url://test","box":[1,2,3,4]}'

  const f = new Face()
  const i = new FaceImage(URL)

  f.init(i, BOX, MARKS, CONFIDENCE)

  const jsonText = JSON.stringify(f)

  t.equal(jsonText, JSON_TEXT, 'should toJson right')

  const ff = Face.fromJSON(JSON_TEXT)

  t.equal(ff.parentImage.url, URL, 'should get url right')

  t.equal(ff.boundingBox.p1.x, BOX[0], 'boundingBox p1.x should equal to BOX[0]')
  t.equal(ff.boundingBox.p1.y, BOX[1], 'boundingBox p1.y should equal to BOX[1]')
  t.equal(ff.boundingBox.p2.x, BOX[2], 'boundingBox p2.x should equal to BOX[2]')
  t.equal(ff.boundingBox.p2.y, BOX[3], 'boundingBox p2.y should equal to BOX[3]')

  t.equal(ff.facialLandmark.leftEye.x, MARKS[0][0], 'facialLandmark leftEye.x should equal to MARKS[0][0]')
  t.equal(ff.facialLandmark.leftEye.y, MARKS[0][1], 'facialLandmark leftEye.y should equal to MARKS[0][1]')
  // TODO: test all the facialLandmarks

  t.equal(ff.confidence, CONFIDENCE, 'should get the same confidence')
})
