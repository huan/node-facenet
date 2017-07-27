#!/usr/bin/env ts-node

import * as nj from 'numjs'
const { test } = require('tap')

import { Facenet } from './facenet'

test('Facenet', async (t: any) => {
  t.ok(Facenet, 'ok')
  t.pass('TODO')
  t.end()
})

test('distance()', (t: any) => {
  const f = new Facenet()

  const a = nj.array([0, 3])
  const b = nj.array([4, 0])
  const c = f.distance(a, b)
  t.equal(c, 5, 'should get 5 for triangle 3&4&5')
})
