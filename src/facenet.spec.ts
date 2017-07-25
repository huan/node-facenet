#!/usr/bin/env ts-node

const { test } = require('tap')

import { Facenet } from './facenet'

test('Facenet', async (t: any) => {
  t.ok(Facenet, 'ok')
  t.pass('TODO')
  t.end()
})
