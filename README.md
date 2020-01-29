# FACENET

[![Build Status](https://travis-ci.com/huan/node-facenet.svg?branch=master)](https://travis-ci.com/huan/node-facenet) [![NPM Version](https://badge.fury.io/js/facenet.svg)](https://badge.fury.io/js/facenet) [![Downloads](http://img.shields.io/npm/dm/facenet.svg?style=flat-square)](https://npmjs.org/package/facenet) [![Join the chat at https://gitter.im/node-facenet/Lobby](https://badges.gitter.im/node-facenet/Lobby.svg)](https://gitter.im/node-facenet/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![node](https://img.shields.io/node/v/facenet.svg?maxAge=604800)](https://nodejs.org/) [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)

A TensorFlow backed FaceNet implementation for Node.js, which can solve **face** _verification_, _recognition_ and _clustering_ problems.

![Google Facenet](https://huan.github.io/node-facenet/images/facenet.jpg)

FaceNet is a deep convolutional network designed by Google, trained to solve face verification, recognition and clustering problem with efficiently at scale.

1. directly learns a mapping from face images to a compact Euclidean space where distances directly correspond to a measure of face similarity.
1. optimize the embedding face recognition performance using only 128-bytes per face. 
1. achieves accuracy of 99.63% on Labeled Faces in the Wild (LFW) dataset, and 95.12% on YouTube Faces DB.

# INSTALL

```shell
$ npm install facenet numjs flash-store
```

### Peer Dependencies
1. `numjs`
1. `flash-store`

# EXAMPLE

The follow examples will give you some intuitions for using the code.

1. **demo** exmaple will show you how to do `align` for face alignment and `embedding` to get face feature vector.
1. **visualize** example will calculate the similarity between faces and draw them on the photo.

## 1. Demo for API Usage

TL;DR: Talk is cheap, show me the code!

```ts
import { Facenet } from 'facenet'

const facenet = new Facenet()

// Do Face Alignment, return faces
const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
const faceList = await facenet.align(imageFile)

for (const face of faceList) {
  console.info('bounding box:',  face.boundingBox)
  console.info('landmarks:',     face.facialLandmark)

  // Calculate Face Embedding, return feature vector
  const embedding = await facenet.embedding(face)
  console.info('embedding:', embedding)
}
faceList[0].embedding = await facenet.embedding(faceList[0])
faceList[1].embedding = await facenet.embedding(faceList[1])
console.info('distance between the different face: ', faceList[0].distance(faceList[1]))
console.info('distance between the same face:      ', faceList[0].distance(faceList[0]))
```

Full source code can be found at here: <https://github.com/huan/node-facenet/blob/master/examples/demo.ts>

The output should be something like:

```shell
image file: /home/zixia/git/facenet/examples/../tests/fixtures/two-faces.jpg
face file: 1-1.jpg
bounding box: {
  p1: { x: 360, y: 95 }, 
  p2: { x: 589, y: 324 } 
}
landmarks: { 
  leftEye:  { x: 441, y: 181 },
  rightEye: { x: 515, y: 208 },
  nose:     { x: 459, y: 239 },
  leftMouthCorner:  { x: 417, y: 262 },
  rightMouthCorner: { x: 482, y: 285 } 
}
embedding: array([ 0.02453, 0.03973, 0.05397, ..., 0.10603, 0.15305,-0.07288])

face file: 1-2.jpg
bounding box: { 
  p1: { x: 142, y: 87 }, 
  p2: { x: 395, y: 340 } 
}
landmarks: { 
  leftEye:  { x: 230, y: 186 },
  rightEye: { x: 316, y: 197 },
  nose:     { x: 269, y: 257 },
  leftMouthCorner:  { x: 223, y: 273 },
  rightMouthCorner: { x: 303, y: 281 } 
}
embedding: array([ 0.03241, -0.0737,  0.0475, ..., 0.07235, 0.12581,-0.00817])
```

## 2. Visualize for Intuition

![FaceNet Visualization](https://huan.github.io/node-facenet/images/landing-twins-ricky-martin-visualized.jpg)

1. Face is in the green rectangle.
1. Similarity(distance) between faces showed as a number in the middle of the line.
1. To identify if two faces belong to the same person, we could use an experiential threshold of distance: 0.75.

```shell
$ git clone git@github.com:zixia/node-facenet.git
$ cd facenet
$ npm install
$ npm run example:visualize

01:15:43 INFO CLI Visualized image saved to:  facenet-visulized.jpg
```

## 3. Get the diffence of two face

Get the two face's distance, the smaller the number is, the similar of the two face 

```ts
import { Facenet } from 'facenet'

const facenet = new Facenet()
const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`

const faceList = await facenet.align(imageFile)
faceList[0].embedding = await facenet.embedding(faceList[0])
faceList[1].embedding = await facenet.embedding(faceList[1])
console.info('distance between the different face: ', faceList[0].distance(faceList[1]))
console.info('distance between the same face:      ', faceList[0].distance(faceList[0]))
```
Output:  
distance between the different face:  1.2971515811057608   
distance between the same face:       0

In the example,   
faceList[0] is totally the same with faceList[0], so the number is 0   
faceList[1] is different with faceList[1], so the number is big.    
If the number is smaller than 0.75, maybe they are the same person.   

Full source code can be found at here: <https://github.com/huan/node-facenet/blob/master/examples/distance.ts>

## 4. Save the face picture from a picture

Recognize the face and save the face to local file.

```ts
import { Facenet } from 'facenet'

const facenet = new Facenet()
const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`

const faceList = await facenet.align(imageFile)
for (const face of faceList) {
  await face.save(face.md5 + '.jpg')
  console.info(`save face ${face.md5} successfuly`)
}
console.info(`Save ${faceList.length} faces from the imageFile`)
```

Full source code can be found at here: <https://github.com/huan/node-facenet/blob/master/examples/get-face.ts>

FACENET MANAGER
----------------

**UNDER HEAVY DEVELOPMENT NOW**

Roadmap: release facenet-manager on version 0.8

[![asciicast](https://asciinema.org/a/113686.png)](https://asciinema.org/a/113686?autoplay=1)
> The above ascii recording is just for demo purpose. Will replace it with facenet-manager later.

# DOCUMENT

See [auto generated docs](https://huan.github.io/node-facenet)

# INSTALL & REQUIREMENT

```shell
$ npm install facenet
```

## OS

Supported:
- [x] Linux
- [x] Mac
- [ ] Windows

## Dependency

1. Node.js >= 7 (**8** is recommend)
1. Tensorflow >= 1.2
1. Python3 >=3.5 (**3.6** is recommend)

Make sure you run those commands under Ubuntu 17.04:

```shell
sudo apt install python3-pip
pip3 install setuptools --upgrade

```

## Ram

| Neural Network Model | Task                |  Ram  |
| ---                  | ---                 |  ---  |
| MTCNN                | Facenet#align()     | 100MB |
| Facenet              | Facenet#embedding() | 2GB   |

If you are dealing with very large images(like 3000x3000 pixels), there will need additional 1GB of memory.

So I believe that Facenet will need at least 2GB memory, and >=4GB is recommended.

# API

Neural Network alone is not enough. It's Neural Network married with pre-trained model, married with easy to use APIs, that yield us the result that makes our APP sing.

Facenet is designed for bring the state-of-art neural network with bleeding-edge technology to full stack developers.

## Facenet

```ts
import { Facenet } from 'facenet'

const facenet = new Facenet()
facenet.quit()
```

### 1. Facenet#align(filename: string): Promise\<Face[]\>

Do face alignment for the image, return a list of faces.

### 2. Facenet#embedding(face: Face): Promise\<FaceEmbedding\>

Get the embedding for a face.

```ts
face.embedding = await facenet.embedding(face)
```

## Face

Get the 128 dim embedding vector for this face.(After alignment)

```ts
import { Face } from 'facenet'

console.info('bounding box:',  face.boundingBox)
console.info('landmarks:',     face.facialLandmark)
console.info('embedding:',     face.embedding)
```

# ENVIRONMENT VARIABLES

## FACENET_MODEL

FaceNet neural network model files, set to other version of model as you like.

Default is set to `models/` directory inside project directory. The pre-trained models is come from [20170512-110547, 0.992, MS-Celeb-1M, Inception ResNet v1](https://github.com/davidsandberg/facenet/wiki), which will be download & save automatically by `postinstall` script.

```shell
$ pwd
/home/zixia/git/node-facenet

$ ls models/
20170512-110547.pb
model-20170512-110547.ckpt-250000.index
model-20170512-110547.ckpt-250000.data-00000-of-00001
model-20170512-110547.meta
```

# DOCKER

[![Docker Pulls](https://img.shields.io/docker/pulls/zixia/facenet.svg?maxAge=2592000)](https://hub.docker.com/r/zixia/facenet/) [![Docker Stars](https://img.shields.io/docker/stars/zixia/facenet.svg?maxAge=2592000)](https://hub.docker.com/r/zixia/facenet/) [![Docker Layers](https://images.microbadger.com/badges/image/zixia/facenet.svg)](https://microbadger.com/#/images/zixia/facenet)

# DEVELOP

[![Issue Stats](http://issuestats.com/github/huan/node-facenet/badge/pr)](http://issuestats.com/github/huan/node-facenet) [![Issue Stats](http://issuestats.com/github/huan/node-facenet/badge/issue)](http://issuestats.com/github/huan/node-facenet) [![Coverage Status](https://coveralls.io/repos/github/huan/node-facenet/badge.svg?branch=master)](https://coveralls.io/github/huan/node-facenet?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/huan/node-facenet.svg)](https://greenkeeper.io/)

```shell
$ git clone git@github.com:zixia/node-facenet.git
$ cd facenet
$ npm install
$ npm test
```

# COMMAND LINE INTERFACES


## align

Draw a rectangle with five landmarks on all faces in the input\_image, save it to output\_image.

```shell
$ ./node_modules/.bin/ts-node bin/align.ts input_image output_image
```

## embedding

Output the 128 dim embedding vector of the face image.

```shell
$ ./node_modules/.bin/ts-node bin/embedding.ts face_image
```


# RESOURCES

## Machine Learning
* [Machine Learning is Fun! Part 4: Modern Face Recognition with Deep Learning](https://medium.com/@ageitgey/machine-learning-is-fun-part-4-modern-face-recognition-with-deep-learning-c3cffc121d78)
* [Face recognition using Tensorflow](https://github.com/davidsandberg/facenet)
* [Google: Our new system for recognizing faces is the best one ever](https://fortune.com/2015/03/17/google-facenet-artificial-intelligence/)
* [A tensorflow implementation of "Deep Convolutional Generative Adversarial Networks](http://carpedm20.github.io/faces/)
* [What does Locality Sensitive Hashing Forests do? · maheshakya/my_first_project Wiki](https://github.com/maheshakya/my_first_project/wiki/What-does-Locality-Sensitive-Hashing-Forests-do%3F)
* [Average Face : OpenCV ( C++ / Python ) Tutorial](https://www.learnopencv.com/average-face-opencv-c-python-tutorial/) 

## Python3

* [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)
* [PyLint, PyChecker or PyFlakes?](https://stackoverflow.com/questions/1428872/pylint-pychecker-or-pyflakes)
* [Useful Python Modules: Flake8](https://dancallahan.info/journal/python-flake8/)
* [PEP 8 - Style Guide for Python Code](https://www.python.org/dev/peps/pep-0008/)
* [Python 3.6 venv — Creation of virtual environments](https://docs.python.org/3.6/library/venv.html)

### 1. Typing

* [Mypy syntax cheat sheet (Python 3)](mypy.readthedocs.io/en/latest/cheat_sheet_py3.html)
* [Python 3 Type Hints and Static Analysis](https://code.tutsplus.com/tutorials/python-3-type-hints-and-static-analysis--cms-25731)
* [typing — Support for type hints](https://docs.python.org/3/library/typing.html)

### 1. NumJS

* [Stackoverflow: numpy-like package for node](https://stackoverflow.com/questions/31412537/numpy-like-package-for-node)
* [Read/manipulate/display images using NumJs](https://jsfiddle.net/nicolaspanel/047gwg0q/)
* [Numjs - Like NumPy, in JavaScript](https://github.com/nicolaspanel/numjs)
* [ndarray - Modular multidimensional arrays for JavaScript](https://github.com/scijs/ndarray)

## Dataset

1. [LFW - Labeled Faces in the Wild](http://vis-www.cs.umass.edu/lfw/)

# TODO

- [x] NPM Module: `facenet`
- [x] Docker Image: `zixia/facenet`
- [ ] Examples
    - [x] API Usage Demo
    - [x] Triple Distance Visulization Demo
    - [ ] Performance Test(Align/Embedding/Batch)
    - [ ] Validation Test(LFW Accuracy)
- [ ] Neural Network Models
    - [x] Facenet
    - [x] Mtcnn
    - [ ] Batch Support
- [ ] ~~Python3 `async` & `await`~~
- [ ] Divide Different Neural Network to seprate class files(e.g. Facenet/Mtcnn)
- [x] K(?)NN Alghorithm [Chinese Whispers](https://github.com/huan/chinese-whispers)
- [ ] TensorFlow Sereving
- [ ] OpenAPI Specification(Swagger)

# INSPIRATION

This repository is heavily inspired by the following implementations:

* [FaceNet](https://github.com/davidsandberg/facenet) by David Sandberg @[davidsandberg](https://github.com/davidsandberg)
* [OpenFace](https://github.com/cmusatyalab/openface) by CMU Satya Lab @[cmusatyalab](https://github.com/cmusatyalab)

# CREDITS

1. Face alignment using MTCNN: [Joint Face Detection and Alignment using Multi-task Cascaded Convolutional Networks](https://kpzhang93.github.io/MTCNN_face_detection_alignment/index.html)
1. Face embedding using FaceNet: [FaceNet: A Unified Embedding for Face Recognition and Clustering](https://arxiv.org/abs/1503.03832)
1. TensorFlow implementation of the face recognizer: [Face recognition using Tensorflow](https://github.com/davidsandberg/facenet)

# CONTRIBUTE

## FaceNet Badge

[![Powered by FaceNet](https://img.shields.io/badge/Powered%20By-FaceNet-green.svg)](https://github.com/huan/node-facenet)

```markdown
[![Powered by FaceNet](https://img.shields.io/badge/Powered%20By-FaceNet-green.svg)](https://github.com/huan/node-facenet)
```

# CHANGELOG

## v0.9 master unstable

## v0.8 (Apr 2018)

1. Added `facenet-manager` command line tool for demo/validate/sort photos
1. Switch to `FlashStore` npm module as key-value database

## v0.3 Sep 2017

1. Added three cache classes: AlignmentCache & EmbeddingCache & FaceCache.
1. Added cache manager utilities: embedding-cache-manager & alignment-cache-manager & face-cache-manager
1. Added Dataset manager utility: lfw-manager (should be dataset-manager in future)
1. BREAKING CHANGE: `Face` class refactoring.

## v0.2 Aug 2017 (BREAKING CHANGES)

1. `Facenet#align()` now accept a filename string as parameter.
1. BREAKING CHANGE: `FaceImage` class had been removed.
1. BREAKING CHANGE: `Face` class refactoring.

## v0.1 Jul 2017

1. `npm run demo` to visuliaze the face alignment and distance(embedding) in a three people photo.
1. Facenet.align() to do face alignment
1. Facenet.embedding() to calculate the 128 dim feature vector of face
1. Initial workable version

TROUBLESHOOTING
---------------

### Dependencies

OS    | Command
----- | -----
os x | `brew install pkg-config cairo pango libpng jpeg giflib`
ubuntu | `sudo apt-get install libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++`
fedora | `sudo yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel giflib-devel`
solaris | `pkgin install cairo pango pkg-config xproto renderproto kbproto xextproto`
windows | [instructions on our wiki](https://github.com/automattic/node-canvas/wiki/installation---windows)

more os see [node-canvas Wiki](https://github.com/Automattic/node-canvas/wiki/_pages).

# FAQ

1. `facenet-manager` display not right under Windows

See: [Running Terminal Dashboards on Windows](http://webservices20.blogspot.co.uk/2015/04/running-terminal-dashboards-on-windows.html)

2. Error when install: `No package 'XXX' found`

It's related with the NPM module `canvas`.

Error messages:
1. `No package 'pixman-1' found`
2. `No package 'cairo' found`
3. `No package 'pangocairo' found`

Solution for Ubuntu 17.04: 
```shell
sudo apt install -y libpixman-1-dev
sudo apt-get install -y libcairo2-dev
sudo apt-get install -y libpango1.0-dev
```

Solution for Mac:
```shell
brew install python3
brew install pkg-config
brew install cairo
brew install pango
brew install libpng
brew install libjpeg
```

3. Error when install: `fatal error: jpeglib.h: No such file or directory`

It's related with the NPM module `canvas`.

Solution for Ubuntu 17.04:
```shell
sudo apt-get install -y libjpeg-dev
```

4. Error when run: `Error: error while reading from input stream`

It is related with the `libjpeg` package

Solution for Mac:
```
brew install libjpeg
```

5. Error when run: 
```
Error: Cannot find module '../build/Release/canvas.node'
    at Function.Module._resolveFilename (module.js:527:15)
    at Function.Module._load (module.js:476:23)
    at Module.require (module.js:568:17)
    at require (internal/module.js:11:18)
    at Object.<anonymous> (/Users/jiaruili/git/node-facenet/node_modules/canvas/lib/bindings.js:3:18)
    at Module._compile (module.js:624:30)
    at Object.Module._extensions..js (module.js:635:10)
    at Module.load (module.js:545:32)
    at tryModuleLoad (module.js:508:12)
    at Function.Module._load (module.js:500:3)
```
It seems the package not installed in a right way, like `sharp`, `canvas`, remove the package and reinstall it.

run 
```
rm -rf node node_modules/canvas
// if sharp, then remove sharp folder
npm install
```

6. Error when install
```
> facenet@0.3.19 postinstall:models /Users/jiaruili/git/rui/node-facenet
> set -e && if [ ! -d models ]; then mkdir models; fi && cd models && if [ ! -f model.tar.bz2 ]; then curl --location --output model.tar.bz2.tmp https://github.com/huan/node-facenet/releases/download/v0.1.9/model-20170512.tar.bz2; mv model.tar.bz2.tmp model.tar.bz2; fi && tar jxvf model.tar.bz2 && cd -

x 20170512-110547.pb
x model-20170512-110547.ckpt-250000.data-00000-of-00001: (Empty error message)
tar: Error exit delayed from previous errors.
```

It seems this because not get the full model file successfully. See [#issue63](https://github.com/huan/node-facenet/issues/63)

Solution:    

download the file from https://github.com/huan/node-facenet/releases/download/v0.1.9/model-20170512.tar.bz2     
rename the file `model.tar.bz2` and move it to the folder `models`
try `npm install` again

SEE ALSO
--------
1. [Face Blinder](https://github.com/huan/face-blinder): Assitant Bot for Whom is Suffering form Face Blindess
1. [Wechaty Blinder](https://github.com/huan/wechaty-blinder): Face Blinder Bot Powered by Wechaty

# AUTHOR

Huan LI \<zixia@zixia.net\> (http://linkedin.com/in/zixia)

<a href="http://stackoverflow.com/users/1123955/zixia">
  <img src="http://stackoverflow.com/users/flair/1123955.png" width="208" height="58" alt="profile for zixia at Stack Overflow, Q&amp;A for professional and enthusiast programmers" title="profile for zixia at Stack Overflow, Q&amp;A for professional and enthusiast programmers">
</a>

# COPYRIGHT & LICENSE

* Code & Docs © 2017 Huan LI \<zixia@zixia.net\>
* Code released under the Apache-2.0 License
* Docs released under Creative Commons
