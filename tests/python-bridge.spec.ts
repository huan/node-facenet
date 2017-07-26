#!/usr/bin/env ts-node

const { test } = require('tap')

import { pythonBridge } from 'python-bridge'

test('python 3 version test', async (t: any) => {
  const python = pythonBridge({
    python: 'python3',
    env: {
      TF_CPP_MIN_LOG_LEVEL: '2',  // suppress tensorflow warnings
    },
  })

  try {
    await python.ex`import sys`
    const [major, minor] = await python`sys.version_info`
    t.ok(major >= 3, 'should be at least v3')
    t.ok(minor >= 5, 'should be at least v3.5')
  } catch (e) {
    t.fail(e.message)
  } finally {
    python.end()
    t.end()
  }
})

test('math test', async (t: any) => {
  const python = pythonBridge({
    env: {
      TF_CPP_MIN_LOG_LEVEL: '2',  // suppress tensorflow warnings
    },
  })

  try {
    await python.ex`import math`
    const three = await python`math.sqrt(9)`
    t.equal(three, 3, 'should get 3 from math.sqrt(9)')
  } catch (e) {
    t.fail(e.message)
  } finally {
    python.end()
    t.end()
  }
})

test('list test', async (t: any) => {
  const python = pythonBridge({
    env: {
      TF_CPP_MIN_LOG_LEVEL: '2',  // suppress tensorflow warnings
    },
  })

  const list = [3, 4, 2, 1]
  try {
    const sortedList = await python`sorted(${list})`
    t.deepEqual(sortedList, list.sort(), 'should get sorted list from python')
  } catch (e) {
    t.fail(e.message)
  } finally {
    python.end()
    t.end()
  }
})

export {}
