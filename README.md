# FaceNet Node.js Module

[![Join the chat at https://gitter.im/node-facenet/Lobby](https://badges.gitter.im/node-facenet/Lobby.svg)](https://gitter.im/node-facenet/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/zixia/facenet.svg?branch=master)](https://travis-ci.org/zixia/facenet)

FaceNet Node.js Module for easy face recognition, verification and clustering.

<img src="https://zixia.github.io/facenet/images/facenet.jpg" alt="Google Facenet" width="30%">

FaceNet is a deep convolutional network designed by Google, trained to solve face verification, recognition and clustering problem with efficiently at scale.

1. directly learns a mapping from face images to a compact Euclidean space where distances directly correspond to a measure of face similarity.
1. optimize the embedding face recognition performance using only 128-bytes per face. 
1. achieves accuracy of 99.63% on Labeled Faces in the Wild (LFW) dataset, and 95.12% on YouTube Faces DB.

> See: [FaceNet: A Unified Embedding for Face Recognition and Clustering](https://arxiv.org/abs/1503.03832)

## Credits

* Face alignment using MTCNN: [Joint Face Detection and Alignment using Multi-task Cascaded Convolutional Networks](https://kpzhang93.github.io/MTCNN_face_detection_alignment/index.html)
* Face embedding using FaceNet: [FaceNet: A Unified Embedding for Face Recognition and Clustering](https://arxiv.org/abs/1503.03832)
* TensorFlow implementation of the face recognizer: [Face recognition using Tensorflow](https://github.com/davidsandberg/facenet)

## Example

TL;DR: Talk is cheap, show me the code!

```ts
import { Facenet, FaceImage } from 'facenet'

const facenet = new Facenet()

// Load image from file
const imageFile = `${__dirname}/../tests/fixtures/two-faces.jpg`
const image = new FaceImage(imageFile)

// Do Face Alignment, return faces
const faceList = await facenet.align(image)

for (const face of faceList) {
  // Calculate Face Embedding, return feature vector
  const embedding = await facenet.embedding(face)
  assert(face.embedding === embedding)

  console.log('bounding box:',  face.boundingBox)
  console.log('landmarks:',     face.facialLandmark)
  console.log('embedding:',     face.embedding)
}
```

Full source code can be found at here: <https://github.com/zixia/facenet/blob/master/examples/demo.ts>

Try it by run:

```shell
$ npm run demo
```

### align

Draw a rectangle with five landmarks on all faces in the image.

```shell
$ ts-node bin/align.ts input_image output_image
```

### embedding

Output the 128 dim embedding vector of the face image.

```shell
$ ts-node bin/embedding.ts face_image
```

## Requirement

| Neural Network Model | Task |   Ram  |
| ---                  | ---       |   ---  |
| MTCNN                | Facenet#align()     | 100MB |
| Facenet              | Facenet#embedding() | 1GB   |

If you are dealing with very large images(like 3000x3000 pixels), there will need additional 1GB of memory.

So I believe that Facenet will need at least 2GB memory, >=4GB is recommended.

## API

### Facenet

```ts
import { Facenet } from 'facenet'

const facenet = new Facenet()
facenet.quit()
```

#### 1. Facenet#align(image: FaceImage): Promise<Face[]>

Do face alignment for the image, return a list of faces.

#### 2. Facenet#embedding(face: Face): Promise<FaceEmbedding>

Get the embedding for a face.

### FaceImage

```ts
import { FaceImage } from 'facenet'

const image = new FaceImage('tests/fixtures/two-faces.jpg')
image.resize(160, 160)
image.save('/tmp/image.jpg')
```

### Face

Get the 128 dim embedding vector for this face.(After alignment)

```ts
import { Face } from 'facenet'

console.log('bounding box:',  face.boundingBox)
console.log('landmarks:',     face.facialLandmark)
console.log('embedding:',     face.embedding)

face.image.save('/tmp/face.jpg')
```

## Environment Variables

### FACENET_MODEL

FaceNet neural network model files, set to other version of model as you like.

Default is set to `models/` directory inside project directory. The pre-trained models is come from [20170512-110547, 0.992, MS-Celeb-1M, Inception ResNet v1](https://github.com/davidsandberg/facenet/wiki), which will be download & save automatically by `postinstall` script.

```shell
$ pwd
/home/zixia/git/facenet

$ ls models/
20170512-110547.pb
model-20170512-110547.ckpt-250000.index
model-20170512-110547.ckpt-250000.data-00000-of-00001
model-20170512-110547.meta
```

## Develop

```shell
npm install
npm test
```

## Resources

### Machine Learning
* [Machine Learning is Fun! Part 4: Modern Face Recognition with Deep Learning](https://medium.com/@ageitgey/machine-learning-is-fun-part-4-modern-face-recognition-with-deep-learning-c3cffc121d78)
* [Face recognition using Tensorflow](https://github.com/davidsandberg/facenet)
* [Google: Our new system for recognizing faces is the best one ever](https://fortune.com/2015/03/17/google-facenet-artificial-intelligence/)
* [A tensorflow implementation of "Deep Convolutional Generative Adversarial Networks](http://carpedm20.github.io/faces/)
* [What does Locality Sensitive Hashing Forests do? · maheshakya/my_first_project Wiki](https://github.com/maheshakya/my_first_project/wiki/What-does-Locality-Sensitive-Hashing-Forests-do%3F)

### Python

* [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)
* [PyLint, PyChecker or PyFlakes?](https://stackoverflow.com/questions/1428872/pylint-pychecker-or-pyflakes)
* [Useful Python Modules: Flake8](https://dancallahan.info/journal/python-flake8/)
* [PEP 8 - Style Guide for Python Code](https://www.python.org/dev/peps/pep-0008/)
* [Python 3.6 venv — Creation of virtual environments](https://docs.python.org/3.6/library/venv.html)

#### Typing

* [Mypy syntax cheat sheet (Python 3)](mypy.readthedocs.io/en/latest/cheat_sheet_py3.html)
* [Python 3 Type Hints and Static Analysis](https://code.tutsplus.com/tutorials/python-3-type-hints-and-static-analysis--cms-25731)
* [typing — Support for type hints](https://docs.python.org/3/library/typing.html)

#### NumJS

* [Stackoverflow: numpy-like package for node](https://stackoverflow.com/questions/31412537/numpy-like-package-for-node)
* [Read/manipulate/display images using NumJs](https://jsfiddle.net/nicolaspanel/047gwg0q/)
* [Numjs - Like NumPy, in JavaScript](https://github.com/nicolaspanel/numjs)
* [ndarray - Modular multidimensional arrays for JavaScript](https://github.com/scijs/ndarray)

## Todo

1. [x] NPM Module: `facenet`
1. [x] Docker Image: `zixia/facenet`
1. [ ] TensorFlow Sereving
1. [ ] OpenAPI Specification(Swagger)
1. [x] Examples

## Inspiration

This repository is heavily inspired by the following implementations:

* [FaceNet](https://github.com/davidsandberg/facenet) by David Sandberg @[davidsandberg](https://github.com/davidsandberg)
* [OpenFace](https://github.com/cmusatyalab/openface) by CMU Satya Lab @[cmusatyalab](https://github.com/cmusatyalab)

Author
------
Huan LI \<zixia@zixia.net\> (http://linkedin.com/in/zixia)

<a href="http://stackoverflow.com/users/1123955/zixia">
  <img src="http://stackoverflow.com/users/flair/1123955.png" width="208" height="58" alt="profile for zixia at Stack Overflow, Q&amp;A for professional and enthusiast programmers" title="profile for zixia at Stack Overflow, Q&amp;A for professional and enthusiast programmers">
</a>

Copyright & License
-------------------
* Code & Docs © 2017 Huan LI \<zixia@zixia.net\>
* Code released under the Apache-2.0 License
* Docs released under Creative Commons
