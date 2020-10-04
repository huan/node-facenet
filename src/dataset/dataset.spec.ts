#!/usr/bin/env ts-node

import test  from 'blue-tape'  // tslint:disable:no-shadowed-variable

import {
  // log,
  MODULE_ROOT,
}                   from '../config'
// log.level('silly')

import { Dataset }  from './dataset'

const FIXTURE_DIRECTORY = `${MODULE_ROOT}/tests/fixtures/dataset`

class DatasetTest extends Dataset {

  public async setup (): Promise<void> {
    //
  }

}

test('Smoke testing', async t => {
  const d = new DatasetTest(FIXTURE_DIRECTORY, 'jpg')
  t.ok(d, 'should inited a Dataset instance')
})

test('idList()', async t => {
  const d = new DatasetTest(FIXTURE_DIRECTORY, 'jpg')
  const idList = await d.idList()

  t.equal(idList.length, 2, 'should get 2 ids')
  t.true(idList.includes('id1'), 'should contains id1')
  t.true(idList.includes('id2'), 'should contains id2')
})

test('imageList()', async t => {
  const d = new DatasetTest(FIXTURE_DIRECTORY, 'jpg')
  const imageList = await d.imageList()

  t.equal(imageList.length, 3, 'should get 3 images')
  t.true(imageList.includes('id1/image1.jpg'), 'should contains image1.jpg')
  t.true(imageList.includes('id2/image2.jpg'), 'should contains image2.jpg')
  t.true(imageList.includes('id2/image22.jpg'), 'should contains image22.jpg')
})

test('idImageList()', async t => {
  const d = new DatasetTest(FIXTURE_DIRECTORY, 'jpg')
  const idImageList = await d.idImageList()

  const idList = Object.keys(idImageList)
  t.equal(idList.length, 2, 'should get 2 ids')
  t.true(idList.includes('id1'), 'should contains id1')
  t.true(idList.includes('id2'), 'should contains id2')

  t.equal(idImageList['id1'].length, 1, 'should get 1 images for id1')
  t.true(idImageList['id1'].includes('image1.jpg'), 'should contains image1.jpg')

  t.equal(idImageList['id2'].length, 2, 'should get 2 images for id2')
  t.true(idImageList['id2'].includes('image2.jpg'), 'should contains image2.jpg')
  t.true(idImageList['id2'].includes('image22.jpg'), 'should contains image22.jpg')
})
