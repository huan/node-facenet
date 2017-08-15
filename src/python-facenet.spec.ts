#!/usr/bin/env ts-node
import * as path          from 'path'

const t             = require('tap')  // tslint:disable:no-shadowed-variable
const { loadImage } = require('canvas')
import * as nj            from 'numjs'

import { PythonFacenet }  from './python-facenet'

t.test('PythonFacenet python venv', async (t: any) => {
  const pf = new PythonFacenet()
  t.ok(pf, 'should be instanciated')

  const VIRTUAL_ENV = path.normalize(`${__dirname}/../python3`)
  t.equal(process.env['VIRTUAL_ENV'], VIRTUAL_ENV,              'should set VIRTUAL_ENV right')
  t.ok((process.env['PATH'] as string).startsWith(VIRTUAL_ENV), 'should set PATH right')
  t.notOk(process.env['PYTHONHOME'],                            'should have no PYTHONHOME')

  pf.quit()
})

// t.test('JSON bridge', async (t: any) => {
//   const DATA1 = [[1, 2], [3, 4], [5, 6]]
//   const DATA2 = {
//     a: [[1, 2], [3, 4], [5, 6]],
//     b: 'test',
//   }
//   const DATA3 = [[[254, 0, 0], [0, 255, 1], [0, 0, 254]], [[0, 0, 0], [255, 254, 252], [127, 127, 127]]]

//   const pf = new PythonFacenet()

//   const ret1 = await pf.json_parse(JSON.stringify(DATA1))
//   t.deepEqual(ret1, DATA1, 'should be equal after processed by python bridge #1')
//   const ret2 = await pf.json_parse(JSON.stringify(DATA2))
//   t.deepEqual(ret2, DATA2, 'should be equal after processed by python bridge #2')
//   const ret3 = await pf.json_parse(JSON.stringify(DATA3))
//   t.deepEqual(ret3, DATA3, 'should be equal after processed by python bridge #3')

//   pf.quit()
// })

t.test('Base64 bridge', async (t: any) => {
  const IMAGE_RGB_DATA = [
    [
      [254, 0, 0],
      [0, 255, 1],
      [0, 0, 254],
    ],
    [
      [0, 0, 0],
      [255, 254, 252],
      [127, 127, 127],
    ],
  ]

  const pf = new PythonFacenet()

  try {
    const row = IMAGE_RGB_DATA.length
    const col = IMAGE_RGB_DATA[0].length
    const depth = IMAGE_RGB_DATA[0][0].length

    const flattenData = nj.array(IMAGE_RGB_DATA).flatten().tolist() as number[]

    const typedData = new Uint8Array(flattenData)
    const base64Text = new Buffer(typedData).toString('base64')

    const ret = await pf.base64_to_image(base64Text, row, col, depth)
    t.deepEqual(ret, IMAGE_RGB_DATA, 'should be equal after processed by python base64 bridge')
  } catch (e) {
    t.fail(e)
  } finally {
    pf.quit()
  }
})

t.test('align()', async (t: any) => {
  const pf = new PythonFacenet()
  const IMAGE_FILE = path.resolve(__dirname, '../tests/fixtures/two-faces.jpg')

  try {
    await pf.initMtcnn()
    const image = await loadImage(IMAGE_FILE)

    const [boundingBoxes, landmarks] = await pf.align(image)
    const numFaces = boundingBoxes.length
    const numMarks = landmarks.length
    const confidence = boundingBoxes[0][4]

    t.equal(numFaces, 2, 'should get two faces')
    t.equal(numMarks, 10, 'should get 10 point of marks')
    t.ok(confidence > 0 && confidence < 1, 'shoud get confidencee between 0 to 1')
  } catch (e) {
    t.fail(e)
  } finally {
    await pf.quit()
  }
})

t.test('embedding()', async (t: any) => {
  const pf = new PythonFacenet()

  try {
    await pf.initFacenet()

    const IMAGE_FILE = path.resolve(__dirname, '../tests/fixtures/aligned-face.png')
    const image = await loadImage(IMAGE_FILE)

    const embedding = await pf.embedding(image)

    t.equal(embedding.length, 128, 'should get 128 dim embedding')
    const valid = embedding
                  .map(i => i > -0.5 && i < 0.5)
                  .reduce((total, cur) => total && cur, true)
    t.ok(valid, 'should get vector normalized between -0.5 to 0.5')
  } catch (e) {
    t.fail(e)
  } finally {
    await pf.quit()
  }
})
