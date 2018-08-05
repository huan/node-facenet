#!/usr/bin/env ts-node
import * as fs            from 'fs'

// tslint:disable:no-shadowed-variable
import * as test          from 'blue-tape'

import * as sinon         from 'sinon'
// const sinonTest           = require('sinon-test')(sinon)

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

test('Create workdir by init()', async t => {
  const facenet = new Facenet()

  const workdir = TMP_PREFIX + process.pid
  // console.log(workdir)
  try {
    const embeddingCache = new EmbeddingCache(facenet, workdir)
    await embeddingCache.init()

    t.ok(fs.lstatSync(workdir).isDirectory(), 'should create directory by constructor')
  } catch (e) {
    t.fail(e)
  } finally {
    await facenet.quit()
  }
})

// test.only('Cache', sinonTest(async function (t: test.Test) {
test('Cache', async t => {
  const EXPECTED_EMBEDDING = nj.arange(128)

  const sandbox = sinon.createSandbox()

  const embeddingStub = sandbox.stub(
    Facenet.prototype,
    'embedding',
  )
  // embeddingStub.returns(Promise.resolve(EXPECTED_EMBEDDING))
  embeddingStub.callsFake(() => {
    // console.log('fake')
    return Promise.resolve(EXPECTED_EMBEDDING)
  })

  const hitSpy  = sandbox.spy()
  const missSpy = sandbox.spy()

  const workdir        = fs.mkdtempSync(TMP_PREFIX)

  const facenet        = new Facenet()
  const embeddingCache = new EmbeddingCache(facenet, workdir)

  await embeddingCache.init()

  embeddingCache.on('hit', hitSpy)
  embeddingCache.on('miss', missSpy)

  t.test('miss', async t => {
    const face = new Face(fixtureImageData3x3())
    await face.init()

    embeddingStub.resetHistory()
    hitSpy.resetHistory()
    missSpy.resetHistory()

    face.embedding = await embeddingCache.embedding(face)

    t.ok(embeddingStub.calledOnce, 'should call embedding() at 1st time')
    t.ok(hitSpy.notCalled, 'should hit none')
    t.ok(missSpy.calledOnce, 'should miss once')
    t.deepEqual(face.embedding.tolist(), EXPECTED_EMBEDDING.tolist(), 'should be equal to embedding data')
  })

  t.test('hit', async t => {
    const face = new Face(fixtureImageData3x3())
    await face.init()

    embeddingStub.resetHistory()
    hitSpy.resetHistory()
    missSpy.resetHistory()

    face.embedding = await embeddingCache.embedding(face)

    t.ok(embeddingStub.notCalled, 'should not call embedding() at 2nd time for a same face(md5)')
    t.ok(hitSpy.calledOnce, 'should hit once')
    t.ok(missSpy.notCalled, 'should miss none')
    t.deepEqual(face.embedding.tolist(), EXPECTED_EMBEDDING.tolist(), 'should be equal to embedding data')
  })

  await facenet.quit()
  sandbox.restore()
})
