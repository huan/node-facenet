# Facenet v0.3.19 Documentation

## Classes

<dl>
<dt><a href="#Face">Face</a></dt>
<dd></dd>
<dt><a href="#Facenet">Facenet</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#FaceJsonObject">FaceJsonObject</a></dt>
<dd><p>FaceJsonObject Type</p>
</dd>
</dl>

<a name="Face"></a>

## Face
**Kind**: global class  

* [Face](#Face)
    * [new Face([imageData])](#new_Face_new)
    * _instance_
        * [.embedding](#Face+embedding) : <code>FaceEmbedding</code> \| <code>undefined</code>
        * [.embedding](#Face+embedding)
        * [.center](#Face+center) : <code>Point</code>
        * [.width](#Face+width) : <code>number</code>
        * [.height](#Face+height) : <code>number</code>
        * [.depth](#Face+depth) : <code>number</code>
        * [.init([options])](#Face+init) ⇒ <code>Promise.&lt;this&gt;</code>
        * [.toJSON()](#Face+toJSON) ⇒ [<code>FaceJsonObject</code>](#FaceJsonObject)
        * [.distance(face)](#Face+distance) ⇒ <code>number</code>
        * [.save(file)](#Face+save) ⇒ <code>Promise.&lt;void&gt;</code>
    * _static_
        * [.fromJSON(obj)](#Face.fromJSON) ⇒ [<code>Face</code>](#Face)

<a name="new_Face_new"></a>

### new Face([imageData])
Creates an instance of Face.


| Param | Type |
| --- | --- |
| [imageData] | <code>ImageData</code> | 

<a name="Face+embedding"></a>

### face.embedding : <code>FaceEmbedding</code> \| <code>undefined</code>
Embedding the face, FaceEmbedding is 128 dim

**Kind**: instance property of [<code>Face</code>](#Face)  
<a name="Face+embedding"></a>

### face.embedding
Set embedding for a face

**Kind**: instance property of [<code>Face</code>](#Face)  
<a name="Face+center"></a>

### face.center : <code>Point</code>
Get center point for the location

**Kind**: instance property of [<code>Face</code>](#Face)  
**Example**  
```js
const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
const faceList = await facenet.align(imageFile)
console.log('face center : ', faceList[0].center)
// Output: center:  { x: 475, y: 209 }
```
<a name="Face+width"></a>

### face.width : <code>number</code>
Get width for the imageData

**Kind**: instance property of [<code>Face</code>](#Face)  
**Example**  
```js
const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
const faceList = await facenet.align(imageFile)
console.log('face width : ', faceList[0].width)
// Output: width:  230
```
<a name="Face+height"></a>

### face.height : <code>number</code>
Get height for the imageData

**Kind**: instance property of [<code>Face</code>](#Face)  
**Example**  
```js
const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
const faceList = await facenet.align(imageFile)
console.log('face height : ', faceList[0].height)
// Output: height:  230
```
<a name="Face+depth"></a>

### face.depth : <code>number</code>
Get depth for the imageData:   length/width/height

**Kind**: instance property of [<code>Face</code>](#Face)  
<a name="Face+init"></a>

### face.init([options]) ⇒ <code>Promise.&lt;this&gt;</code>
Init a face

**Kind**: instance method of [<code>Face</code>](#Face)  

| Param | Type | Default |
| --- | --- | --- |
| [options] | <code>FaceOptions</code> | <code>{}</code> | 

<a name="Face+toJSON"></a>

### face.toJSON() ⇒ [<code>FaceJsonObject</code>](#FaceJsonObject)
Get Face Json format data

**Kind**: instance method of [<code>Face</code>](#Face)  
<a name="Face+distance"></a>

### face.distance(face) ⇒ <code>number</code>
Get the two face's distance, the smaller the number is, the similar of the two face

**Kind**: instance method of [<code>Face</code>](#Face)  

| Param | Type |
| --- | --- |
| face | [<code>Face</code>](#Face) | 

**Example**  
```js
const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
const faceList = await facenet.align(imageFile)
faceList[0].embedding = await facenet.embedding(faceList[0])
faceList[1].embedding = await facenet.embedding(faceList[1])
console.log('distance between the different face: ', faceList[0].distance(faceList[1]))
console.log('distance between the same face:      ', faceList[0].distance(faceList[0]))
```
<a name="Face+save"></a>

### face.save(file) ⇒ <code>Promise.&lt;void&gt;</code>
Save the face to the file

**Kind**: instance method of [<code>Face</code>](#Face)  
**Returns**: <code>Promise.&lt;void&gt;</code> - const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
const faceList = await facenet.align(imageFile)
faceList[0].save('womenFace.jpg')
// You can see it save the women face from `two-faces` pic to `womenFace.jpg`  

| Param | Type |
| --- | --- |
| file | <code>string</code> | 

<a name="Face.fromJSON"></a>

### Face.fromJSON(obj) ⇒ [<code>Face</code>](#Face)
**Kind**: static method of [<code>Face</code>](#Face)  

| Param | Type |
| --- | --- |
| obj | [<code>FaceJsonObject</code>](#FaceJsonObject) \| <code>string</code> | 

<a name="Facenet"></a>

## Facenet
**Kind**: global class  

* [Facenet](#Facenet)
    * [new Facenet()](#new_Facenet_new)
    * [.init()](#Facenet+init) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.quit()](#Facenet+quit) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.align(imageData)](#Facenet+align) ⇒ <code>Promise.&lt;Array.&lt;Face&gt;&gt;</code>
    * [.embedding(face)](#Facenet+embedding) ⇒ <code>Promise.&lt;FaceEmbedding&gt;</code>
    * [.distance(face, faceList)](#Facenet+distance) ⇒ <code>Array.&lt;number&gt;</code>

<a name="new_Facenet_new"></a>

### new Facenet()
Facenet is designed for bring the state-of-art neural network with bleeding-edge technology to full stack developers
Neural Network && pre-trained model && easy to use APIs

<a name="Facenet+init"></a>

### facenet.init() ⇒ <code>Promise.&lt;void&gt;</code>
Init facenet

**Kind**: instance method of [<code>Facenet</code>](#Facenet)  
<a name="Facenet+quit"></a>

### facenet.quit() ⇒ <code>Promise.&lt;void&gt;</code>
Quit facenet

**Kind**: instance method of [<code>Facenet</code>](#Facenet)  
<a name="Facenet+align"></a>

### facenet.align(imageData) ⇒ <code>Promise.&lt;Array.&lt;Face&gt;&gt;</code>
Do face alignment for the image, return a list of faces.

**Kind**: instance method of [<code>Facenet</code>](#Facenet)  
**Returns**: <code>Promise.&lt;Array.&lt;Face&gt;&gt;</code> - - a list of faces  

| Param | Type |
| --- | --- |
| imageData | <code>ImageData</code> \| <code>string</code> | 

**Example**  
```js
const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
const faceList = await facenet.align(imageFile)
console.log(faceList)
// Output
// [ Face {
//     id: 0,
//     imageData: ImageData { data: [Object] },
//     confidence: 0.9999634027481079,
//     landmark:
//      { leftEye: [Object],
//        rightEye: [Object],
//        nose: [Object],
//        leftMouthCorner: [Object],
//        rightMouthCorner: [Object] },
//      location: { x: 360, y: 94, w: 230, h: 230 },
//      md5: '003c926dd9d2368a86e41a2938aacc98' },
//   Face {
//     id: 1,
//     imageData: ImageData { data: [Object] },
//     confidence: 0.9998626708984375,
//     landmark:
//      { leftEye: [Object],
//        rightEye: [Object],
//        nose: [Object],
//        leftMouthCorner: [Object],
//        rightMouthCorner: [Object] },
//     location: { x: 141, y: 87, w: 253, h: 253 },
//     md5: '0451a0737dd9e4315a21594c38bce485' } ]
// `leftEye: [Object]`,`rightEye: [Object]`,`nose: [Object]`,`leftMouthCorner: [Object]`,`rightMouthCorner: [Object]` Object is Point, something like `{ x: 441, y: 181 }`
// `imageData: ImageData { data: [Object] }` Object is Uint8ClampedArray
```
<a name="Facenet+embedding"></a>

### facenet.embedding(face) ⇒ <code>Promise.&lt;FaceEmbedding&gt;</code>
Calculate Face Embedding, get the 128 dims embeding from image(s)

**Kind**: instance method of [<code>Facenet</code>](#Facenet)  
**Returns**: <code>Promise.&lt;FaceEmbedding&gt;</code> - - return feature vector  

| Param | Type |
| --- | --- |
| face | [<code>Face</code>](#Face) | 

**Example**  
```js
const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
const faceList = await facenet.align(imageFile)
for (const face of faceList) {
  face.embedding = await facenet.embedding(face)
}
// Output, there are two faces in the picture, so return two 128 dims array
// array([ 0.03132, 0.05678, 0.06192, ..., 0.08909, 0.16793,-0.05703])
// array([ 0.03422,-0.08358, 0.03549, ..., 0.07108, 0.14013,-0.01417])
```
<a name="Facenet+distance"></a>

### facenet.distance(face, faceList) ⇒ <code>Array.&lt;number&gt;</code>
Get distance between a face an each face in the faceList.

**Kind**: instance method of [<code>Facenet</code>](#Facenet)  

| Param | Type |
| --- | --- |
| face | [<code>Face</code>](#Face) | 
| faceList | [<code>Array.&lt;Face&gt;</code>](#Face) | 

**Example**  
```js
const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
const faceList = await facenet.align(imageFile)
for (const face of faceList) {
face.embedding = await facenet.embedding(face)
}
const faceInFaceList = faceList[0]
const distance = facenet.distance(faceInFaceList, faceList)
console.log('distance:', distance)
// Output:
// distance: [ 0, 1.2971515811057608 ]
// The first face comes from the imageFile, the exactly same face, so the first result is 0.
```
<a name="FaceJsonObject"></a>

## FaceJsonObject
FaceJsonObject Type

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| confidence | <code>number</code> | The confidence to confirm is face |
| embedding | <code>Array.&lt;number&gt;</code> |  |
| imageData | <code>string</code> | Base64 of Buffer |
| landmark | <code>FacialLandmark</code> | Face landmark |
| location | <code>Rectangle</code> | Face location |
| md5 | <code>string</code> | Face md5 |

