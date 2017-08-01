#!/usr/bin/env ts-node
const t = require('tap')  // tslint:disable:no-shadowed-variable

import { pythonBridge }   from 'python-bridge'

import { PythonFacenet }  from '../'

t.test('tensorflow smoke testing', async (t: any) => {
  const pf = new PythonFacenet()
  pf.initVenv()

  const python = pythonBridge({
    python: 'python3',
  })

  try {
    await python.ex`
      import tensorflow as tf

      sess = tf.Session()
      a = tf.constant(5.0)
      b = tf.constant(6.0)
      c = a * b
    `
    // http://ellisvalentiner.com/post/2016-01-20-numpyfloat64-is-json-serializable-but-numpyfloat32-is-not/
    const c = await python`1.0 * sess.run(c)`
    t.equal(c, 30, 'should get 5 * 6 = 30')
    await python.ex`sess.close()`

  } catch (e) {
    t.fail(e.message)
  } finally {
    try {
      await python.end()
    } catch (e) {
      t.fail(e)
    }
    await pf.quit()
  }
})
