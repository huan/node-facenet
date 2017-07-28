#!/usr/bin/env ts-node

const { test } = require('tap')

import { Image } from './image'

test('Facenet.image() with rgb jpg', async (t: any) => {
  const FILE = 'tests/fixtures/rgb-bwg.jpg'
  const EXPECTED_VALUE = [
    [
      [ 254,   0,   0],
      [   0, 255,   1],
      [   0,   0, 254],
    ],
    [
      [   0,   0,   0],
      [ 255, 254, 252],
      [ 127, 127, 127],
    ],
  ]
  const img = new Image(FILE)
  t.deepEqual(img.data().tolist(), EXPECTED_VALUE, 'should get values of jpg')
})

test('Facenet.image() with rgba png', async (t: any) => {
  const FILE = 'tests/fixtures/rgb-bwt.png'
  const EXPECTED_VALUE = [
    [
      [ 255,   0,   0, 255],
      [   0, 255,   0, 255],
      [   0,   0, 255, 255],
    ],
    [
      [   0,   0,   0, 255],
      [ 255, 255, 255, 255],
      [   0,   0,   0,   0],
    ],
  ]
  const img = new Image(FILE)
  // const alpha = img.slice(null, null, [3, 4])
  //                 .flatten()
  //                 .tolist()
  t.deepEqual(img.data().tolist(), EXPECTED_VALUE, 'should get values of png')
})

test('Facenet.image() with gray jpeg', async (t: any) => {
  const FILE = 'tests/fixtures/bw-gray.jpg'
  const EXPECTED_VALUE = [ [ 0, 255 ], [ 255, 0 ] ]

  const img = new Image(FILE)
  t.deepEqual(img.data().tolist(), EXPECTED_VALUE, 'should get values of gray jpeg')
})
