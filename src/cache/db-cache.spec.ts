#!/usr/bin/env ts-node
import * as fs    from 'fs'
import * as os    from 'os'
import * as path  from 'path'

const { test } = require('tap')

import { DbCache }  from './db-cache'

test('Smoke testing', async (t: any) => {
  const tmp = fs.mkdtempSync(os.tmpdir() + path.sep)
  const db = new DbCache(tmp)
  t.ok(db, 'should be instanciated')
})

test('get()/put()/list()', async (t: any) => {
  const tmp = fs.mkdtempSync(os.tmpdir() + path.sep)
  const db = new DbCache(tmp)

  let list = await db.list()
  let count = await db.count()
  t.equal(Object.keys(list).length, 0, 'should get list length 0 when empty')
  t.equal(count, 0, 'should get list length 0 when empty')

  const KEY = 'key'
  const VAL = 'val'
  await db.put(KEY, VAL)
  const val = await db.get(KEY)
  t.equal(val, VAL, 'should get val back')

  count = await db.count()
  t.equal(count, 1, 'should get count 1 after put')

  list = await db.list()
  t.equal(Object.keys(list).length, 1, 'should get list length 1 after put')
  t.equal(list[KEY], VAL, 'should get KEY/VAL in returned list')
})
