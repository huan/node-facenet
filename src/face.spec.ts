#!/usr/bin/env ts-node

const { test } = require('tap')

import { Face }   from './face'

test('Face smoke testing', async (t: any) => {
  const f = new Face()
  t.ok(f, 'should be instanciated')
})

export {}
