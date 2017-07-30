#!/usr/bin/env ts-node

import * as nj from 'numjs'
const t = require('tap')  // tslint:disable:no-shadowed-variable

import { Facenet } from './facenet'

t.test('Facenet smoke testing', async (t: any) => {
  const f = new Facenet()
  t.ok(f, 'should inited a Facenet instance')
  f.quit()
})

t.test('distance()', async (t: any) => {
  const f = new Facenet()

  const a = nj.array([0, 3])
  const b = nj.array([4, 0])
  const c = f.distance(a, b)
  t.equal(c, 5, 'should get 5 for triangle 3&4&5')
  f.quit()
})

t.test('transformLandmarks()', async (t: any) => {
  const f = new Facenet()

  const LANDMARKS_1 = [
    [0],
    [1],
    [2],
    [3],
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
  ]
  const EXPECTED_1 = [
    [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]],
  ]

  const LANDMARKS_2 = [
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
  const EXPECTED_2 = [
    [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]],
    [[100, 105], [101, 106], [102, 107], [103, 108], [104, 109]],
  ]

  const LANDMARKS_3 = [
    [0, 100, 1000],
    [1, 101, 1001],
    [2, 102, 1002],
    [3, 103, 1003],
    [4, 104, 1004],
    [5, 105, 1005],
    [6, 106, 1006],
    [7, 107, 1007],
    [8, 108, 1008],
    [9, 109, 1009],
  ]
  const EXPECTED_3 = [
    [[0, 5], [1, 6], [2, 7], [3, 8], [4, 9]],
    [[100, 105], [101, 106], [102, 107], [103, 108], [104, 109]],
    [[1000, 1005], [1001, 1006], [1002, 1007], [1003, 1008], [1004, 1009]],
  ]

  const pairedLandmarks1 = f.transformLandmarks(LANDMARKS_1)
  const pairedLandmarks2 = f.transformLandmarks(LANDMARKS_2)
  const pairedLandmarks3 = f.transformLandmarks(LANDMARKS_3)

  t.deepEqual(pairedLandmarks1, EXPECTED_1, 'should transform landmarks with dim #1 right')
  t.deepEqual(pairedLandmarks2, EXPECTED_2, 'should transform landmarks with dim #2 right')
  t.deepEqual(pairedLandmarks3, EXPECTED_3, 'should transform landmarks with dim #3 right')

  f.quit()
})
