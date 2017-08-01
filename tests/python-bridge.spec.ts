#!/usr/bin/env ts-node

const t = require('tap') // tslint:disable:no-shadowed-variable

import { pythonBridge } from 'python-bridge'

t.test('python 3 version test', async (t: any) => {
  const python = pythonBridge({
    python: 'python3',
  })

  try {
    await python.ex`import sys`
    const [major, minor] = await python`sys.version_info`
    t.ok(major >= 3, 'should be at least v3')
    console.log('minor version = ' + minor)
    t.ok(minor >= 5, 'should get minor version >= 5')
  } catch (e) {
    t.fail(e.message)
  } finally {
    await python.end()
  }
})

t.test('math test', async (t: any) => {
  const python = pythonBridge()

  try {
    await python.ex`import math`
    const three = await python`math.sqrt(9)`
    t.equal(three, 3, 'should get 3 from math.sqrt(9)')
  } catch (e) {
    t.fail(e.message)
  } finally {
    await python.end()
  }
})

t.test('list test', async (t: any) => {
  const python = pythonBridge()

  const list = [3, 4, 2, 1]
  try {
    const sortedList = await python`sorted(${list})`
    t.deepEqual(sortedList, list.sort(), 'should get sorted list from python')
  } catch (e) {
    t.fail(e.message)
  } finally {
    await python.end()
  }
})

export {}
