#!/usr/bin/env tap

const { test } = require('tap')

const pythonBridge = require('python-bridge')

test('math test', async (t: any) => {
  const python = pythonBridge()

  await python.ex`import math`
  const three = await python`math.sqrt(9)`
  t.equal(three, 3, 'should get 3 from math.sqrt(9)')

  python.end()
  t.end()
})

test('list test', async (t: any) => {
  const python = pythonBridge()

  const list = [3, 4, 2, 1]
  const sortedList = await python`sorted(${list})`
  t.deepEqual(sortedList, list.sort(), 'should get sorted list from python')

  python.end()
  t.end()
})
