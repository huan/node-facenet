#!/usr/bin/env ts-node

import { Facenet } from './facenet'

const { test } = require('tap')

test('facenet', async (t: any) => {
  t.ok(Facenet, 'ok')
  t.pass('TODO')
  t.end()
})

// 'Cannot redeclare block-scoped variable' in unrelated files
// https://stackoverflow.com/a/41975448/1123955
export {}
