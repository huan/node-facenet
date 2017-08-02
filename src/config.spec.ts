#!/usr/bin/env ts-node

import * as fs    from 'fs'
import * as path  from 'path'
const { test } = require('tap')

import {
  MODULE_ROOT,
  parentDirectory,
}                   from './config'

test('parentDirectory()', async (t: any) => {
  const packageFile = path.join(MODULE_ROOT, 'package.json')
  t.ok(fs.existsSync(packageFile), 'should see package.json')

  if (__filename.endsWith('.ts')) {
    t.notEqual(parentDirectory(), 'dist', 'should not inside dist folder when development as TypeScript')
  } else if (__filename.endsWith('.js')) {
    t.equal(parentDirectory(), 'dist', 'should inside dist folder when compiled to .js')
  } else {
    t.fail('unknowned file extension: ' + __filename)
  }
})
