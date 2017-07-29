#!/usr/bin/env ts-node

const t = require('tap')  // tslint:disable:no-shadowed-variable

import { PythonFacenet } from './python-facenet'

t.test('PythonFacenet smoke testing', { timeout: 60 * 1000 }, async (t: any) => {
  const pf = new PythonFacenet()
  await pf.init()
  await pf.quit()
  t.pass('should init() successful then quit()')
})

t.only('JSON bridge', async (t: any) => {
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
