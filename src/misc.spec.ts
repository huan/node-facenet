#!/usr/bin/env ts-node
const t = require('tap')  // tslint:disable:no-shadowed-variable

import * as nj            from 'numjs'

import { md5 }            from './misc'

t.test('md5()', async (t: any) => {
  const data = nj.array([1, 2, 3], 'uint8')
  const EXPECTED_MD5 = '5289df737df57326fcdd22597afb1fac'

  const md5Text = md5(data)
  console.log(md5Text)
  t.equal(md5Text, EXPECTED_MD5, 'should be equal')
})
