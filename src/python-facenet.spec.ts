#!/usr/bin/env ts-node
import * as path          from 'path'
import * as nj            from 'numjs'
const t = require('tap')  // tslint:disable:no-shadowed-variable

import { PythonFacenet }  from './python-facenet'

t.test('PythonFacenet smoke testing', { timeout: 60 * 1000 }, async (t: any) => {
  const pf = new PythonFacenet()
  t.ok(pf, 'should be instanciated')
})

t.test('JSON bridge', async (t: any) => {
  const DATA1 = [[1, 2], [3, 4], [5, 6]]
  const DATA2 = {
    a: [[1, 2], [3, 4], [5, 6]],
    b: 'test',
  }
  const DATA3 = [[[254, 0, 0], [0, 255, 1], [0, 0, 254]], [[0, 0, 0], [255, 254, 252], [127, 127, 127]]]

  const pf = new PythonFacenet()

  const ret1 = await pf.json_parse(JSON.stringify(DATA1))
  t.deepEqual(ret1, DATA1, 'should be equal after processed by python bridge #1')
  const ret2 = await pf.json_parse(JSON.stringify(DATA2))
  t.deepEqual(ret2, DATA2, 'should be equal after processed by python bridge #2')
  const ret3 = await pf.json_parse(JSON.stringify(DATA3))
  t.deepEqual(ret3, DATA3, 'should be equal after processed by python bridge #3')

  pf.quit()
})

t.test('align()', async (t: any) => {
  const pf = new PythonFacenet()
  await pf.initMtcnn()

  const IMAGE_FILE = path.resolve(__dirname, '../tests/fixtures/two-faces.jpg')
  const image = nj.images.read(IMAGE_FILE)
                        .tolist() as any as number[][]

  const [boundingBoxes, landmarks] = await pf.align(image)
  const numFaces = boundingBoxes.length
  const numMarks = landmarks.length
  const confidence = boundingBoxes[0][4]

  t.equal(numFaces, 2, 'should get two faces')
  t.equal(numMarks, 2, 'should get two set of marks')
  t.ok(confidence > 0 && confidence < 1, 'shoud get confidencee between 0 to 1')
  await pf.quit()
})

t.test('embedding()', async (t: any) => {
  const pf = new PythonFacenet()
  await pf.initFacenet()

  const IMAGE_FILE = path.resolve(__dirname, '../tests/fixtures/aligned-face.png')
  const image = nj.images.read(IMAGE_FILE)
                        .tolist() as any as number[][]

  const embedding = await pf.embedding(image)

  t.equal(embedding.length, 128, 'should get 128 dim embedding')
  const valid = embedding
                .map(i => i > -0.5 && i < 0.5)
                .reduce((total, cur) => total && cur, true)
  t.ok(valid, 'should get vector normalized between -0.5 to 0.5')
  await pf.quit()
})
