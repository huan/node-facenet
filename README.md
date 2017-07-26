# facenet

FaceNet OpenAPI Specification & Docker Microservices & Node.js Module

<img src="https://zixia.github.io/facenet/images/facenet.jpg" alt="Google Facenet" width="30%">

FaceNet is a deep convolutional network designed by Google, trained to solve face verification, recognition and clustering problem with efficiently at scale.

1. directly learns a mapping from face images to a compact Euclidean space where distances directly correspond to a measure of face similarity.
1. optimize the embedding face recognition performance using only 128-bytes per face. 
1. achieves accuracy of 99.63% on Labeled Faces in the Wild (LFW) dataset, and 95.12% on YouTube Faces DB.

> See: [FaceNet: A Unified Embedding for Face Recognition and Clustering](https://arxiv.org/abs/1503.03832)

# Under Construction

## Please come back after 2 weeks.

### Todo

1. [ ] NPM Module: `facenet`
1. [ ] Docker Image: `zixia/facenet`
1. [ ] TensorFlow Sereving
1. [ ] OpenAPI Specification(Swagger)
1. [ ] Examples


#### Train

```shell
python src/classifier.py TRAIN /facenet/training-images-mtcnn-182/ /facenet/models/facenet/20170512-110547/20170512-110547.pb /facenet/models/my_classifier.pkl --batch_size 1000
```

#### Classify

```shell
python src/classifier.py CLASSIFY /facenet/training-images-mtcnn-182/ /facenet/models/facenet/20170512-110547/20170512-110547.pb /facenet/models/my_classifier.pkl --batch_size 1000
```

### Tutorials

* [Machine Learning is Fun! Part 4: Modern Face Recognition with Deep Learning](https://medium.com/@ageitgey/machine-learning-is-fun-part-4-modern-face-recognition-with-deep-learning-c3cffc121d78)

### Resources

* [Face recognition using Tensorflow](https://github.com/davidsandberg/facenet)
* [Google: Our new system for recognizing faces is the best one ever](https://fortune.com/2015/03/17/google-facenet-artificial-intelligence/)
* [A tensorflow implementation of "Deep Convolutional Generative Adversarial Networks](http://carpedm20.github.io/faces/)

#### Python

* [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)
* [PyLint, PyChecker or PyFlakes?](https://stackoverflow.com/questions/1428872/pylint-pychecker-or-pyflakes)
* [Useful Python Modules: Flake8](https://dancallahan.info/journal/python-flake8/)
* [PEP 8 - Style Guide for Python Code](https://www.python.org/dev/peps/pep-0008/)

##### Typing

* [Mypy syntax cheat sheet (Python 3)](mypy.readthedocs.io/en/latest/cheat_sheet_py3.html)
* [Python 3 Type Hints and Static Analysis](https://code.tutsplus.com/tutorials/python-3-type-hints-and-static-analysis--cms-25731)
* [typing — Support for type hints](https://docs.python.org/3/library/typing.html)

#### Discussion

* [Stackoverflow: numpy-like package for node](https://stackoverflow.com/questions/31412537/numpy-like-package-for-node)
* [Read/manipulate/display images using NumJs](https://jsfiddle.net/nicolaspanel/047gwg0q/)
* [Numjs - Like NumPy, in JavaScript](https://github.com/nicolaspanel/numjs)
* [ndarray - Modular multidimensional arrays for JavaScript](https://github.com/scijs/ndarray)

#### Algorithm

* [What does Locality Sensitive Hashing Forests do? · maheshakya/my_first_project Wiki](https://github.com/maheshakya/my_first_project/wiki/What-does-Locality-Sensitive-Hashing-Forests-do%3F)


## Develop

```shell
apt install mypy flake8
pip install flake8-commas  # missing trailing comma
```

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
