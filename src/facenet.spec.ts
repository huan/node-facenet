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
