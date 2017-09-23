#!/usr/bin/env ts-node
import * as fs    from 'fs'
import * as os    from 'os'
import * as path  from 'path'

import * as test  from 'blue-tape'  // tslint:disable:no-shadowed-variable

import { DbCache }  from './db-cache'

test('Smoke testing', async t => {
  const tmp = fs.mkdtempSync(os.tmpdir() + path.sep)
  const db = new DbCache(tmp)
  t.ok(db, 'should be instanciated')
})

test('get()/put()/list()', async t => {
  const tmp = fs.mkdtempSync(os.tmpdir() + path.sep)
  const db = new DbCache(tmp)

  const KEY = 'key'
  const VAL = 'val'

  t.test('list()', async t => {
    const list = await db.list()
    const count = await db.count()
    t.equal(Object.keys(list).length, 0, 'should get list length 0 when empty')
    t.equal(count, 0, 'should get list length 0 when empty')
  })

  t.test('put()', async t => {
    await db.put(KEY, VAL)
    const val = await db.get(KEY)
    t.equal(val, VAL, 'should get val back')
  })

  t.test('count()', async t => {
    const count = await db.count()
    t.equal(count, 1, 'should get count 1 after put')
  })

  t.test('list()', async t => {
    const list = await db.list()
    t.equal(Object.keys(list).length, 1, 'should get list length 1 after put')
    t.equal(list[KEY], VAL, 'should get KEY/VAL in returned list')
  })
})
