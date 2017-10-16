import * as nj              from 'numjs'

import {
  FaceEmbedding,
  log,
  Point,
  Rectangle,
}                           from './config'
import {
  createImageData,
  cropImage,
  distance,
  imageMd5,
  imageToData,
  loadImage,
  saveImage,
  toBuffer,
  toDataURL,
}                           from './misc'

export interface FacialLandmark {
  [idx: string]:    Point,
  leftEye:          Point,
  rightEye:         Point,
  nose:             Point,
  leftMouthCorner:  Point,
  rightMouthCorner: Point,
}

export interface FaceJsonObject {
  confidence? : number,
  embedding   : number[],
  imageData   : string,           // Base64 of Buffer
  landmark?   : FacialLandmark,
  location    : Rectangle,
  md5         : string,
}

export interface FaceOptions {
  boundingBox? : number[],    // [x0, y0, x1, y1]
  confidence?  : number,
  file?        : string,
  landmarks?   : number[][],  // Facial Landmark
  md5?         : string,      // for fromJSON fast init
}

export class Face {
  public static id = 0
  public id: number

  /**
   *
   * Get Face md5
   * @type {string}
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * console.log('face md5: ', faceList[0].md5)
   * // Output md5: 003c926dd9d2368a86e41a2938aacc98
   */
  public md5       : string

  /**
   *
   * Get Face imageData
   * @type {ImageData}
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * console.log('face imageData: ', faceList[0].imageData)
   * // Output, Base64 of Buffer
   * // imageData:  ImageData {
   * //   data:
   * //    Uint8ClampedArray [
   * //      81,
   * //      ... 211500 more items ] }
   */
  public imageData : ImageData

  /**
   *
   * Get Face location
   * @type {(Rectangle       | undefined)}
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * console.log('face location : ', faceList[0].location)
   * // Output location:  { x: 360, y: 94, w: 230, h: 230 }
   */
  public location   : Rectangle       | undefined

  /**
   *
   * Get Face confidence
   * @type {(number          | undefined)}
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * console.log('face confidence : ', faceList[0].confidence)
   * // Output confidence:  0.9999634027481079
   */
  public confidence : number          | undefined

  /**
   * @desc       FacialLandmark Type
   * @typedef    FacialLandmark
   * @property   { Point }  leftEye
   * @property   { Point }  rightEye
   * @property   { Point }  nose
   * @property   { Point }  leftMouthCorner
   * @property   { Point }  rightMouthCorner
   */

  /**
   *
   * Get Face landmark, containing rightEye, leftEye, nose, leftMouthCorner and rightMouthCorner
   * @type {(FacialLandmark  | undefined)}
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * console.log('face landmark : ', faceList[0].landmark)
   * // Output
   * // landmark:  { leftEye: { x: 441, y: 180 },
   * //   rightEye: { x: 515, y: 208 },
   * //   nose: { x: 459, y: 239 },
   * //   leftMouthCorner: { x: 417, y: 262 },
   * //   rightMouthCorner: { x: 482, y: 286 } }
   */
  public landmark   : FacialLandmark  | undefined

  private _embedding : FaceEmbedding

  /**
   * Creates an instance of Face.
   * @param {ImageData} [imageData]
   */
  constructor(
    imageData?: ImageData,
  ) {
    this.id = Face.id++

    log.verbose('Face', 'constructor(%dx%d) #%d',
                      imageData ? imageData.width  : 0,
                      imageData ? imageData.height : 0,
                      this.id,
              )
    if (imageData) {
      this.imageData = imageData
    }
  }

  /**
   *
   * Init a face
   * @param {FaceOptions} [options={}]
   * @returns {Promise<this>}
   */
  public async init(options: FaceOptions = {}): Promise<this> {
    if (options.file) {
      if (this.imageData) {
        throw new Error('constructor(imageData) or init({file}) can not be both specified at same time!')
      }
      this.imageData = await this.initFile(options.file)
    }
    return this.initSync(options)
  }

  /**
   * @private
   */
  public initSync(options: FaceOptions = {}): this {
    log.verbose('Face', 'init()')

    if (!this.imageData) {
      throw new Error('initSync() must be called after imageData set')
    }

    if (options.confidence) {
      this.confidence   = options.confidence
    }

    if (options.landmarks) {
      this.landmark = this.initLandmarks(options.landmarks)
    }

    if (!this.imageData) {
      throw new Error('no image data!')
    }

    if (options.boundingBox) {
      this.location  = this.initBoundingBox(options.boundingBox)
      this.imageData = this.updateImageData(this.imageData)
    } else {
      this.location = this.initBoundingBox([0, 0, this.imageData.width, this.imageData.height])
    }

    if (options.md5) {
      this.md5 = options.md5
    } else {  // update md5
      this.md5 = imageMd5(this.imageData)
    }

    return this
  }

