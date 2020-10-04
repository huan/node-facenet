#!/usr/bin/env ts-node

import fs    from 'fs'
import path  from 'path'
import test  from 'blue-tape'  // tslint:disable:no-shadowed-variable

import {
  MODULE_ROOT,
  parentDirectory,
}                   from './config'

test('parentDirectory()', async t => {
  const packageFile = path.join(MODULE_ROOT, 'package.json')
  t.ok(fs.existsSync(packageFile), 'should see package.json')

  const parentDir = parentDirectory()
  t.ok(parentDir)

  if (__filename.endsWith('.ts')) {
    t.notEqual(parentDir, 'dist', 'should not inside dist folder when development as TypeScript')
  } else if (__filename.endsWith('.js')) {
    t.equal(parentDir, 'dist', 'should inside dist folder when compiled to .js')
  } else {
    // eslint-disable-next-line no-path-concat
    t.fail('unknowned file extension: ' + __filename)
  }
})
