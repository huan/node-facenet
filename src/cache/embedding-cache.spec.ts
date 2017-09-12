#!/usr/bin/env ts-node
import * as fs            from 'fs'
import { promisify }      from 'util'

const t                   = require('tap')  // tslint:disable:no-shadowed-variable

import * as sinon         from 'sinon'
const sinonTest           = require('sinon-test')(sinon)

import * as nj            from 'numjs'

import {
  fixtureImageData3x3,
}                   from '../../tests/fixtures/'
import {
  Facenet,
}                   from '../facenet'
import {
  Face,
}                   from '../face'

import {
  EmbeddingCache,
}                   from './embedding-cache'

const TMP_PREFIX = '/tmp/facenet-embedding-cache-test-'

t.test('Create workdir by init()', async (t: any) => {
  const facenet = new Facenet()

  const workDir = TMP_PREFIX + process.pid
  // console.log(workDir)
  try {
    const embeddingCache = new EmbeddingCache(facenet, workDir)
    await embeddingCache.init()

    t.ok(fs.lstatSync(workDir).isDirectory(), 'should create directory by constructor')
  } catch (e) {
    t.fail(e)
  } finally {
    await facenet.quit()
  }
})

t.test('Cache', sinonTest(async function (t: any) {
  const EXPECTED_EMBEDDING = nj.arange(128)

  const embeddingStub = sinon.stub(
    Facenet.prototype,
    'embedding',
  )
  // embeddingStub.returns(Promise.resolve(EXPECTED_EMBEDDING))
  embeddingStub.callsFake(() => {
    // console.log('fake')
    return Promise.resolve(EXPECTED_EMBEDDING)
  })

  const hitSpy = sinon.spy()
  const missSpy = sinon.spy()

  const workDir        = await promisify(fs.mkdtemp)(TMP_PREFIX)

  const facenet        = new Facenet()
  const embeddingCache = new EmbeddingCache(facenet, workDir)

  await embeddingCache.init()

  embeddingCache.on('hit', hitSpy)
  embeddingCache.on('miss', missSpy)

  t.test('miss', async (t: any) => {
    const face = new Face(fixtureImageData3x3())

    embeddingStub.resetHistory()
    hitSpy.reset()
    missSpy.reset()

    face.embedding = await embeddingCache.embedding(face)

    t.ok(embeddingStub.calledOnce, 'should call embedding() at 1st time')
    t.ok(hitSpy.notCalled, 'should hit none')
    t.ok(missSpy.calledOnce, 'should miss once')
    t.deepEqual(face.embedding.tolist(), EXPECTED_EMBEDDING.tolist(), 'should be equal to embedding data')
  })

  t.test('hit', async (t: any) => {
    const face = new Face(fixtureImageData3x3())

    embeddingStub.resetHistory()
    hitSpy.reset()
    missSpy.reset()

    face.embedding = await embeddingCache.embedding(face)

    t.ok(embeddingStub.notCalled, 'should not call embedding() at 2nd time for a same face(md5)')
    t.ok(hitSpy.calledOnce, 'should hit once')
    t.ok(missSpy.notCalled, 'should miss none')
    t.deepEqual(face.embedding.tolist(), EXPECTED_EMBEDDING.tolist(), 'should be equal to embedding data')
  })

  await facenet.quit()

}))
