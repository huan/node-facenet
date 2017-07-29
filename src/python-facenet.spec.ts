#!/usr/bin/env ts-node

const t = require('tap')  // tslint:disable:no-shadowed-variable

import { PythonFacenet } from './python-facenet'

t.test('PythonFacenet smoke testing', { timeout: 60 * 1000 }, async (t: any) => {
  const pf = new PythonFacenet()
  await pf.init()
  await pf.quit()
  t.pass('should init() successful then quit()')
})
