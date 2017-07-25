#!/usr/bin/env ts-node

const { test } = require('tap')

import { PythonFacenet } from './python-facenet'

test('PythonFacenet smoke testing', async (t: any) => {
  const pf = new PythonFacenet()
  await pf.init()
  t.pass('should init successful')
  await pf.quit()
})