  /**
   * @private
   */
  private initLandmarks(marks: number[][]): FacialLandmark {
    log.verbose('Face', 'initLandmarks([%s]) #%d',
                        marks, this.id,
                )

    const leftEye: Point = {
      x: Math.round(marks[0][0]),
      y: Math.round(marks[0][1]),
    }
    const rightEye: Point = {
      x: Math.round(marks[1][0]),
      y: Math.round(marks[1][1]),
    }
    const nose: Point = {
      x: Math.round(marks[2][0]),
      y: Math.round(marks[2][1]),
    }
    const leftMouthCorner: Point = {
      x: Math.round(marks[3][0]),
      y: Math.round(marks[3][1]),
    }
    const rightMouthCorner: Point = {
      x: Math.round(marks[4][0]),
      y: Math.round(marks[4][1]),
    }

    return {
      leftEye,
      rightEye,
      nose,
      leftMouthCorner,
      rightMouthCorner,
    }
  }

  /**
   * @private
   */
  private async initFile(file: string): Promise<ImageData> {
    log.verbose('Face', 'initFilename(%s) #%d',
                        file, this.id,
              )

    const image = await loadImage(file)
    const imageData = imageToData(image)
    return imageData
  }

  /**
   * @private
   */
  private initBoundingBox(boundingBox: number[]): Rectangle {
    log.verbose('Face', 'initBoundingBox([%s]) #%d',
                      boundingBox, this.id,
              )

    if (!this.imageData) {
      throw new Error('no imageData!')
    }

    return {
      x: boundingBox[0],
      y: boundingBox[1],
      w: boundingBox[2] - boundingBox[0],
      h: boundingBox[3] - boundingBox[1],
    }
  }

  /**
   * @private
   */
  private updateImageData(imageData: ImageData): ImageData {
    if (!this.location) {
      throw new Error('no location!')
    }

    if (   this.location.w === imageData.width
        && this.location.h === imageData.height
    ) {
      return imageData
    }

    // need to corp and reset this.data
    log.verbose('Face', 'initBoundingBox() box.w=%d, box.h=%d; image.w=%d, image.h=%d',
                      this.location.w,
                      this.location.h,
                      imageData.width,
                      imageData.height,
              )
    const croppedImage = cropImage(
      imageData,
      this.location.x,
      this.location.y,
      this.location.w,
      this.location.h,
    )

    return croppedImage
  }

  /**
   * @private
   */
  public toString(): string {
    return `Face#${this.id}@${this.md5}`
  }

  /**
   * @desc       FaceJsonObject Type
   * @typedef    FaceJsonObject
   * @property   { number }         confidence - The confidence to confirm is face
   * @property   { number[] }       embedding
   * @property   { string }         imageData  - Base64 of Buffer
   * @property   { FacialLandmark } landmark   - Face landmark
   * @property   { Rectangle }      location   - Face location
   * @property   { string }         md5        - Face md5
   */

  /**
   * Get Face Json format data
   *
   * @returns {FaceJsonObject}
   */
  public toJSON(): FaceJsonObject {
    const imageData = this.imageData
    const location = this.location

    if (!imageData) {
      throw new Error('no image data')
    }
    if (!location) {
      throw new Error('no location')
    }

    const {
      confidence,
      embedding,
      landmark,
      md5,
    } = this

    const embeddingArray  = embedding ? embedding.tolist() : []
    const imageDataBase64 = Buffer.from(imageData.data.buffer as ArrayBuffer)
                                  .toString('base64')

    const obj = {
      confidence,
      embedding: embeddingArray,  // turn nj.NdArray to javascript array
      imageData: imageDataBase64,
      landmark,
      location,
      md5,
    }

    return obj
  }

  /**
   *
   * @static
   * @param {(FaceJsonObject | string)} obj
   * @returns {Face}
   */
  public static fromJSON(obj: FaceJsonObject | string): Face {
    log.verbose('Face', 'fromJSON(%s)', typeof obj)

    if (typeof obj === 'string') {
      log.silly('Face', 'fromJSON() JSON.parse(obj)')
      obj = JSON.parse(obj) as FaceJsonObject
    }

    const buffer    = Buffer.from(obj.imageData, 'base64')
    const array     = new Uint8ClampedArray(buffer)
    const location  = obj.location
    const imageData = createImageData(array, location.w, location.h)

    const face = new Face(imageData)

    const options = {} as FaceOptions

    options.boundingBox = [
      obj.location.x,
      obj.location.y,
      obj.location.x + obj.location.w,
      obj.location.y + obj.location.h,
    ]

    options.confidence = obj.confidence
    options.md5        = obj.md5

    if (obj.landmark) {
      const m = obj.landmark
      options.landmarks  = [
        [m.leftEye.x,   m.leftEye.y],
        [m.rightEye.x,  m.rightEye.y],
        [m.nose.x, m.nose.y],
        [m.leftMouthCorner.x,   m.leftMouthCorner.y],
        [m.rightMouthCorner.x,  m.rightMouthCorner.y],
      ]
    }

    face.initSync(options)

    if (obj.embedding && obj.embedding.length) {
      face.embedding =  nj.array(obj.embedding)
    } else {
      log.warn('Face', 'fromJSON() no embedding found for face %s#%s',
                        face.id, face.md5)
    }

    return face
  }

