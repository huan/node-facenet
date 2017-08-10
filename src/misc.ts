import * as crypto  from 'crypto'

export function md5(ndarray: nj.NdArray<any>): string {
  // https://github.com/nicolaspanel/numjs/blob/master/src/ndarray.js#L24
  const data = (ndarray as any).selection.data as Uint8Array
  const buf = new Buffer(data.buffer)
  return crypto
          .createHash('md5')
          .update(buf)
          // .update(new Buffer(ndarray.tolist()))
          .digest('hex')
}
