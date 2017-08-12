import * as crypto  from 'crypto'
import * as ndarray from 'ndarray'

// TODO: use ndarray instead of nj.NdArray
export function md5(array: nj.NdArray<any>): string {
  // https://github.com/nicolaspanel/numjs/blob/master/src/ndarray.js#L24
  const data = (array as any).selection.data as Uint8Array
  const buf = new Buffer(data.buffer)
  return crypto
          .createHash('md5')
          .update(buf)
          // .update(new Buffer(ndarray.tolist()))
          .digest('hex')
}

export function bufResizeUint8ClampedRGBA(array: ndarray): ndarray {
  const buf = new Uint8ClampedArray(array.shape[0] * array.shape[1] * 4)
  const newArray = ndarray(buf, array.shape)
  for (let i = 0; i < array.shape[0]; i++) {
    for (let j = 0; j < array.shape[1]; j++) {
      for (let k = 0; k < 4; k++) {
        newArray.set(i, j, k, array.get(i, j, k))
      }
    }
  }
  return newArray
}