  /**
   *
   * Embedding the face, FaceEmbedding is 128 dim
   * @type {(FaceEmbedding | undefined)}
   * @memberof Face
   */
  public get embedding(): FaceEmbedding | undefined {
    // if (!this._embedding) {
    //   throw new Error('no embedding yet!')
    // }
    return this._embedding
  }

  /**
   *
   * Set embedding for a face
   */
  public set embedding(embedding: FaceEmbedding | undefined) {
    if (!embedding || !(embedding instanceof (nj as any).NdArray)) {
      throw new Error('must have a embedding(with type nj.NdArray)!')
    } else if (this._embedding) {
      throw new Error('already had embedding!')
    } else if (!embedding.shape) {
      throw new Error('embedding has no shape property!')
    } else if (embedding.shape[0] !== 128) {
      throw new Error('embedding dim is not 128! got: ' + embedding.shape[0])
    }
    this._embedding = embedding
  }

  /**
   * @desc       Point Type
   * @typedef    Point
   * @property   { number }  x
   * @property   { number }  y
   */

  /**
   *
   * Get center point for the location
   * @type {Point}
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * console.log('face center : ', faceList[0].center)
   * // Output: center:  { x: 475, y: 209 }
   */
  public get center(): Point {
    if (!this.location) {
      throw new Error('no location')
    }
    if (!this.imageData) {
      throw new Error('no imageData')
    }

    const x = Math.round(this.location.x + this.imageData.width  / 2)
    const y = Math.round(this.location.y + this.imageData.height / 2)
    return {x, y}
  }

  /**
   *
   * Get width for the imageData
   * @type {number}
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * console.log('face width : ', faceList[0].width)
   * // Output: width:  230
   */
  public get width(): number {
    if (!this.imageData) {
      throw new Error('no imageData')
    }
    return this.imageData.width
  }

  /**
   *
   * Get height for the imageData
   * @type {number}
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * console.log('face height : ', faceList[0].height)
   * // Output: height:  230
   */
  public get height(): number {
    if (!this.imageData) {
      throw new Error('no imageData')
    }
    return this.imageData.height
  }

  /**
   *
   * Get depth for the imageData:   length/width/height
   * @type {number}
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * console.log('face depth : ', faceList[0].depth)
   * // Output: depth:  4
   */
  public get depth(): number {
    if (!this.imageData) {
      throw new Error('no imageData')
    }
    return this.imageData.data.length
            / this.imageData.width
            / this.imageData.height
  }

  /**
   *
   * Get the two face's distance, the smaller the number is, the similar of the two face
   * @param {Face} face
   * @returns {number}
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * faceList[0].embedding = await facenet.embedding(faceList[0])
   * faceList[1].embedding = await facenet.embedding(faceList[1])
   * console.log('distance between the different face: ', faceList[0].distance(faceList[1]))
   * console.log('distance between the same face:      ', faceList[0].distance(faceList[0]))
   * // Output
   * // distance between the different face:  1.2971515811057608
   * // distance between the same face:       0
   * // faceList[0] is totally the same with faceList[0], so the number is 0
   * // faceList[1] is different with faceList[1], so the number is big.
   * // If the number is smaller than 0.75, maybe they are the same person.
   */
  public distance(face: Face): number {
    if (!this.embedding) {
      throw new Error(`sourceFace(${this.md5}).distance() source face no embedding!`)
    }
    if (!face.embedding) {
      throw new Error(`Face.distance(${face.md5}) target face no embedding!`)
    }
    const faceEmbeddingNdArray = face.embedding.reshape(1, -1) as nj.NdArray
    return distance(this.embedding, faceEmbeddingNdArray)[0]
  }

  /**
   * @private
   */
  public dataUrl(): string {
    if (!this.imageData) {
      throw new Error('no imageData')
    }
    return toDataURL(this.imageData)
  }

  /**
   * @private
   */
  public buffer(): Buffer {
    if (!this.imageData) {
      throw new Error('no imageData')
    }
    return toBuffer(this.imageData)
  }

  /**
   *
   * Save the face to the file
   * @param {string} file
   * @returns {Promise<void>}
   * @example
   * const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
   * const faceList = await facenet.align(imageFile)
   * faceList[0].save('womenFace.jpg')
   * // You can see it save the women face from `two-faces` pic to `womenFace.jpg`
   */
  public async save(file: string): Promise<void> {
    if (!this.imageData) {
      throw new Error('no imageData')
    }
    await saveImage(this.imageData, file)
  }
}
