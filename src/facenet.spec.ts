#!/usr/bin/env ts-node

import * as test    from 'blue-tape'  // tslint:disable:no-shadowed-variable
import * as nj      from 'numjs'

import { Facenet }  from './facenet'
import { Face }     from './face'

test('Facenet smoke testing', async t => {
  const f = new Facenet()
  t.ok(f, 'should inited a Facenet instance')
  f.quit()
})

test('transformLandmarks()', async t => {
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

  const pairedLandmarks1 = f.transformMtcnnLandmarks(LANDMARKS_1)
  const pairedLandmarks2 = f.transformMtcnnLandmarks(LANDMARKS_2)
  const pairedLandmarks3 = f.transformMtcnnLandmarks(LANDMARKS_3)

  t.deepEqual(pairedLandmarks1, EXPECTED_1, 'should transform landmarks with dim #1 right')
  t.deepEqual(pairedLandmarks2, EXPECTED_2, 'should transform landmarks with dim #2 right')
  t.deepEqual(pairedLandmarks3, EXPECTED_3, 'should transform landmarks with dim #3 right')

  f.quit()
})

test('distance() for multiple rows', async t => {
  const FACE = {
    embedding: nj.array([0, 3]),
  } as any as Face

  const FACE_LIST = [
    {
      embedding: nj.array([4, 0]),
    },
    {
      embedding: nj.array([0, 8]),
    },
    {
      embedding: nj.array([0, -2]),
    },
  ] as any as Face[]
  const EXPECTED_DISTANCE_ARRAY = [5, 5, 5]

  const f = new Facenet()
  const dist = f.distance(FACE, FACE_LIST)
  t.deepEqual(dist, EXPECTED_DISTANCE_ARRAY, 'should get 5 for all three rows')
  await f.quit()
})
