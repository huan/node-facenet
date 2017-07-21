#!/usr/bin/env ts-node

const { test } = require('tap')

import { PythonFacenet } from './python-facenet'

test('PythonFacenet', async (t: any) => {
  t.ok(PythonFacenet, 'ok')
  t.pass('TODO')
  t.end()
})

// 'Cannot redeclare block-scoped variable' in unrelated files
// https://stackoverflow.com/a/41975448/1123955
export {}
