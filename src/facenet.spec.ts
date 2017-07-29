#!/usr/bin/env ts-node

import * as nj from 'numjs'
const t = require('tap')  // tslint:disable:no-shadowed-variable

import { Facenet } from './facenet'

t.test('Facenet smoke testing', async (t: any) => {
  const f = new Facenet()
  // await f.init()
  // await f.quit()
  t.ok(f, 'should inited a Facenet instance')
})

t.test('distance()', async (t: any) => {
  const f = new Facenet()

  const a = nj.array([0, 3])
  const b = nj.array([4, 0])
  const c = f.distance(a, b)
  t.equal(c, 5, 'should get 5 for triangle 3&4&5')
})

t.test('transformLandmarks()', async (t: any) => {
  const f = new Facenet()

  const landmarks = [
    [0, 100],
    [1, 101],
    [2, 102],
    [3, 103],
    [4, 104],
    [5, 105],
    [6, 106],
    [7, 107],
    [8, 108],
    [9, 109],
  ]
  const EXPECTED = [
    [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]],
    [[100, 105], [101, 106], [102, 107], [103, 108], [104, 109]],
  ]
  const pairedLandmarks = f.transformLandmarks(landmarks)

  t.deepEqual(pairedLandmarks, EXPECTED, 'should transform landmarks right')
})
